-- ============================================================================
-- INVENTORY MANAGER — COMPLETE DATABASE SCHEMA & ATOMIC TRANSACTIONS
-- Monochromatic Precision PostgreSQL Schema with Row Level Security (RLS)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    business_name TEXT DEFAULT 'Acme Inventory System',
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'operator')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. SUPPLIERS TABLE
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    category TEXT NOT NULL DEFAULT 'General',
    purchase_price NUMERIC(12, 2) NOT NULL CHECK (purchase_price >= 0),
    selling_price NUMERIC(12, 2) NOT NULL CHECK (selling_price >= 0),
    current_quantity INTEGER NOT NULL DEFAULT 0 CHECK (current_quantity >= 0),
    reorder_level INTEGER NOT NULL DEFAULT 10 CHECK (reorder_level >= 0),
    target_stock_level INTEGER DEFAULT 50 CHECK (target_stock_level >= 0),
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for lightning fast lookups & filtering
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON public.products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_quantity ON public.products(current_quantity);

-- 5. INVENTORY TRANSACTIONS TABLE (Immutable Movement Ledger)
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('IN', 'OUT')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    previous_quantity INTEGER NOT NULL CHECK (previous_quantity >= 0),
    new_quantity INTEGER NOT NULL CHECK (new_quantity >= 0),
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    reason TEXT, -- e.g. 'Purchase Order', 'Direct Sale', 'Damaged Stock', 'Internal Transfer', 'Cycle Count'
    reference_number TEXT, -- PO / Invoice / Return #
    notes TEXT,
    transaction_date TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_product ON public.inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.inventory_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.inventory_transactions(type);

-- 6. USER SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    business_name TEXT DEFAULT 'Acme Hardware & Supply Co.',
    currency_symbol TEXT DEFAULT '$',
    low_stock_threshold_default INTEGER DEFAULT 10,
    ai_restock_sensitivity TEXT DEFAULT 'standard' CHECK (ai_restock_sensitivity IN ('conservative', 'standard', 'aggressive')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- ATOMIC STORED FUNCTION: RECORD STOCK TRANSACTION
-- Executes with strict row-locking (FOR UPDATE) to prevent race conditions
-- and strictly enforces non-negative stock levels.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_stock_transaction(
    p_product_id UUID,
    p_type TEXT,
    p_quantity INTEGER,
    p_supplier_id UUID DEFAULT NULL,
    p_reason TEXT DEFAULT NULL,
    p_reference_number TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_transaction_date TIMESTAMPTZ DEFAULT NOW(),
    p_created_by UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_product RECORD;
    v_new_quantity INTEGER;
    v_transaction_id UUID;
    v_result JSONB;
BEGIN
    -- Validate transaction type
    IF p_type NOT IN ('IN', 'OUT') THEN
        RAISE EXCEPTION 'Invalid transaction type: %. Must be IN or OUT', p_type;
    END IF;

    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'Transaction quantity must be greater than zero. Given: %', p_quantity;
    END IF;

    -- Row-level exclusive lock on the product to prevent concurrent race conditions
    SELECT * INTO v_product
    FROM public.products
    WHERE id = p_product_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Product with ID % not found', p_product_id;
    END IF;

    -- Calculate new quantity based on transaction direction
    IF p_type = 'IN' THEN
        v_new_quantity := v_product.current_quantity + p_quantity;
    ELSIF p_type = 'OUT' THEN
        IF v_product.current_quantity < p_quantity THEN
            RAISE EXCEPTION 'Insufficient stock. Current: %, Requested OUT: %', v_product.current_quantity, p_quantity;
        END IF;
        v_new_quantity := v_product.current_quantity - p_quantity;
    END IF;

    -- Insert into immutable transaction ledger
    INSERT INTO public.inventory_transactions (
        product_id,
        type,
        quantity,
        previous_quantity,
        new_quantity,
        supplier_id,
        reason,
        reference_number,
        notes,
        transaction_date,
        created_by
    ) VALUES (
        p_product_id,
        p_type,
        p_quantity,
        v_product.current_quantity,
        v_new_quantity,
        p_supplier_id,
        p_reason,
        p_reference_number,
        p_notes,
        COALESCE(p_transaction_date, NOW()),
        p_created_by
    )
    RETURNING id INTO v_transaction_id;

    -- Update product stock level atomically
    UPDATE public.products
    SET 
        current_quantity = v_new_quantity,
        updated_at = NOW()
    WHERE id = p_product_id;

    -- Build return payload
    v_result := jsonb_build_object(
        'success', true,
        'transaction_id', v_transaction_id,
        'product_id', p_product_id,
        'type', p_type,
        'quantity', p_quantity,
        'previous_quantity', v_product.current_quantity,
        'new_quantity', v_new_quantity
    );

    RETURN v_result;
END;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- For single-tenant business workspace: authenticated users have full access to workspace records
CREATE POLICY "Allow authenticated read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated update profiles" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Allow authenticated all categories" ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated all suppliers" ON public.suppliers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated all products" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated all transactions" ON public.inventory_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated all settings" ON public.user_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow public read during initial bootstrapping/demo if required
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read products" ON public.products FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read suppliers" ON public.suppliers FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read transactions" ON public.inventory_transactions FOR SELECT TO anon USING (true);
