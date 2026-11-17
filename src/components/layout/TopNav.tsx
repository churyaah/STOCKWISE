import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  LogOut,
  User,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { NavigationTab } from './Sidebar';

interface TopNavProps {
  currentTab: NavigationTab;
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  onOpenAI: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onToggleSidebar,
  onOpenSearch,
  onOpenAI,
}) => {
  const { profile, signOut, isDemoUser } = useAuth();
  const { stats, refreshData, loading } = useData();
  const [profileOpen, setProfileOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  const breadcrumbsMap: Record<NavigationTab, string> = {
    dashboard: 'Dashboard Overview',
    products: 'Product Catalog & SKUs',
    inventory: 'Real-time Stock Levels',
    suppliers: 'Supplier Roster',
    transactions: 'Movement Ledger',
    reports: 'Valuation & Analytics',
    ai: 'AI Intelligence Assistant',
    settings: 'Workspace Settings',
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-mono-100/90 backdrop-blur-md border-b border-mono-200 flex items-center justify-between px-6 select-none">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 text-mono-700 hover:text-mono-950 hover:bg-mono-200 transition-colors sm:hidden"
          aria-label="Toggle navigation"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2 font-mono text-xs text-mono-500 uppercase tracking-wider">
          <span className="text-mono-400">WORKSPACE</span>
          <span>/</span>
          <span className="font-bold text-mono-950">{breadcrumbsMap[currentTab]}</span>
        </div>
      </div>

      {/* Right: Quick Tools & Profile */}
      <div className="flex items-center gap-3">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="hidden md:flex items-center gap-3 px-3.5 py-1.5 bg-mono-0 border border-mono-300 text-mono-500 hover:text-mono-950 hover:border-mono-800 transition-colors text-xs font-mono"
        >
          <Search size={14} />
          <span>Search products, SKUs, suppliers...</span>
          <kbd className="px-1.5 py-0.5 bg-mono-150 border border-mono-300 text-[10px] text-mono-700">
            Ctrl+K
          </kbd>
        </button>

        {/* Refresh button */}
        <button
          onClick={() => refreshData()}
          disabled={loading}
          className="p-2 bg-mono-0 border border-mono-300 text-mono-700 hover:text-mono-950 hover:border-mono-800 transition-colors disabled:opacity-50"
          title="Refresh real-time data"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>

        {/* AI Assistant Quick Pill */}
        <button
          onClick={onOpenAI}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-mono-950 text-mono-0 border border-mono-950 font-mono text-xs uppercase tracking-tight hover:bg-mono-0 hover:text-mono-950 transition-colors"
        >
          <Sparkles size={13} />
          <span className="hidden sm:inline">AI Assistant</span>
        </button>

        {/* Alerts Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setAlertsOpen(!alertsOpen);
              setProfileOpen(false);
            }}
            className="p-2 relative bg-mono-0 border border-mono-300 text-mono-700 hover:text-mono-950 hover:border-mono-800 transition-colors"
            aria-label="View notifications"
          >
            <Bell size={16} />
            {stats.lowStockProductsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-mono-950 border border-mono-0 rounded-full" />
            )}
          </button>

          {alertsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-mono-0 border border-mono-900 shadow-2xl z-40 animate-in fade-in zoom-in-95 p-4">
              <div className="flex items-center justify-between pb-3 border-b border-mono-200">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-mono-950">
                  Inventory Alerts
                </span>
                <span className="font-mono text-[10px] bg-mono-150 px-1.5 py-0.5 border border-mono-300">
                  {stats.lowStockProductsCount + stats.outOfStockCount} ISSUES
                </span>
              </div>

              <div className="py-2 space-y-2 max-h-60 overflow-y-auto">
                {stats.outOfStockCount > 0 && (
                  <div className="p-2.5 bg-mono-50 border border-mono-300 text-xs font-mono">
                    <p className="font-bold text-mono-950 uppercase">Stock Depleted</p>
                    <p className="text-mono-600 mt-0.5">
                      {stats.outOfStockCount} item(s) currently at zero stock.
                    </p>
                  </div>
                )}
                {stats.lowStockProductsCount > 0 && (
                  <div className="p-2.5 bg-mono-50 border border-mono-300 text-xs font-mono">
                    <p className="font-bold text-mono-950 uppercase">Low Stock Threshold</p>
                    <p className="text-mono-600 mt-0.5">
                      {stats.lowStockProductsCount} item(s) below reorder level.
                    </p>
                  </div>
                )}
                {stats.lowStockProductsCount === 0 && stats.outOfStockCount === 0 && (
                  <p className="text-xs font-mono text-mono-500 py-4 text-center">
                    All inventory levels are within safe operating limits.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setAlertsOpen(false);
            }}
            className="flex items-center gap-2 p-1.5 bg-mono-0 border border-mono-300 hover:border-mono-950 transition-colors"
          >
            <div className="w-6 h-6 bg-mono-950 text-mono-0 font-mono text-xs flex items-center justify-center font-bold">
              {profile?.full_name ? profile.full_name[0].toUpperCase() : 'A'}
            </div>
            <span className="hidden lg:inline font-mono text-xs text-mono-900 font-semibold truncate max-w-[120px]">
              {profile?.full_name || 'Admin'}
            </span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-mono-0 border border-mono-900 shadow-2xl z-40 animate-in fade-in zoom-in-95">
              <div className="p-4 border-b border-mono-200 bg-mono-50">
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-mono-500 uppercase tracking-widest">
                  <Shield size={11} />
                  <span>{isDemoUser ? 'DEMO ADMINISTRATOR' : 'AUTHENTICATED'}</span>
                </div>
                <p className="font-sans font-bold text-sm text-mono-950 mt-1 truncate">
                  {profile?.full_name || 'Admin'}
                </p>
                <p className="font-mono text-xs text-mono-500 truncate">
                  {profile?.email || 'admin@inventory.local'}
                </p>
              </div>

              <div className="p-2 space-y-1">
                <div className="px-3 py-2 text-xs font-mono text-mono-600">
                  <span className="block text-mono-400 text-[10px] uppercase">Business:</span>
                  <span className="font-semibold text-mono-900">{profile?.business_name || 'Enterprise Workspace'}</span>
                </div>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono uppercase tracking-tight text-mono-950 hover:bg-mono-150 transition-colors text-left"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
