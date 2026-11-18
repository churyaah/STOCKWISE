# StockWise AI — Supabase Database & Backend Integration Guide

This guide provides the complete, production-grade instructions to configure **Supabase** (PostgreSQL database, Row Level Security, and Atomic Stored Procedures) for the **StockWise AI** inventory management platform, in accordance with the PRD specifications.

---

## 1. Architecture Overview

StockWise AI uses a dual-engine architecture:
- **Cloud Mode**: Direct client-side connection to Supabase via `@supabase/supabase-js`, enforcing PostgreSQL Row Level Security (RLS) and executing atomic stock operations with row-level locks (`FOR UPDATE`).
- **Offline / Local Fallback**: When Supabase is not yet connected or during network downtime, the system automatically uses a synchronized, persistent local storage ledger with identical data models and validation rules.
- **In-App Live Connector**: You can configure Supabase directly in the browser via the **Settings (08)** screen without needing to rebuild or redeploy!

---

## 2. Step-by-Step Supabase Setup

### Step 1: Create a Supabase Project
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New project**.
3. Fill in:
   - **Name**: `stockwise-inventory` (or any preferred name)
   - **Database Password**: Choose a strong password and save it
   - **Region**: `ap-south-1` (Mumbai / India) — or the region closest to your warehouse operations
   - **Pricing Plan**: Free tier is 100% sufficient for small businesses and testing
4. Click **Create new project** and wait ~1 minute for provisioning.

---

### Step 2: Execute Database Migrations (SQL Editor)
1. In your Supabase Dashboard, open the **SQL Editor** from the left navigation.
2. Click **+ New Query**.
3. Open or copy the entire contents of:
   `supabase/migrations/20261117000000_inventory_schema.sql` (also reproduced in Section 4 below).
4. Paste the SQL into the editor and click **Run** (green button).
5. You should see `Success. No rows returned`. All 6 tables, indexes, constraints, stored procedures, and RLS policies are now created.

---

### Step 3: Seed Demo Data (Optional but Recommended)
1. In the **SQL Editor**, open another **New Query**.
2. Open or copy the contents of `supabase/seed.sql`.
3. Paste the SQL into the editor and click **Run**.
4. This populates your initial suppliers (Apex Micro Precision, Nordic Alloy, Yamato Polymer), categories (Stationery, Electronics, Hardware), and standard evaluation SKUs (LiDAR modules, paper, fasteners).

---

### Step 4: Retrieve Project API Credentials
1. Go to **Project Settings** (gear icon at the bottom left) -> **API**.
2. Under **Project URL**, copy the `URL` (e.g. `https://xyzabcdefg.supabase.co`).
3. Under **Project API keys**, copy the `anon` `public` key.

---

### Step 5: Connect StockWise to Supabase

You have **two easy ways** to connect:

#### Option A: Direct In-App Setup (No Rebuild Required)
1. Open your live app: [https://amypo.vercel.app](https://amypo.vercel.app)
2. In the left navigation, click **SETTINGS (08)**.
3. Under **Database & Backend Infrastructure -> Supabase Live Cluster Connection**:
   - Paste your **Supabase Project URL**
   - Paste your **Supabase Public Anon Key**
4. Click **Save & Connect to Supabase**.
5. The system will perform an automated ping test. Once verified, it switches to **LIVE CLOUD** mode and refreshes!

#### Option B: Environment Variables in Vercel
1. Go to your [Vercel Dashboard](https://vercel.com).
2. Select the `amypo` project -> **Settings** -> **Environment Variables**.
3. Add:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-public-key`
   - `VITE_GEMINI_API_KEY` = `your-gemini-api-key` (optional, for AI features)
4. Trigger a redeployment (`vercel --prod`).

---

## 3. Database Schema Specification

The database consists of 6 normalized tables maintaining strict referential integrity and an immutable transaction ledger:

| Table | Purpose | Key Constraints |
| :--- | :--- | :--- |
| `profiles` | User profiles linked to Supabase `auth.users` | `id REFERENCES auth.users(id) ON DELETE CASCADE` |
| `categories` | Product family classification | `name TEXT NOT NULL UNIQUE` |
| `suppliers` | Supply chain vendor directory | Contact details, SLA notes |
| `products` | Physical catalog SKUs & pricing | `sku UNIQUE`, `purchase_price >= 0`, `current_quantity >= 0` |
| `inventory_transactions` | Immutable movement ledger (Inbound / Outbound) | `quantity > 0`, records previous and resulting quantities |
| `user_settings` | Workspace parameters, currency symbol (₹), reorder defaults | User-isolated settings |

### Atomic Transaction Stored Procedure:
Stock updates are handled via `public.handle_stock_transaction`:
- Enforces an exclusive row lock (`SELECT * FROM products WHERE id = p_product_id FOR UPDATE`) to prevent concurrent race conditions.
- Strictly rejects stock-out transactions that would result in negative inventory.
- Inserts an immutable transaction record into `inventory_transactions` and updates `products.current_quantity` within a single atomic database transaction.

---

## 4. Verification & Testing Checklist

Once connected, test the following workflows in the app:
- [ ] **Stock In**: Go to Products or Inventory, trigger "Stock In" with +10 units. Verify that `current_quantity` increases and a transaction record is created.
- [ ] **Stock Out Validation**: Trigger "Stock Out" with a quantity greater than available stock. Verify that the system blocks negative inventory.
- [ ] **Supabase Dashboard Verification**: Open the **Table Editor** in Supabase to confirm rows appear in `products` and `inventory_transactions`.
- [ ] **Telemetry & Reports**: Open **REPORTS (06)** to see live deterministic drift, replenishment trajectories, and category capital calculations.
