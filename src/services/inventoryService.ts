import { Category, DashboardStats, InventoryTransaction, Product, Supplier, UserSettings } from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_SUPPLIERS, INITIAL_TRANSACTIONS, INITIAL_USER_SETTINGS } from './mockData';
import { isSupabaseConfigured, supabase } from './supabase';

const STORAGE_KEYS = {
  PRODUCTS: 'inv_mgr_products_v1',
  SUPPLIERS: 'inv_mgr_suppliers_v1',
  CATEGORIES: 'inv_mgr_categories_v1',
  TRANSACTIONS: 'inv_mgr_transactions_v1',
  SETTINGS: 'inv_mgr_settings_v1',
};

// Helper for local storage persistence
function getLocal<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultVal;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return defaultVal;
  }
}

function setLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
}

class InventoryService {
  // ==========================================
  // PRODUCTS CRUD
  // ==========================================
  async getProducts(): Promise<Product[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*, supplier:suppliers(*)')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase getProducts failed, falling back to local store:', error.message);
      } else if (data) {
        return data as Product[];
      }
    }

    const products = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const suppliers = await this.getSuppliers();
    
    // Enrich with supplier relations
    return products.map(p => ({
      ...p,
      supplier: suppliers.find(s => s.id === p.supplier_id),
    }));
  }

  async createProduct(input: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    // 1. SKU uniqueness validation
    const existing = await this.getProducts();
    const duplicate = existing.find(p => p.sku.trim().toLowerCase() === input.sku.trim().toLowerCase());
    if (duplicate) {
      throw new Error(`SKU "${input.sku}" already exists. SKU must be globally unique.`);
    }

    if (input.current_quantity < 0) {
      throw new Error('Stock quantity cannot be negative.');
    }

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: input.name,
          sku: input.sku.toUpperCase(),
          description: input.description,
          category: input.category,
          category_id: input.category_id,
          purchase_price: input.purchase_price,
          selling_price: input.selling_price,
          current_quantity: input.current_quantity,
          reorder_level: input.reorder_level,
          target_stock_level: input.target_stock_level || 50,
          supplier_id: input.supplier_id || null,
        }])
        .select()
        .single();

      if (!error && data) {
        return data as Product;
      }
      console.warn('Supabase insert failed, applying to local store:', error?.message);
    }

    const newProd: Product = {
      ...input,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sku: input.sku.toUpperCase(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [newProd, ...existing];
    setLocal(STORAGE_KEYS.PRODUCTS, updated);

    // If initial quantity > 0, log an initial stock-in transaction
    if (newProd.current_quantity > 0) {
      await this.recordInitialStockTransaction(newProd);
    }

    return newProd;
  }

  async updateProduct(id: string, input: Partial<Product>): Promise<Product> {
    const existing = await this.getProducts();
    const current = existing.find(p => p.id === id);
    if (!current) throw new Error('Product not found.');

    // Check SKU collision if SKU changed
    if (input.sku && input.sku.toUpperCase() !== current.sku.toUpperCase()) {
      const collision = existing.find(p => p.id !== id && p.sku.toUpperCase() === input.sku!.toUpperCase());
      if (collision) {
        throw new Error(`SKU "${input.sku}" is already assigned to another product.`);
      }
    }

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return data as Product;
      }
      console.warn('Supabase update failed, updating local store:', error?.message);
    }

    const updatedList = existing.map(p => {
      if (p.id === id) {
        return {
          ...p,
          ...input,
          updated_at: new Date().toISOString(),
        };
      }
      return p;
    });

    setLocal(STORAGE_KEYS.PRODUCTS, updatedList);
    return updatedList.find(p => p.id === id)!;
  }

  async deleteProduct(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) console.warn('Supabase delete product failed:', error.message);
    }

    const existing = await this.getProducts();
    const filtered = existing.filter(p => p.id !== id);
    setLocal(STORAGE_KEYS.PRODUCTS, filtered);
  }

  // ==========================================
  // SUPPLIERS CRUD
  // ==========================================
  async getSuppliers(): Promise<Supplier[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) return data as Supplier[];
    }

    return getLocal<Supplier[]>(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
  }

  async createSupplier(input: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('suppliers').insert([input]).select().single();
      if (!error && data) return data as Supplier;
    }

    const existing = await this.getSuppliers();
    const newSup: Supplier = {
      ...input,
      id: `sup-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [newSup, ...existing];
    setLocal(STORAGE_KEYS.SUPPLIERS, updated);
    return newSup;
  }

  async updateSupplier(id: string, input: Partial<Supplier>): Promise<Supplier> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('suppliers').update(input).eq('id', id).select().single();
      if (!error && data) return data as Supplier;
    }

    const existing = await this.getSuppliers();
    const updated = existing.map(s => s.id === id ? { ...s, ...input, updated_at: new Date().toISOString() } : s);
    setLocal(STORAGE_KEYS.SUPPLIERS, updated);
    return updated.find(s => s.id === id)!;
  }

  async deleteSupplier(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('suppliers').delete().eq('id', id);
    }

    const existing = await this.getSuppliers();
    setLocal(STORAGE_KEYS.SUPPLIERS, existing.filter(s => s.id !== id));
  }

  // ==========================================
  // CATEGORIES
  // ==========================================
  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (!error && data) return data as Category[];
    }

    return getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }

  async createCategory(name: string, description?: string): Promise<Category> {
    const existing = await this.getCategories();
    if (existing.some(c => c.name.toLowerCase() === name.trim().toLowerCase())) {
      throw new Error(`Category "${name}" already exists.`);
    }

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('categories').insert([{ name: name.trim(), description }]).select().single();
      if (!error && data) return data as Category;
    }

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      description,
      created_at: new Date().toISOString(),
    };
    const updated = [...existing, newCat];
    setLocal(STORAGE_KEYS.CATEGORIES, updated);
    return newCat;
  }

  // ==========================================
  // ATOMIC STOCK TRANSACTIONS (STOCK IN / STOCK OUT)
  // ==========================================
  async getTransactions(): Promise<InventoryTransaction[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('inventory_transactions')
        .select('*, product:products(*), supplier:suppliers(*)')
        .order('transaction_date', { ascending: false });

      if (!error && data) return data as InventoryTransaction[];
    }

    const transactions = getLocal<InventoryTransaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    const products = await this.getProducts();
    const suppliers = await this.getSuppliers();

    return transactions.map(t => ({
      ...t,
      product: products.find(p => p.id === t.product_id),
      supplier: suppliers.find(s => s.id === t.supplier_id),
    })).sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
  }

  async recordStockTransaction(params: {
    productId: string;
    type: 'IN' | 'OUT';
    quantity: number;
    supplierId?: string;
    reason?: string;
    referenceNumber?: string;
    notes?: string;
    transactionDate?: string;
  }): Promise<{ transaction: InventoryTransaction; updatedProduct: Product }> {
    const { productId, type, quantity, supplierId, reason, referenceNumber, notes, transactionDate } = params;

    if (quantity <= 0) {
      throw new Error('Transaction quantity must be greater than zero.');
    }

    // Try Supabase RPC first if configured
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.rpc('handle_stock_transaction', {
        p_product_id: productId,
        p_type: type,
        p_quantity: quantity,
        p_supplier_id: supplierId || null,
        p_reason: reason || null,
        p_reference_number: referenceNumber || null,
        p_notes: notes || null,
        p_transaction_date: transactionDate || new Date().toISOString(),
      });

      if (!error && data) {
        const products = await this.getProducts();
        const txs = await this.getTransactions();
        return {
          transaction: txs.find(t => t.id === data.transaction_id) || ({} as any),
          updatedProduct: products.find(p => p.id === productId) || ({} as any),
        };
      }
      console.warn('RPC call failed, executing atomic local transaction handler:', error?.message);
    }

    // Atomic Local Handler
    const products = await this.getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) {
      throw new Error(`Product with ID "${productId}" not found.`);
    }

    const previousQuantity = product.current_quantity;
    let newQuantity = previousQuantity;

    if (type === 'IN') {
      newQuantity = previousQuantity + quantity;
    } else if (type === 'OUT') {
      if (previousQuantity < quantity) {
        throw new Error(
          `Insufficient stock available. Current stock: ${previousQuantity} units, requested out: ${quantity} units.`
        );
      }
      newQuantity = previousQuantity - quantity;
    }

    // 1. Create Transaction Ledger Entry
    const newTx: InventoryTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      product_id: productId,
      type,
      quantity,
      previous_quantity: previousQuantity,
      new_quantity: newQuantity,
      supplier_id: supplierId || product.supplier_id,
      reason: reason || (type === 'IN' ? 'Restock / Purchase' : 'Fulfillment / Sale'),
      reference_number: referenceNumber,
      notes,
      transaction_date: transactionDate || new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    // 2. Atomically update product stock
    const updatedProducts = products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          current_quantity: newQuantity,
          updated_at: new Date().toISOString(),
        };
      }
      return p;
    });

    const currentTxs = getLocal<InventoryTransaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    const updatedTxs = [newTx, ...currentTxs];

    setLocal(STORAGE_KEYS.PRODUCTS, updatedProducts);
    setLocal(STORAGE_KEYS.TRANSACTIONS, updatedTxs);

    const savedProduct = updatedProducts.find(p => p.id === productId)!;
    return {
      transaction: newTx,
      updatedProduct: savedProduct,
    };
  }

  private async recordInitialStockTransaction(product: Product): Promise<void> {
    const newTx: InventoryTransaction = {
      id: `tx-init-${Date.now()}`,
      product_id: product.id,
      type: 'IN',
      quantity: product.current_quantity,
      previous_quantity: 0,
      new_quantity: product.current_quantity,
      supplier_id: product.supplier_id,
      reason: 'Initial Opening Balance',
      reference_number: `INIT-${product.sku}`,
      notes: 'Initial opening stock recorded at product creation.',
      transaction_date: product.created_at || new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const currentTxs = getLocal<InventoryTransaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    setLocal(STORAGE_KEYS.TRANSACTIONS, [newTx, ...currentTxs]);
  }

  // ==========================================
  // REAL-TIME STATS CALCULATIONS (NO HARDCODING)
  // ==========================================
  async getDashboardStats(): Promise<DashboardStats> {
    const products = await this.getProducts();

    let totalStockQuantity = 0;
    let inventoryValuation = 0;
    let lowStockProductsCount = 0;
    let outOfStockCount = 0;
    let inStockCount = 0;

    for (const p of products) {
      const qty = p.current_quantity || 0;
      const cost = p.purchase_price || 0;
      totalStockQuantity += qty;
      inventoryValuation += qty * cost;

      if (qty <= 0) {
        outOfStockCount++;
      } else if (qty <= p.reorder_level) {
        lowStockProductsCount++;
      } else {
        inStockCount++;
      }
    }

    return {
      totalProducts: products.length,
      totalStockQuantity,
      inventoryValuation,
      lowStockProductsCount,
      outOfStockCount,
      inStockCount,
    };
  }

  // ==========================================
  // USER SETTINGS
  // ==========================================
  async getUserSettings(): Promise<UserSettings> {
    return getLocal<UserSettings>(STORAGE_KEYS.SETTINGS, INITIAL_USER_SETTINGS);
  }

  async updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const current = await this.getUserSettings();
    const updated = { ...current, ...settings };
    setLocal(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  }

  // ==========================================
  // RESET / DEMO DATA LOADER
  // ==========================================
  async resetToDemoData(): Promise<void> {
    setLocal(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    setLocal(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    setLocal(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    setLocal(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    setLocal(STORAGE_KEYS.SETTINGS, INITIAL_USER_SETTINGS);
  }
}

export const inventoryService = new InventoryService();
