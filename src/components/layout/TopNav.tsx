import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  RefreshCw,
  ExternalLink,
  User,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { NavigationTab } from './Sidebar';

interface TopNavProps {
  currentTab: NavigationTab;
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  onOpenAI: () => void;
  onOpenShowcase?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onToggleSidebar,
  onOpenSearch,
  onOpenAI,
  onOpenShowcase,
}) => {
  const { signOut } = useAuth();
  const { stats, refreshData, loading } = useData();
  const [profileOpen, setProfileOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-14 bg-white border-b border-[#D7D8DD] flex items-center justify-between px-4 sm:px-6 select-none shadow-xs">
      {/* Left: Operations Breadcrumbs & Telemetry Badges */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 text-[#6E6F76] hover:text-[#0D0D0F] hover:bg-[#F2F2F4] transition-colors sm:hidden"
          aria-label="Toggle navigation"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-[#0D0D0F] tracking-wider uppercase whitespace-nowrap">
            STOCKWISE / SYS.OPERATIONS
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 font-mono text-[10px]">
          <span className="px-2 py-0.5 bg-[#F2F2F4] border border-[#D7D8DD] text-[#4E5058] tracking-wider">
            CLUSTER: AP-SOUTH-1
          </span>
          <span className="px-2 py-0.5 bg-[#F2F2F4] border border-[#D7D8DD] text-[#4E5058] tracking-wider">
            RTT: 28MS
          </span>
        </div>
      </div>

      {/* Center: Search Box */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-1.5 bg-[#F8F8FA] border border-[#D7D8DD] hover:border-[#0D0D0F] text-[#6E6F76] transition-colors text-xs font-mono"
        >
          <div className="flex items-center gap-2">
            <Search size={13} className="text-[#8E909A]" />
            <span className="truncate">Query SKU, batch hash, serial...</span>
          </div>
          <kbd className="px-1.5 py-0.2 bg-white border border-[#D7D8DD] text-[10px] text-[#4E5058]">
            ^K
          </kbd>
        </button>
      </div>

      {/* Right: Telemetry Live Indicator, Notifications & Store Admin */}
      <div className="flex items-center gap-2.5">
        {/* Showcase button if available */}
        {onOpenShowcase && (
          <button
            onClick={onOpenShowcase}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#D7D8DD] hover:bg-[#0D0D0F] hover:text-white transition-colors font-mono text-[11px] uppercase tracking-wider text-[#0D0D0F]"
            title="View Technical Showcase"
          >
            <ExternalLink size={11} className="text-[#2F5BFF]" />
            <span>Showcase</span>
          </button>
        )}

        {/* Telemetry Live Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#FFF9E6] border border-[#F0D58C] text-[#8C6B00]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E5A100] animate-pulse" />
          <span className="font-mono text-[10px] font-bold tracking-wider uppercase">
            TELEMETRY LIVE
          </span>
        </div>

        {/* Refresh button */}
        <button
          onClick={() => refreshData()}
          disabled={loading}
          className="p-1.5 bg-white border border-[#D7D8DD] text-[#0D0D0F] hover:bg-[#F2F2F4] transition-colors disabled:opacity-50"
          title="Refresh database records"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setAlertsOpen(!alertsOpen);
              setProfileOpen(false);
            }}
            className="p-1.5 relative bg-white border border-[#D7D8DD] text-[#0D0D0F] hover:bg-[#F2F2F4] transition-colors"
            aria-label="View notifications"
          >
            <Bell size={14} />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#FF3D00] text-white text-[9px] font-mono font-bold flex items-center justify-center rounded-full">
              {stats.lowStockProductsCount > 0 ? stats.lowStockProductsCount : '3'}
            </span>
          </button>

          {alertsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#D7D8DD] shadow-2xl z-40 p-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#D7D8DD] font-mono text-xs">
                <span className="font-bold text-[#0D0D0F]">SYSTEM NOTIFICATIONS</span>
                <span className="text-[10px] text-[#FF3D00] font-bold">
                  {stats.lowStockProductsCount} CRITICAL
                </span>
              </div>
              <div className="mt-3 space-y-2 text-xs font-mono">
                <div className="p-2 bg-[#FFF3F0] border-l-2 border-[#FF3D00] text-[#0D0D0F]">
                  <p className="font-bold text-[11px]">DRIFT ALERT // STN-001</p>
                  <p className="text-[10px] text-[#6E6F76] mt-0.5">
                    Impending runout within 72h. Safety buffer depleted.
                  </p>
                </div>
                <div className="p-2 bg-[#F8F8FA] border-l-2 border-[#0D0D0F] text-[#0D0D0F]">
                  <p className="font-bold text-[11px]">LEDGER // RE-SYNC</p>
                  <p className="text-[10px] text-[#6E6F76] mt-0.5">
                    All 14 regional nodes synchronized with cluster AP-SOUTH-1.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Store Admin Identity Pill */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setAlertsOpen(false);
            }}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 bg-white border border-[#D7D8DD] hover:border-[#0D0D0F] transition-colors"
          >
            <div className="w-5 h-5 bg-[#0D0D0F] text-white flex items-center justify-center text-[10px] font-mono font-bold">
              <User size={12} />
            </div>
            <div className="text-left font-mono leading-tight">
              <div className="text-[10px] font-bold text-[#0D0D0F] uppercase">Store Admin</div>
              <div className="text-[8px] text-[#6E6F76] uppercase">IN-BLR-WH01</div>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-[#D7D8DD] shadow-2xl z-40 p-4 font-mono text-xs">
              <div className="pb-2 border-b border-[#D7D8DD]">
                <p className="font-bold text-[#0D0D0F]">Priya Sharma</p>
                <p className="text-[10px] text-[#6E6F76]">priya.sharma@stockwise.internal</p>
                <p className="text-[9px] text-[#2F5BFF] font-bold mt-1">ROLE: LEAD OPS ENG</p>
              </div>
              <div className="py-2 border-b border-[#D7D8DD] space-y-1 text-[11px]">
                <p className="text-[#6E6F76]">NODE: IN-BLR-01 (Bangalore)</p>
                <p className="text-[#6E6F76]">REGION: AP-SOUTH-1</p>
                <p className="text-[#6E6F76]">SCHEMA: V3.1 POSTGRESQL</p>
              </div>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  signOut();
                }}
                className="w-full mt-3 py-1.5 px-3 bg-[#0D0D0F] text-white hover:bg-[#2F5BFF] transition-colors text-[11px] font-bold uppercase tracking-wider text-center"
              >
                Sign Out / Exit
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
