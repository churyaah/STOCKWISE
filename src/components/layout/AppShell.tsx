import React, { useState } from 'react';
import { Sidebar, NavigationTab } from './Sidebar';
import { TopNav } from './TopNav';
import { GlobalSearchModal } from '../common/GlobalSearchModal';
import { AIChatDrawer } from '../ai/AIChatDrawer';
import { ProductModal } from '../products/ProductModal';
import { StockInModal } from '../transactions/StockInModal';
import { StockOutModal } from '../transactions/StockOutModal';
import { SupplierModal } from '../suppliers/SupplierModal';

import { DashboardView } from '../dashboard/DashboardView';
import { ProductTable } from '../products/ProductTable';
import { InventoryView } from '../inventory/InventoryView';
import { SupplierTable } from '../suppliers/SupplierTable';
import { TransactionList } from '../transactions/TransactionList';
import { ReportsView } from '../reports/ReportsView';
import { AIAssistantView } from '../ai/AIAssistantView';
import { SettingsView } from '../settings/SettingsView';

import { useData } from '../../context/DataContext';
import { Product, Supplier } from '../../types';

interface AppShellProps {
  onOpenShowcase?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({ onOpenShowcase }) => {
  const {
    products,
    suppliers,
    categories,
    transactions,
    createProduct,
    updateProduct,
    deleteProduct,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    recordStockIn,
    recordStockOut,
  } = useData();

  const [currentTab, setCurrentTab] = useState<NavigationTab>('reports');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modals state
  const [searchOpen, setSearchOpen] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  // Product Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Stock In Modal State
  const [stockInOpen, setStockInOpen] = useState(false);
  const [targetStockInProduct, setTargetStockInProduct] = useState<Product | null>(null);

  // Stock Out Modal State
  const [stockOutOpen, setStockOutOpen] = useState(false);
  const [targetStockOutProduct, setTargetStockOutProduct] = useState<Product | null>(null);

  // Supplier Modal State
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Quick Action Handlers
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductModalOpen(true);
  };

  const handleOpenStockIn = (prod?: Product) => {
    setTargetStockInProduct(prod || null);
    setStockInOpen(true);
  };

  const handleOpenStockOut = (prod?: Product) => {
    setTargetStockOutProduct(prod || null);
    setStockOutOpen(true);
  };

  const handleOpenAddSupplier = () => {
    setEditingSupplier(null);
    setSupplierModalOpen(true);
  };

  const handleOpenEditSupplier = (sup: Supplier) => {
    setEditingSupplier(sup);
    setSupplierModalOpen(true);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#EFEFEE] text-[#0D0D0F] selection:bg-[#0D0D0F] selection:text-white">
      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-mono-950/60 sm:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Persistent Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 sm:static transform transition-transform duration-200 sm:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          currentTab={currentTab}
          onTabChange={tab => {
            setCurrentTab(tab);
            setMobileSidebarOpen(false);
          }}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onQuickStockIn={() => handleOpenStockIn()}
          onQuickStockOut={() => handleOpenStockOut()}
          onQuickAddProduct={handleOpenAddProduct}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopNav
          currentTab={currentTab}
          onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenAI={() => setAiDrawerOpen(true)}
          onOpenShowcase={onOpenShowcase}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView
                onNavigate={setCurrentTab}
                onOpenAddProduct={handleOpenAddProduct}
                onOpenStockIn={handleOpenStockIn}
                onOpenStockOut={handleOpenStockOut}
              />
            )}

            {currentTab === 'products' && (
              <ProductTable
                products={products}
                onEdit={handleOpenEditProduct}
                onDelete={deleteProduct}
                onStockIn={handleOpenStockIn}
                onStockOut={handleOpenStockOut}
                onAddNew={handleOpenAddProduct}
              />
            )}

            {currentTab === 'inventory' && (
              <InventoryView
                onTriggerStockIn={handleOpenStockIn}
                onTriggerStockOut={handleOpenStockOut}
              />
            )}

            {currentTab === 'suppliers' && (
              <SupplierTable
                suppliers={suppliers}
                products={products}
                onEdit={handleOpenEditSupplier}
                onDelete={deleteSupplier}
                onAddNew={handleOpenAddSupplier}
              />
            )}

            {currentTab === 'transactions' && (
              <TransactionList
                transactions={transactions}
                onOpenStockIn={() => handleOpenStockIn()}
                onOpenStockOut={() => handleOpenStockOut()}
              />
            )}

            {currentTab === 'reports' && <ReportsView />}

            {currentTab === 'ai' && (
              <AIAssistantView onTriggerStockIn={handleOpenStockIn} />
            )}

            {currentTab === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Global Search Modal (Ctrl + K) */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={tab => {
          setCurrentTab(tab);
          setSearchOpen(false);
        }}
      />

      {/* Global AI Chat Drawer */}
      <AIChatDrawer
        isOpen={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
      />

      {/* Product Add / Edit Modal */}
      <ProductModal
        isOpen={productModalOpen}
        onClose={() => {
          setProductModalOpen(false);
          setEditingProduct(null);
        }}
        initialData={editingProduct}
        categories={categories}
        suppliers={suppliers}
        onSubmit={async data => {
          if (editingProduct) {
            await updateProduct(editingProduct.id, data);
          } else {
            await createProduct(data);
          }
        }}
      />

      {/* Stock In Modal */}
      <StockInModal
        isOpen={stockInOpen}
        onClose={() => {
          setStockInOpen(false);
          setTargetStockInProduct(null);
        }}
        preselectedProduct={targetStockInProduct}
        products={products}
        suppliers={suppliers}
        onSubmit={recordStockIn}
      />

      {/* Stock Out Modal */}
      <StockOutModal
        isOpen={stockOutOpen}
        onClose={() => {
          setStockOutOpen(false);
          setTargetStockOutProduct(null);
        }}
        preselectedProduct={targetStockOutProduct}
        products={products}
        onSubmit={recordStockOut}
      />

      {/* Supplier Modal */}
      <SupplierModal
        isOpen={supplierModalOpen}
        onClose={() => {
          setSupplierModalOpen(false);
          setEditingSupplier(null);
        }}
        initialData={editingSupplier}
        onSubmit={async data => {
          if (editingSupplier) {
            await updateSupplier(editingSupplier.id, data);
          } else {
            await createSupplier(data);
          }
        }}
      />
    </div>
  );
};
