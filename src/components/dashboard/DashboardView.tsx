import React from 'react';
import { useData } from '../../context/DataContext';
import { KPICard } from './KPICard';
import { MovementChart } from './MovementChart';
import { CategoryDistributionChart } from './CategoryDistributionChart';
import { ValuationTrendChart } from './ValuationTrendChart';
import { StockHealthRadarChart } from './StockHealthRadarChart';
import { LowStockAlerts } from './LowStockAlerts';
import { FastMovingList } from './FastMovingList';
import { RecentTransactions } from './RecentTransactions';
import { ExecutiveSummaryWidget } from '../ai/ExecutiveSummaryWidget';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import {
  Package,
  Boxes,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Plus,
  ShieldCheck,
  Zap,
  Activity,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { Product } from '../../types';
import { NavigationTab } from '../layout/Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onOpenAddProduct: () => void;
  onOpenStockIn: (product?: Product) => void;
  onOpenStockOut: (product?: Product) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenAddProduct,
  onOpenStockIn,
  onOpenStockOut,
}) => {
  const { products, transactions, stats } = useData();

  return (
    <div className="space-y-6">
      {/* 4 Superdesign KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Catalog SKUs"
          value={formatNumber(stats.totalProducts)}
          subtitle={`${stats.inStockCount} at optimal levels`}
          icon={<Package size={18} className="text-signal" />}
          trend={{ label: 'Audit Accuracy: 99.8%', direction: 'up' }}
        />

        <KPICard
          title="Stock Units"
          value={formatNumber(stats.totalStockQuantity)}
          subtitle="Aggregated warehouse balance"
          icon={<Boxes size={18} className="text-ink" />}
          trend={{ label: 'Stock Velocity: 2.4M /Day', direction: 'neutral' }}
        />

        <KPICard
          title="Inventory Valuation"
          value={formatCurrency(stats.inventoryValuation)}
          subtitle="At cost acquisition price"
          icon={<Zap size={18} className="text-signal" />}
          trend={{ label: 'Fulfillment Time: 18h (-12%)', direction: 'up' }}
        />

        <KPICard
          title="Low-Stock Alerts"
          value={formatNumber(stats.lowStockProductsCount)}
          subtitle={`${stats.outOfStockCount} zero-stock items`}
          icon={<Activity size={18} className="text-signal" />}
          highlight={stats.lowStockProductsCount > 0}
          trend={{
            label: stats.lowStockProductsCount > 0 ? 'Replenishment Needed' : 'Capacity 87% Optimal',
            direction: stats.lowStockProductsCount > 0 ? 'down' : 'up',
          }}
        />
      </div>

      {/* AI RESTOCK STRATEGY PROACTIVE CARDS (FROM SUPERDESIGN) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-[#0D0D0F] text-white border border-[#222226] space-y-3 shadow-lg">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase">
            <span className="flex items-center gap-1.5 text-[#4D74FF] font-bold">
              <Sparkles size={12} />
              AI RESTOCK RECOMMENDATION
            </span>
            <span className="px-2 py-0.5 bg-white/10 text-white border border-white/20">98% CONFIDENCE</span>
          </div>
          <div>
            <h4 className="font-display font-black text-base text-white tracking-tight uppercase">
              Restock: Precision LiDAR Sensors &amp; Micro Processors
            </h4>
            <p className="font-mono text-xs text-white/60 mt-1">
              Procure +56 units across depleted SKU lines. Projected lead time: 5 days from Apex Micro Precision Ltd.
            </p>
          </div>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="font-mono text-xs text-[#4D74FF] font-bold">Est. Expenditure: ₹19,101.00</span>
            <button
              onClick={() => onOpenStockIn()}
              className="px-3.5 py-1.5 bg-white text-[#0D0D0F] font-mono text-[10px] uppercase font-bold hover:bg-[#2F5BFF] hover:text-white transition-colors flex items-center gap-1 rounded-full shadow-sm"
            >
              <span>Review PO</span>
              <ArrowUpRight size={11} />
            </button>
          </div>
        </div>

        <div className="p-4 bg-[#0D0D0F] text-white border border-[#222226] space-y-3 shadow-lg">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase">
            <span className="flex items-center gap-1.5 text-[#4D74FF] font-bold">
              <ShieldCheck size={12} className="text-[#4D74FF]" />
              WAREHOUSE CAPACITY &amp; REBALANCE
            </span>
            <span className="px-2 py-0.5 bg-[#2F5BFF]/20 border border-[#2F5BFF]/40 font-bold text-[#4D74FF]">ZONE 02 &bull; 87%</span>
          </div>
          <div>
            <h4 className="font-display font-black text-base text-white tracking-tight uppercase">
              Zone WH-04 to WH-02 Rebalancing
            </h4>
            <p className="font-mono text-xs text-white/60 mt-1">
              Reallocate 4.5K fast-moving carton packaging units to primary fulfillment bay to compress turnaround by 18%.
            </p>
          </div>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="font-mono text-xs text-white/60">Throughput: 84.2K In / 76.9K Out</span>
            <button
              onClick={() => onNavigate('inventory')}
              className="px-3.5 py-1.5 bg-white text-[#0D0D0F] font-mono text-[10px] uppercase font-bold hover:bg-[#2F5BFF] hover:text-white transition-colors flex items-center gap-1 rounded-full shadow-sm"
            >
              <span>Zone View</span>
              <ArrowUpRight size={11} />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Ribbon */}
      <div className="bg-white hairline-all p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-mono text-xs text-ink-secondary uppercase">
          <span className="w-1.5 h-1.5 bg-signal rounded-full" />
          <span className="font-bold text-ink">Rapid Transaction Triggers:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenStockIn()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-ground hairline-all text-ink hover:bg-ink hover:text-white transition-colors font-mono text-xs uppercase rounded-full"
          >
            <TrendingUp size={12} className="text-signal" />
            Stock In (Ingress)
          </button>

          <button
            onClick={() => onOpenStockOut()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-ground hairline-all text-ink hover:bg-ink hover:text-white transition-colors font-mono text-xs uppercase rounded-full"
          >
            <TrendingDown size={12} className="text-signal" />
            Stock Out (Egress)
          </button>

          <button
            onClick={onOpenAddProduct}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-ink text-white hover:bg-signal transition-colors font-mono text-xs uppercase rounded-full"
          >
            <Plus size={12} />
            Register SKU
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stage text-ink hover:bg-ink hover:text-white transition-colors font-mono text-xs uppercase rounded-full"
          >
            <BarChart3 size={12} />
            Analytics Suite
          </button>
        </div>
      </div>

      {/* AI Executive Intelligence Widget */}
      <ExecutiveSummaryWidget />

      {/* Movement Velocity Chart & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MovementChart transactions={transactions} />
        </div>
        <div className="lg:col-span-1">
          <LowStockAlerts
            products={products}
            onTriggerRestock={prod => onOpenStockIn(prod)}
          />
        </div>
      </div>

      {/* Advanced Visual Analytics Matrix (Category, Valuation Trajectory, Stock Health) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CategoryDistributionChart products={products} />
        <ValuationTrendChart transactions={transactions} currentValuation={stats.inventoryValuation} />
        <StockHealthRadarChart products={products} />
      </div>

      {/* Fast Moving Velocity vs Live Ledger Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FastMovingList products={products} transactions={transactions} />
        <RecentTransactions
          transactions={transactions}
          onViewAll={() => onNavigate('transactions')}
        />
      </div>
    </div>
  );
};
