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
  Terminal,
  LogOut,
  Sliders,
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
  onQuickStockIn?: () => void;
  onQuickStockOut?: () => void;
  onQuickAddProduct?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
}) => {
  const { stats } = useData();

  const navItems: {
    id: NavigationTab;
    label: string;
    num: string;
    icon: React.ReactNode;
    isLLM?: boolean;
    badge?: string;
  }[] = [
    { id: 'dashboard', label: 'DASHBOARD', num: '01', icon: <LayoutDashboard size={15} /> },
    { id: 'products', label: 'PRODUCTS', num: '02', icon: <Package size={15} />, badge: String(stats.totalProducts) },
    { id: 'inventory', label: 'INVENTORY', num: '03', icon: <Boxes size={15} />, badge: stats.lowStockProductsCount > 0 ? `${stats.lowStockProductsCount}` : undefined },
    { id: 'suppliers', label: 'SUPPLIERS', num: '04', icon: <Truck size={15} /> },
    { id: 'transactions', label: 'TRANSACTIONS', num: '05', icon: <ArrowLeftRight size={15} /> },
    { id: 'reports', label: 'REPORTS', num: '06', icon: <BarChart3 size={15} /> },
    { id: 'ai', label: 'AI COPILOT', num: '07', icon: <Bot size={15} />, isLLM: true },
    { id: 'settings', label: 'SETTINGS', num: '08', icon: <Settings size={15} /> },
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col bg-[#0D0D0F] text-[#EFEFEE] border-r border-[#222226] h-screen transition-all duration-200 select-none z-30 flex-shrink-0',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-[#222226]">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 border border-[#3A3A42] bg-[#16161A] flex items-center justify-center text-[#2F5BFF]">
                  <Boxes size={14} className="stroke-[2.5]" />
                </div>
                <div>
                  <h1 className="font-mono font-bold text-sm text-white tracking-wider leading-none">
                    STOCKWISE
                  </h1>
                  <span className="font-mono text-[9px] text-[#7E7F88] tracking-wider">
                    OS 2.4 // NODE
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#00C853]/10 border border-[#00C853]/30 rounded-none">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-pulse" />
                <span className="font-mono text-[9px] font-bold text-[#00C853] tracking-wider uppercase">
                  ACTIVE
                </span>
              </div>
            </div>

            <div className="pt-1">
              <p className="font-mono text-[9px] text-[#6E6F76] uppercase tracking-wider truncate">
                SYS_STATUS: NOMINAL [NODE: IN-BLR-01]
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 py-1">
            <div className="w-7 h-7 border border-[#3A3A42] bg-[#16161A] flex items-center justify-center text-[#2F5BFF]">
              <Boxes size={16} />
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C853]" />
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navItems.map(item => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2.5 transition-all duration-150 group text-left relative font-mono text-xs uppercase tracking-wider',
                isActive
                  ? 'bg-white text-[#0D0D0F] font-bold shadow-sm'
                  : 'text-[#A0A1AA] hover:bg-[#1A1A1F] hover:text-white'
              )}
              title={collapsed ? item.label : undefined}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={cn(
                    'flex-shrink-0',
                    isActive ? 'text-[#0D0D0F]' : 'text-[#6E6F76] group-hover:text-white'
                  )}
                >
                  {item.icon}
                </span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!collapsed && (
                <div>
                  {item.isLLM ? (
                    <span
                      className={cn(
                        'px-1.5 py-0.5 text-[9px] font-bold tracking-wider',
                        isActive
                          ? 'bg-[#2F5BFF] text-white'
                          : 'bg-[#2F5BFF] text-white'
                      )}
                    >
                      LLM
                    </span>
                  ) : (
                    <span
                      className={cn(
                        'text-[11px] font-mono',
                        isActive ? 'text-[#0D0D0F]' : 'text-[#50515A] group-hover:text-[#A0A1AA]'
                      )}
                    >
                      {item.num}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Technical Widgets */}
      {!collapsed && (
        <div className="p-3 border-t border-[#222226] space-y-3 bg-[#0A0A0C]">
          {/* CLI Shortcut */}
          <button
            onClick={() => onTabChange('settings')}
            className="w-full flex items-center justify-between px-2.5 py-2 bg-[#141418] border border-[#26262C] hover:border-[#3E3F48] transition-colors text-left"
          >
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#A0A1AA]">
              <span className="text-[#6E6F76]">&lt;&gt;</span>
              <span className="text-white font-bold tracking-wider">STOCK_CLI &gt;_</span>
            </div>
            <span className="font-mono text-[10px] text-[#7E7F88] bg-[#1E1E24] px-1.5 py-0.5 border border-[#2E2F38]">
              ^K
            </span>
          </button>

          {/* Memory / Core Meter */}
          <div className="space-y-1 font-mono text-[10px]">
            <div className="flex items-center justify-between text-[#7E7F88]">
              <span>MEMORY // CORE</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#C4C5CE]">
              <span>4.2 GB / 16.0 GB</span>
              <span className="w-2.5 h-1.5 bg-[#00C853] inline-block" />
            </div>
            <div className="w-full h-1 bg-[#1E1E24] overflow-hidden">
              <div className="h-full bg-[#00C853]" style={{ width: '26.25%' }} />
            </div>
          </div>

          {/* User Profile Card */}
          <div className="pt-2 border-t border-[#1C1C22] flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 bg-[#1C1C22] border border-[#2E2F38] flex items-center justify-center font-mono font-bold text-xs text-white">
                PS
              </div>
              <div className="truncate min-w-0">
                <p className="font-mono text-xs font-bold text-white leading-tight truncate">
                  Priya Sharma
                </p>
                <p className="font-mono text-[9px] text-[#7E7F88] uppercase tracking-wider">
                  LEAD OPS ENG
                </p>
              </div>
            </div>

            <button
              onClick={() => onTabChange('settings')}
              title="System Config & Database"
              className="p-1 text-[#7E7F88] hover:text-white transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Collapse Toggle Handle */}
      <button
        onClick={onToggleCollapse}
        className="p-2 border-t border-[#222226] text-[#7E7F88] hover:text-white flex items-center justify-center bg-[#0D0D0F]"
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
};
