import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Category, DashboardStats, InventoryTransaction, Product, Supplier, UserSettings } from '../types';
import { inventoryService } from '../services/inventoryService';
import { useToast } from './ToastContext';

interface DataContextType {
  products: Product[];
  suppliers: Supplier[];
  categories: Category[];
  transactions: InventoryTransaction[];
  stats: DashboardStats;
  settings: UserSettings;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  createProduct: (prod: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<Product>;
  updateProduct: (id: string, prod: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  createSupplier: (sup: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => Promise<Supplier>;
  updateSupplier: (id: string, sup: Partial<Supplier>) => Promise<Supplier>;
  deleteSupplier: (id: string) => Promise<void>;
  createCategory: (name: string, description?: string) => Promise<Category>;
  recordStockIn: (params: {
    productId: string;
    quantity: number;
    supplierId?: string;
    referenceNumber?: string;
    notes?: string;
    transactionDate?: string;
  }) => Promise<void>;
  recordStockOut: (params: {
    productId: string;
    quantity: number;
    reason: string;
    referenceNumber?: string;
    notes?: string;
    transactionDate?: string;
  }) => Promise<void>;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  resetDemoData: () => Promise<void>;
}

const defaultStats: DashboardStats = {
  totalProducts: 0,
  totalStockQuantity: 0,
  inventoryValuation: 0,
  lowStockProductsCount: 0,
  outOfStockCount: 0,
  inStockCount: 0,
};

const defaultSettings: UserSettings = {
  business_name: 'Vance & Rostova Precision Industrial',
  currency_symbol: '$',
  low_stock_threshold_default: 15,
  ai_restock_sensitivity: 'standard',
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { showToast } = useToast();

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [p, s, c, t, st, set] = await Promise.all([
        inventoryService.getProducts(),
        inventoryService.getSuppliers(),
        inventoryService.getCategories(),
        inventoryService.getTransactions(),
        inventoryService.getDashboardStats(),
        inventoryService.getUserSettings(),
      ]);

      setProducts(p);
      setSuppliers(s);
      setCategories(c);
      setTransactions(t);
      setStats(st);
      setSettings(set);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err?.message || 'Failed to initialize inventory records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const createProduct = async (prod: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const created = await inventoryService.createProduct(prod);
      await loadAll();
      showToast('Product Created', 'success', `SKU ${created.sku} registered successfully.`);
      return created;
    } catch (err: any) {
      showToast('Error Creating Product', 'error', err?.message || 'Operation failed');
      throw err;
    }
  };

  const updateProduct = async (id: string, prod: Partial<Product>) => {
    try {
      const updated = await inventoryService.updateProduct(id, prod);
      await loadAll();
      showToast('Product Updated', 'success', `Saved changes to ${updated.name}.`);
      return updated;
    } catch (err: any) {
      showToast('Error Updating Product', 'error', err?.message || 'Operation failed');
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await inventoryService.deleteProduct(id);
      await loadAll();
      showToast('Product Removed', 'info', 'Product and catalog entry deleted.');
    } catch (err: any) {
      showToast('Error Deleting Product', 'error', err?.message || 'Operation failed');
      throw err;
    }
  };

  const createSupplier = async (sup: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const created = await inventoryService.createSupplier(sup);
      await loadAll();
      showToast('Supplier Registered', 'success', `${created.company} added to roster.`);
      return created;
    } catch (err: any) {
      showToast('Error Creating Supplier', 'error', err?.message || 'Operation failed');
      throw err;
    }
  };

  const updateSupplier = async (id: string, sup: Partial<Supplier>) => {
    try {
      const updated = await inventoryService.updateSupplier(id, sup);
      await loadAll();
      showToast('Supplier Updated', 'success', `Details saved for ${updated.company}.`);
      return updated;
    } catch (err: any) {
      showToast('Error Updating Supplier', 'error', err?.message || 'Operation failed');
      throw err;
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      await inventoryService.deleteSupplier(id);
      await loadAll();
      showToast('Supplier Removed', 'info', 'Supplier entry removed.');
    } catch (err: any) {
      showToast('Error Deleting Supplier', 'error', err?.message || 'Operation failed');
      throw err;
    }
  };

  const createCategory = async (name: string, description?: string) => {
    try {
      const created = await inventoryService.createCategory(name, description);
      await loadAll();
      showToast('Category Added', 'success', `Category "${name}" created.`);
      return created;
    } catch (err: any) {
      showToast('Error Creating Category', 'error', err?.message || 'Operation failed');
      throw err;
    }
  };

  const recordStockIn = async (params: {
    productId: string;
    quantity: number;
    supplierId?: string;
    referenceNumber?: string;
    notes?: string;
    transactionDate?: string;
  }) => {
    try {
      const res = await inventoryService.recordStockTransaction({
        productId: params.productId,
        type: 'IN',
        quantity: params.quantity,
        supplierId: params.supplierId,
        reason: 'Restock / Purchase',
        referenceNumber: params.referenceNumber,
        notes: params.notes,
        transactionDate: params.transactionDate,
      });

      await loadAll();
      showToast(
        'Stock In Recorded',
        'success',
        `+${params.quantity} units added. New balance: ${res.updatedProduct.current_quantity} units.`
      );
    } catch (err: any) {
      showToast('Stock In Failed', 'error', err?.message || 'Transaction aborted');
      throw err;
    }
  };

  const recordStockOut = async (params: {
    productId: string;
    quantity: number;
    reason: string;
    referenceNumber?: string;
    notes?: string;
    transactionDate?: string;
  }) => {
    try {
      const res = await inventoryService.recordStockTransaction({
        productId: params.productId,
        type: 'OUT',
        quantity: params.quantity,
        reason: params.reason,
        referenceNumber: params.referenceNumber,
        notes: params.notes,
        transactionDate: params.transactionDate,
      });

      await loadAll();
      showToast(
        'Stock Out Recorded',
        'success',
        `-${params.quantity} units dispensed. New balance: ${res.updatedProduct.current_quantity} units.`
      );
    } catch (err: any) {
      showToast('Stock Out Failed', 'error', err?.message || 'Transaction aborted');
      throw err;
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    try {
      const updated = await inventoryService.updateUserSettings(newSettings);
      setSettings(updated);
      showToast('Settings Saved', 'success', 'Workspace preferences updated.');
    } catch (err: any) {
      showToast('Error Saving Settings', 'error', err?.message || 'Update failed');
    }
  };

  const resetDemoData = async () => {
    try {
      await inventoryService.resetToDemoData();
      await loadAll();
      showToast('Demo Data Restored', 'info', 'Workspace restored to clean baseline dataset.');
    } catch (err: any) {
      showToast('Reset Failed', 'error', err?.message);
    }
  };

  return (
    <DataContext.Provider
      value={{
        products,
        suppliers,
        categories,
        transactions,
        stats,
        settings,
        loading,
        error,
        refreshData: loadAll,
        createProduct,
        updateProduct,
        deleteProduct,
        createSupplier,
        updateSupplier,
        deleteSupplier,
        createCategory,
        recordStockIn,
        recordStockOut,
        updateSettings,
        resetDemoData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
