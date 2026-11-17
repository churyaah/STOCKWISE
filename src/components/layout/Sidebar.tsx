import React from 'react';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Truck,
  ArrowLeftRight,
  BarChart3,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useData } from '../../context/DataContext';

export type NavigationTab =
  | 'dashboard'
  | 'products'
  | 'inventory'
  | 'suppliers'
  | 'transactions'
  | 'reports'
  | 'ai'
  | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onQuickStockIn: () => void;
  onQuickStockOut: () => void;
  onQuickAddProduct: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
  onQuickStockIn,
  onQuickStockOut,
  onQuickAddProduct,
}) => {
  const { stats } = useData();

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'products', label: 'Products', icon: <Package size={18} />, badge: stats.totalProducts },
    { id: 'inventory', label: 'Inventory', icon: <Boxes size={18} />, badge: stats.lowStockProductsCount > 0 ? `${stats.lowStockProductsCount} LOW` : undefined },
    { id: 'suppliers', label: 'Suppliers', icon: <Truck size={18} /> },
    { id: 'transactions', label: 'Transactions', icon: <ArrowLeftRight size={18} /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={18} /> },
    { id: 'ai', label: 'AI Assistant', icon: <Bot size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col bg-mono-0 border-r border-mono-200 h-screen transition-all duration-200 select-none z-20',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-mono-200 bg-mono-50">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 bg-mono-950 flex items-center justify-center text-mono-0 font-display font-black text-sm">
              IM
            </div>
            <div className="truncate">
              <h1 className="font-display font-black text-sm text-mono-950 tracking-tight leading-none uppercase">
                Inventory
              </h1>
              <p className="font-mono text-[10px] text-mono-500 uppercase tracking-widest mt-0.5">
                Manager v2.0
              </p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto bg-mono-950 flex items-center justify-center text-mono-0 font-display font-bold text-sm">
            IM
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className={cn(
            'p-1.5 text-mono-500 hover:text-mono-950 hover:bg-mono-200 transition-colors',
            collapsed && 'hidden sm:block mx-auto'
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Quick Action Pill Bar */}
      {!collapsed && (
        <div className="p-3 border-b border-mono-200 bg-mono-100/50 space-y-1.5">
          <p className="font-mono text-[9px] uppercase tracking-wider text-mono-500 font-bold px-1">
            Quick Actions
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={onQuickStockIn}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-mono-0 border border-mono-300 text-mono-900 font-mono text-[11px] uppercase tracking-tight hover:bg-mono-950 hover:text-mono-0 transition-colors"
            >
              <TrendingUp size={12} />
              Stock In
            </button>
            <button
              onClick={onQuickStockOut}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-mono-0 border border-mono-300 text-mono-900 font-mono text-[11px] uppercase tracking-tight hover:bg-mono-950 hover:text-mono-0 transition-colors"
            >
              <TrendingDown size={12} />
              Stock Out
            </button>
          </div>
          <button
            onClick={onQuickAddProduct}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-mono-950 border border-mono-950 text-mono-0 font-mono text-[11px] uppercase tracking-tight hover:bg-mono-0 hover:text-mono-950 transition-colors"
          >
            <PlusCircle size={12} />
            Add Product
          </button>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1">
        {navItems.map(item => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-150 group text-left relative',
                isActive
                  ? 'bg-mono-950 text-mono-0 font-semibold shadow-sm'
                  : 'text-mono-700 hover:bg-mono-150 hover:text-mono-950'
              )}
              title={collapsed ? item.label : undefined}
            >
              <span
                className={cn(
                  'flex-shrink-0 transition-transform duration-150',
                  isActive ? 'text-mono-0' : 'text-mono-600 group-hover:text-mono-950'
                )}
              >
                {item.icon}
              </span>

              {!collapsed && (
                <span className="flex-1 font-mono text-xs uppercase tracking-tight truncate">
                  {item.label}
                </span>
              )}

              {!collapsed && item.badge !== undefined && (
                <span
                  className={cn(
                    'text-[10px] font-mono px-1.5 py-0.5 border uppercase',
                    isActive
                      ? 'border-mono-600 bg-mono-800 text-mono-100'
                      : 'border-mono-300 bg-mono-100 text-mono-800'
                  )}
                >
                  {item.badge}
                </span>
              )}

              {/* Monochromatic indicator notch */}
              {isActive && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-mono-0" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / System Status */}
      <div className="p-3 border-t border-mono-200 bg-mono-50">
        {!collapsed ? (
          <div className="flex items-center justify-between text-[11px] font-mono text-mono-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-mono-950 rounded-full inline-block" />
              SYSTEM ACTIVE
            </span>
            <span className="text-mono-400">100% MONO</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="w-2 h-2 bg-mono-950 rounded-full" title="System Active" />
          </div>
        )}
      </div>
    </aside>
  );
};
