import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportCsv';
import {
  Download,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { Product } from '../../types';

export const ReportsView: React.FC = () => {
  const { products, transactions, stats } = useData();
  const [activeReport, setActiveReport] = useState<
    'VALUATION' | 'ACTIVITY' | 'FAST_MOVING' | 'SLOW_MOVING' | 'LOW_STOCK' | 'CATEGORY'
  >('VALUATION');
  const [timeframe, setTimeframe] = useState<'ALL' | '7D' | '30D'>('ALL');

  // Filter transactions by timeframe
  const filteredTransactions = useMemo(() => {
    if (timeframe === 'ALL') return transactions;
    const now = new Date().getTime();
    const days = timeframe === '7D' ? 7 : 30;
    const cutoff = now - days * 24 * 60 * 60 * 1000;
    return transactions.filter(t => new Date(t.transaction_date).getTime() >= cutoff);
  }, [transactions, timeframe]);

  // Product Outbound Aggregations
  const productVelocity = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of filteredTransactions) {
      if (t.type === 'OUT') {
        map[t.product_id] = (map[t.product_id] || 0) + t.quantity;
      }
    }
    return products.map(p => ({
      product: p,
      unitsDispatched: map[p.id] || 0,
      turnoverRevenue: (map[p.id] || 0) * p.selling_price,
    }));
  }, [products, filteredTransactions]);

  const fastMoving = useMemo(() => {
    return [...productVelocity]
      .filter(item => item.unitsDispatched > 0)
      .sort((a, b) => b.unitsDispatched - a.unitsDispatched);
  }, [productVelocity]);

  const slowMoving = useMemo(() => {
    return [...productVelocity]
      .filter(item => item.unitsDispatched === 0)
      .sort((a, b) => a.product.current_quantity - b.product.current_quantity);
  }, [productVelocity]);

  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.current_quantity <= p.reorder_level);
  }, [products]);

  // Category Distribution
  const categoryStats = useMemo(() => {
    const map: Record<string, { count: number; units: number; valuation: number }> = {};
    for (const p of products) {
      if (!map[p.category]) map[p.category] = { count: 0, units: 0, valuation: 0 };
      map[p.category].count += 1;
      map[p.category].units += p.current_quantity;
      map[p.category].valuation += p.current_quantity * p.purchase_price;
    }
    return Object.entries(map).map(([name, data]) => ({
      name,
      ...data,
      pct: stats.inventoryValuation > 0 ? (data.valuation / stats.inventoryValuation) * 100 : 0,
    }));
  }, [products, stats.inventoryValuation]);

  // Dynamic CSV Exporter based on active report
  const handleExport = () => {
    switch (activeReport) {
      case 'VALUATION':
        exportToCSV(products, 'Report_Inventory_Valuation', [
          { header: 'SKU', key: 'sku' },
          { header: 'Product Name', key: 'name' },
          { header: 'Category', key: 'category' },
          { header: 'Unit Cost ($)', key: 'purchase_price' },
          { header: 'Stock Units', key: 'current_quantity' },
          { header: 'Asset Value ($)', key: (p: Product) => (p.current_quantity * p.purchase_price).toFixed(2) },
          { header: 'Selling Price ($)', key: 'selling_price' },
          { header: 'Potential Retail ($)', key: (p: Product) => (p.current_quantity * p.selling_price).toFixed(2) },
        ]);
        break;

      case 'ACTIVITY':
        exportToCSV(filteredTransactions, 'Report_Stock_Movement_Activity', [
          { header: 'Date', key: t => formatDateTime(t.transaction_date) },
          { header: 'Type', key: 'type' },
          { header: 'Product SKU', key: t => t.product?.sku || '' },
          { header: 'Quantity', key: 'quantity' },
          { header: 'Reason', key: t => t.reason || '' },
          { header: 'Reference', key: t => t.reference_number || '' },
          { header: 'Balance Result', key: 'new_quantity' },
        ]);
        break;

      case 'FAST_MOVING':
        exportToCSV(fastMoving, 'Report_Fast_Moving_Velocity', [
          { header: 'SKU', key: item => item.product.sku },
          { header: 'Product Name', key: item => item.product.name },
          { header: 'Category', key: item => item.product.category },
          { header: 'Units Dispatched', key: 'unitsDispatched' },
          { header: 'Turnover Revenue ($)', key: item => item.turnoverRevenue.toFixed(2) },
          { header: 'Current Stock', key: item => item.product.current_quantity },
        ]);
        break;

      case 'SLOW_MOVING':
        exportToCSV(slowMoving, 'Report_Slow_Moving_Deadstock', [
          { header: 'SKU', key: item => item.product.sku },
          { header: 'Product Name', key: item => item.product.name },
          { header: 'Category', key: item => item.product.category },
          { header: 'Current Inactive Units', key: item => item.product.current_quantity },
          { header: 'Locked Capital ($)', key: item => (item.product.current_quantity * item.product.purchase_price).toFixed(2) },
        ]);
        break;

      case 'LOW_STOCK':
        exportToCSV(lowStockProducts, 'Report_Low_Stock_Action_List', [
          { header: 'SKU', key: 'sku' },
          { header: 'Product Name', key: 'name' },
          { header: 'Current Stock', key: 'current_quantity' },
          { header: 'Reorder Level', key: 'reorder_level' },
          { header: 'Target Stock', key: 'target_stock_level' },
          { header: 'Replenishment Deficit', key: p => Math.max(0, (p.target_stock_level || 50) - p.current_quantity) },
          { header: 'Procurement Cost ($)', key: p => (Math.max(0, (p.target_stock_level || 50) - p.current_quantity) * p.purchase_price).toFixed(2) },
        ]);
        break;

      case 'CATEGORY':
        exportToCSV(categoryStats, 'Report_Category_Capital_Distribution', [
          { header: 'Category', key: 'name' },
          { header: 'SKUs Count', key: 'count' },
          { header: 'Total Physical Units', key: 'units' },
          { header: 'Valuation ($)', key: c => c.valuation.toFixed(2) },
          { header: 'Share of Total (%)', key: c => c.pct.toFixed(2) },
        ]);
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Switcher Header */}
      <div className="bg-mono-0 border border-mono-200 p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar font-mono text-xs">
          {[
            { id: 'VALUATION', label: 'Valuation' },
            { id: 'ACTIVITY', label: 'Stock Activity' },
            { id: 'FAST_MOVING', label: 'Fast-Moving' },
            { id: 'SLOW_MOVING', label: 'Slow-Moving' },
            { id: 'LOW_STOCK', label: 'Low Stock' },
            { id: 'CATEGORY', label: 'Categories' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as any)}
              className={`px-3 py-1.5 uppercase font-medium transition-colors whitespace-nowrap border ${
                activeReport === tab.id
                  ? 'bg-mono-950 text-mono-0 border-mono-950 font-bold'
                  : 'bg-mono-50 text-mono-700 border-mono-200 hover:bg-mono-150'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={e => setTimeframe(e.target.value as any)}
            className="bg-mono-0 border border-mono-300 font-mono text-xs px-2.5 py-1.5 uppercase text-mono-800 focus:outline-none"
          >
            <option value="ALL">All Recorded History</option>
            <option value="30D">Last 30 Days</option>
            <option value="7D">Last 7 Days</option>
          </select>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            icon={<Download size={13} />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* 1. Valuation Report */}
      {activeReport === 'VALUATION' && (
        <Card
          title="Inventory Valuation Breakdown"
          subtitle="Calculation Method: Sum of (Current Quantity × Unit Purchase Price) calculated deterministically"
          headerAction={
            <span className="font-mono text-sm font-bold text-mono-950">
              Total: {formatCurrency(stats.inventoryValuation)}
            </span>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-mono-200 bg-mono-50 font-mono text-[10px] text-mono-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Units</th>
                  <th className="py-2.5 px-3 text-right">Unit Cost</th>
                  <th className="py-2.5 px-3 text-right">Cost Asset Value</th>
                  <th className="py-2.5 px-3 text-right">Selling Price</th>
                  <th className="py-2.5 px-3 text-right">Retail Potential</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mono-200 font-mono">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-mono-50/70">
                    <td className="py-2.5 px-3 font-bold text-mono-950">{p.sku}</td>
                    <td className="py-2.5 px-3 font-sans text-mono-900">{p.name}</td>
                    <td className="py-2.5 px-3 text-mono-600">{p.category}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-mono-950">{p.current_quantity}</td>
                    <td className="py-2.5 px-3 text-right text-mono-600">{formatCurrency(p.purchase_price)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-mono-950">
                      {formatCurrency(p.current_quantity * p.purchase_price)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-mono-600">{formatCurrency(p.selling_price)}</td>
                    <td className="py-2.5 px-3 text-right text-mono-800">
                      {formatCurrency(p.current_quantity * p.selling_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 2. Stock Activity Report */}
      {activeReport === 'ACTIVITY' && (
        <Card
          title="Stock In vs Stock Out Activity Ledger"
          subtitle="Calculation Method: Directional volume aggregation from verified ledger events"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-mono-200 bg-mono-50 font-mono text-[10px] text-mono-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Product SKU</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3">Reference #</th>
                  <th className="py-2.5 px-3 text-right">Resulting Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mono-200 font-mono">
                {filteredTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-mono-50/70">
                    <td className="py-2.5 px-3 text-mono-500">{formatDateTime(t.transaction_date)}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-mono-950">
                        {t.type === 'IN' ? '+ STOCK IN' : '- STOCK OUT'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-mono-950">{t.product?.sku || 'N/A'}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-mono-950">{t.quantity}</td>
                    <td className="py-2.5 px-3 font-sans text-mono-700">{t.reason || 'General'}</td>
                    <td className="py-2.5 px-3 text-mono-500">{t.reference_number || '—'}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-mono-950">{t.new_quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 3. Fast-Moving Products */}
      {activeReport === 'FAST_MOVING' && (
        <Card
          title="Fast-Moving Product Velocity"
          subtitle="Calculation Method: Sum of outbound fulfilled units ranked in descending order"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-mono-200 bg-mono-50 font-mono text-[10px] text-mono-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Units Dispatched</th>
                  <th className="py-2.5 px-3 text-right">Turnover Revenue</th>
                  <th className="py-2.5 px-3 text-right">Current On-Hand</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mono-200 font-mono">
                {fastMoving.map((item, idx) => (
                  <tr key={item.product.id} className="hover:bg-mono-50/70">
                    <td className="py-2.5 px-3 font-bold text-mono-400">#{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-mono-950">{item.product.sku}</td>
                    <td className="py-2.5 px-3 font-sans text-mono-900">{item.product.name}</td>
                    <td className="py-2.5 px-3 text-mono-600">{item.product.category}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-mono-950">{item.unitsDispatched}</td>
                    <td className="py-2.5 px-3 text-right text-mono-900">{formatCurrency(item.turnoverRevenue)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-mono-950">{item.product.current_quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 4. Slow-Moving / Deadstock */}
      {activeReport === 'SLOW_MOVING' && (
        <Card
          title="Slow-Moving &amp; Inactive Stock"
          subtitle="Calculation Method: Products with zero outbound sales transactions in the selected period"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-mono-200 bg-mono-50 font-mono text-[10px] text-mono-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Inactive Units</th>
                  <th className="py-2.5 px-3 text-right">Tied-Up Capital</th>
                  <th className="py-2.5 px-3">Supplier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mono-200 font-mono">
                {slowMoving.map(item => (
                  <tr key={item.product.id} className="hover:bg-mono-50/70">
                    <td className="py-2.5 px-3 font-bold text-mono-950">{item.product.sku}</td>
                    <td className="py-2.5 px-3 font-sans text-mono-900">{item.product.name}</td>
                    <td className="py-2.5 px-3 text-mono-600">{item.product.category}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-mono-950">{item.product.current_quantity}</td>
                    <td className="py-2.5 px-3 text-right text-mono-900">
                      {formatCurrency(item.product.current_quantity * item.product.purchase_price)}
                    </td>
                    <td className="py-2.5 px-3 text-mono-600">{item.product.supplier?.company || 'Unassigned'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 5. Low-Stock Products */}
      {activeReport === 'LOW_STOCK' && (
        <Card
          title="Low-Stock &amp; Depletion Report"
          subtitle="Calculation Method: Products where current_quantity <= reorder_level"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-mono-200 bg-mono-50 font-mono text-[10px] text-mono-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3 text-right">On-Hand</th>
                  <th className="py-2.5 px-3 text-right">Reorder Threshold</th>
                  <th className="py-2.5 px-3 text-right">Target Level</th>
                  <th className="py-2.5 px-3 text-right">Deficit (+Qty)</th>
                  <th className="py-2.5 px-3 text-right">Procurement Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mono-200 font-mono">
                {lowStockProducts.map(p => {
                  const target = p.target_stock_level || 50;
                  const deficit = Math.max(0, target - p.current_quantity);
                  const cost = deficit * p.purchase_price;

                  return (
                    <tr key={p.id} className="hover:bg-mono-50/70">
                      <td className="py-2.5 px-3 font-bold text-mono-950">{p.sku}</td>
                      <td className="py-2.5 px-3 font-sans text-mono-900">{p.name}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-mono-950">{p.current_quantity}</td>
                      <td className="py-2.5 px-3 text-right text-mono-500">{p.reorder_level}</td>
                      <td className="py-2.5 px-3 text-right text-mono-500">{target}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-mono-950">+{deficit}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-mono-950">{formatCurrency(cost)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 6. Category Distribution */}
      {activeReport === 'CATEGORY' && (
        <Card
          title="Category Capital Distribution"
          subtitle="Calculation Method: Proportionate asset value by category relative to total inventory value"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-mono-200 bg-mono-50 font-mono text-[10px] text-mono-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Category Name</th>
                  <th className="py-2.5 px-3 text-right">Active SKUs</th>
                  <th className="py-2.5 px-3 text-right">Physical Units</th>
                  <th className="py-2.5 px-3 text-right">Total Valuation</th>
                  <th className="py-2.5 px-3 text-right">Share of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mono-200 font-mono">
                {categoryStats.map(c => (
                  <tr key={c.name} className="hover:bg-mono-50/70">
                    <td className="py-2.5 px-3 font-sans font-bold text-mono-950">{c.name}</td>
                    <td className="py-2.5 px-3 text-right text-mono-700">{c.count}</td>
                    <td className="py-2.5 px-3 text-right text-mono-700">{c.units}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-mono-950">{formatCurrency(c.valuation)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-mono-950">{c.pct.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
