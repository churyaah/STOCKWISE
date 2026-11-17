export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

export interface Supplier {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category_id?: string;
  category: string;
  purchase_price: number;
  selling_price: number;
  current_quantity: number;
  reorder_level: number;
  target_stock_level: number;
  supplier_id?: string;
  supplier?: Supplier;
  created_at?: string;
  updated_at?: string;
}

export type TransactionType = 'IN' | 'OUT';

export interface InventoryTransaction {
  id: string;
  product_id: string;
  product?: Product;
  type: TransactionType;
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  supplier_id?: string;
  supplier?: Supplier;
  reason?: string;
  reference_number?: string;
  notes?: string;
  transaction_date: string;
  created_by?: string;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  business_name: string;
  role: 'admin' | 'manager' | 'operator';
}

export interface UserSettings {
  id?: string;
  user_id?: string;
  business_name: string;
  currency_symbol: string;
  low_stock_threshold_default: number;
  ai_restock_sensitivity: 'conservative' | 'standard' | 'aggressive';
}

export interface DashboardStats {
  totalProducts: number;
  totalStockQuantity: number;
  inventoryValuation: number;
  lowStockProductsCount: number;
  outOfStockCount: number;
  inStockCount: number;
}

export interface RestockRecommendation {
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  reorderLevel: number;
  targetStock: number;
  recommendedOrder: number;
  estimatedCost: number;
  supplierName?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MODERATE';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStructured?: boolean;
}
