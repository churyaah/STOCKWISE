import React from 'react';
import { useData } from '../../context/DataContext';
import { KPICard } from './KPICard';
import { MovementChart } from './MovementChart';
import { LowStockAlerts } from './LowStockAlerts';
import { FastMovingList } from './FastMovingList';
import { RecentTransactions } from './RecentTransactions';
import { ExecutiveSummaryWidget } from '../ai/ExecutiveSummaryWidget';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import {
  Package,
  Boxes,
  DollarSign,
  AlertTriangle,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
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
      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Catalog Products"
          value={formatNumber(stats.totalProducts)}
          subtitle="Unique active SKU codes"
          icon={<Package size={20} />}
          trend={{ label: `${stats.inStockCount} at optimal levels`, direction: 'up' }}
        />

        <KPICard
          title="Total Stock Units"
          value={formatNumber(stats.totalStockQuantity)}
          subtitle="Physical inventory on-hand"
          icon={<Boxes size={20} />}
          trend={{ label: 'Aggregated warehouse balance', direction: 'neutral' }}
        />

        <KPICard
          title="Inventory Valuation"
          value={formatCurrency(stats.inventoryValuation)}
          subtitle="Total asset value at purchase cost"
          icon={<DollarSign size={20} />}
          trend={{ label: 'Deterministic cost calculation', direction: 'up' }}
        />

        <KPICard
          title="Low-Stock Alerts"
          value={formatNumber(stats.lowStockProductsCount)}
          subtitle={`${stats.outOfStockCount} zero-stock items`}
          icon={<AlertTriangle size={20} />}
          highlight={stats.lowStockProductsCount > 0}
          trend={{
            label: stats.lowStockProductsCount > 0 ? 'Replenishment needed' : 'All levels safe',
            direction: stats.lowStockProductsCount > 0 ? 'down' : 'up',
          }}
        />
      </div>

      {/* Quick Action Ribbon */}
      <div className="bg-mono-0 border border-mono-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-mono text-xs text-mono-600 uppercase">
          <span className="w-2 h-2 bg-mono-950 inline-block" />
          <span className="font-bold text-mono-950">Quick Dispatch Operations:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenStockIn()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-mono-0 border border-mono-900 text-mono-950 hover:bg-mono-950 hover:text-mono-0 transition-colors font-mono text-xs uppercase"
          >
            <TrendingUp size={13} />
            Record Stock In
          </button>

          <button
            onClick={() => onOpenStockOut()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-mono-0 border border-mono-900 text-mono-950 hover:bg-mono-950 hover:text-mono-0 transition-colors font-mono text-xs uppercase"
          >
            <TrendingDown size={13} />
            Record Stock Out
          </button>

          <button
            onClick={onOpenAddProduct}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-mono-950 border border-mono-950 text-mono-0 hover:bg-mono-0 hover:text-mono-950 transition-colors font-mono text-xs uppercase"
          >
            <PlusCircle size={13} />
            Add Product
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-mono-150 border border-mono-300 text-mono-800 hover:bg-mono-200 transition-colors font-mono text-xs uppercase"
          >
            <BarChart3 size={13} />
            View Reports
          </button>
        </div>
      </div>

      {/* AI Executive Intelligence Widget */}
      <ExecutiveSummaryWidget />

      {/* Primary Analytics Section: Chart & Replenishment Alerts */}
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

      {/* Secondary Analytics: Velocity vs Recent Activity */}
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
