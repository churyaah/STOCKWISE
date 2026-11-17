import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { formatCurrency, getStockStatus } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportCsv';
import {
  Boxes,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Download,
  Search,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';
import { Product } from '../../types';

interface InventoryViewProps {
  onTriggerStockIn: (product: Product) => void;
  onTriggerStockOut: (product: Product) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  onTriggerStockIn,
  onTriggerStockOut,
}) => {
  const { products, stats } = useData();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

  // Calculate valuation by category
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { count: number; units: number; valuation: number }> = {};
    for (const p of products) {
      if (!map[p.category]) {
        map[p.category] = { count: 0, units: 0, valuation: 0 };
      }
      map[p.category].count += 1;
      map[p.category].units += p.current_quantity;
      map[p.category].valuation += p.current_quantity * p.purchase_price;
    }
    return Object.entries(map).map(([category, data]) => ({
      category,
      ...data,
      pctOfTotal: stats.inventoryValuation > 0 ? (data.valuation / stats.inventoryValuation) * 100 : 0,
    })).sort((a, b) => b.valuation - a.valuation);
  }, [products, stats.inventoryValuation]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      const status = getStockStatus(p.current_quantity, p.reorder_level);
      const matchStatus = filter === 'ALL' || status === filter;

      return matchSearch && matchStatus;
    });
  }, [products, search, filter]);

  const handleExportInventoryCSV = () => {
    exportToCSV(filteredProducts, 'Inventory_Valuation_Audit', [
      { header: 'SKU', key: 'sku' },
      { header: 'Product Name', key: 'name' },
      { header: 'Category', key: 'category' },
      { header: 'Stock Units', key: 'current_quantity' },
      { header: 'Reorder Threshold', key: 'reorder_level' },
      { header: 'Target Stock', key: 'target_stock_level' },
      { header: 'Unit Cost', key: p => formatCurrency(p.purchase_price) },
      { header: 'Total Asset Value', key: p => formatCurrency(p.current_quantity * p.purchase_price) },
      { header: 'Selling Price', key: p => formatCurrency(p.selling_price) },
      { header: 'Stock Health', key: p => getStockStatus(p.current_quantity, p.reorder_level) },
      { header: 'Supplier', key: p => p.supplier?.company || 'Unassigned' },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* 4 Status KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverable className="border-mono-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[11px] text-mono-500 uppercase tracking-wider">
                Total Inventory Valuation
              </p>
              <h3 className="font-display text-2xl font-bold text-mono-950 mt-1">
                {formatCurrency(stats.inventoryValuation)}
              </h3>
              <p className="font-mono text-[10px] text-mono-500 mt-0.5">
                {stats.totalStockQuantity} total physical units
              </p>
            </div>
            <div className="p-2.5 bg-mono-150 text-mono-900">
              <Boxes size={20} />
            </div>
          </div>
        </Card>

        <Card hoverable className="border-mono-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[11px] text-mono-500 uppercase tracking-wider">
                Optimal Stock
              </p>
              <h3 className="font-display text-2xl font-bold text-mono-950 mt-1">
                {stats.inStockCount} SKUs
              </h3>
              <p className="font-mono text-[10px] text-mono-500 mt-0.5">
                Above safety threshold
              </p>
            </div>
            <div className="p-2.5 bg-mono-950 text-mono-0">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </Card>

        <Card hoverable className="border-mono-950 bg-mono-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[11px] text-mono-500 uppercase tracking-wider">
                Low Stock Threshold
              </p>
              <h3 className="font-display text-2xl font-bold text-mono-950 mt-1">
                {stats.lowStockProductsCount} SKUs
              </h3>
              <p className="font-mono text-[10px] text-mono-500 mt-0.5">
                Needs restocking soon
              </p>
            </div>
            <div className="p-2.5 bg-mono-150 text-mono-900 border border-mono-800">
              <AlertCircle size={20} />
            </div>
          </div>
        </Card>

        <Card hoverable className="border-mono-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[11px] text-mono-500 uppercase tracking-wider">
                Stockout (Zero)
              </p>
              <h3 className="font-display text-2xl font-bold text-mono-950 mt-1">
                {stats.outOfStockCount} SKUs
              </h3>
              <p className="font-mono text-[10px] text-mono-500 mt-0.5">
                Immediate stockout risk
              </p>
            </div>
            <div className="p-2.5 bg-mono-0 text-mono-950 border border-mono-300">
              <XCircle size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* Stock Distribution by Category */}
      <Card
        title="Asset Distribution by Category"
        subtitle="Capital allocation and unit share across product families"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryBreakdown.map(item => (
            <div
              key={item.category}
              className="p-4 border border-mono-200 bg-mono-50 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-sans font-bold text-xs text-mono-950">
                  {item.category}
                </span>
                <span className="font-mono text-[10px] bg-mono-200 px-1.5 py-0.5">
                  {item.count} SKUs
                </span>
              </div>

              <div className="flex items-baseline justify-between font-mono text-xs">
                <span className="text-mono-600">Valuation:</span>
                <span className="font-bold text-mono-950">{formatCurrency(item.valuation)}</span>
              </div>

              <div className="w-full bg-mono-200 h-1.5 overflow-hidden">
                <div
                  className="bg-mono-950 h-full"
                  style={{ width: `${Math.min(100, item.pctOfTotal)}%` }}
                />
              </div>

              <div className="flex items-center justify-between font-mono text-[10px] text-mono-500">
                <span>{item.units} on-hand units</span>
                <span>{item.pctOfTotal.toFixed(1)}% of total</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Product Stock Table */}
      <div className="bg-mono-0 border border-mono-200 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mono-400" />
              <input
                type="text"
                placeholder="Search stock by SKU, product name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-mono-50 border border-mono-300 font-sans text-xs px-3.5 py-2 pl-9 focus:outline-none focus:border-mono-950"
              />
            </div>

            <select
              value={filter}
              onChange={e => setFilter(e.target.value as any)}
              className="bg-mono-0 border border-mono-300 font-mono text-xs px-2.5 py-2 uppercase text-mono-800 focus:outline-none"
            >
              <option value="ALL">All States</option>
              <option value="IN_STOCK">Optimal Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Depleted</option>
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportInventoryCSV}
            icon={<Download size={14} />}
          >
            Export Stock Audit CSV
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-mono-200 bg-mono-50 font-mono text-[11px] text-mono-600 uppercase tracking-wider">
                <th className="py-3 px-4">SKU / Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">On-Hand</th>
                <th className="py-3 px-4 text-right">Reorder Pt</th>
                <th className="py-3 px-4 text-right">Target</th>
                <th className="py-3 px-4">Health</th>
                <th className="py-3 px-4 text-right">Asset Value</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mono-200">
              {filteredProducts.map(p => {
                const status = getStockStatus(p.current_quantity, p.reorder_level);
                const assetVal = p.current_quantity * p.purchase_price;

                return (
                  <tr key={p.id} className="hover:bg-mono-50/70">
                    <td className="py-3 px-4 font-mono">
                      <p className="font-bold text-mono-950">{p.sku}</p>
                      <p className="font-sans text-[11px] text-mono-600">{p.name}</p>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-mono-600">
                      {p.category}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-mono-950">
                      {p.current_quantity}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-mono-500">
                      {p.reorder_level}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-mono-500">
                      {p.target_stock_level || 50}
                    </td>

                    <td className="py-3 px-4">
                      <Badge status={status} size="sm" />
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-semibold text-mono-950">
                      {formatCurrency(assetVal)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          icon={<PlusCircle size={11} />}
                          onClick={() => onTriggerStockIn(p)}
                        >
                          In
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={p.current_quantity === 0}
                          icon={<MinusCircle size={11} />}
                          onClick={() => onTriggerStockOut(p)}
                        >
                          Out
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
