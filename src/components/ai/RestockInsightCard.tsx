import React, { useMemo } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Product, Supplier } from '../../types';
import { geminiService } from '../../services/geminiService';
import { formatCurrency } from '../../utils/formatters';
import { PlusCircle } from 'lucide-react';

interface RestockInsightCardProps {
  products: Product[];
  suppliers: Supplier[];
  onTriggerStockIn: (product: Product) => void;
}

export const RestockInsightCard: React.FC<RestockInsightCardProps> = ({
  products,
  suppliers,
  onTriggerStockIn,
}) => {
  const recommendations = useMemo(() => {
    return geminiService.calculateRestockRecommendations(products, suppliers);
  }, [products, suppliers]);

  const totalEstCost = useMemo(() => {
    return recommendations.reduce((acc, r) => acc + r.estimatedCost, 0);
  }, [recommendations]);

  return (
    <Card
      title="Algorithmic Restocking Intelligence"
      subtitle="Deficit analysis & priority replenishment orders"
      headerAction={
        <div className="font-mono text-xs text-mono-700">
          <span>Est. Capital: </span>
          <span className="font-bold text-mono-950">{formatCurrency(totalEstCost)}</span>
        </div>
      }
    >
      {recommendations.length === 0 ? (
        <div className="py-8 text-center text-mono-400 font-mono text-xs">
          All catalog items exceed safe replenishment thresholds. No restock orders needed.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-mono-200 bg-mono-50 font-mono text-[10px] text-mono-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Product / SKU</th>
                <th className="py-2.5 px-3">Current / Target</th>
                <th className="py-2.5 px-3 text-right">Order Qty</th>
                <th className="py-2.5 px-3 text-right">Est. Cost</th>
                <th className="py-2.5 px-3">Supplier</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mono-200">
              {recommendations.map(rec => {
                const prod = products.find(p => p.id === rec.productId);
                return (
                  <tr key={rec.productId} className="hover:bg-mono-50/70">
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block font-mono text-[9px] font-bold px-1.5 py-0.5 uppercase border ${
                          rec.priority === 'CRITICAL'
                            ? 'bg-mono-950 text-mono-0 border-mono-950'
                            : rec.priority === 'HIGH'
                            ? 'bg-mono-150 text-mono-900 border-mono-800'
                            : 'bg-mono-50 text-mono-600 border-mono-200'
                        }`}
                      >
                        {rec.priority}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <p className="font-sans font-semibold text-mono-950">{rec.productName}</p>
                      <p className="font-mono text-[10px] text-mono-500">SKU: {rec.sku}</p>
                    </td>

                    <td className="py-2.5 px-3 font-mono">
                      <span className="font-bold text-mono-950">{rec.currentStock}</span>
                      <span className="text-mono-400"> / {rec.targetStock} units</span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold text-mono-950">
                      +{rec.recommendedOrder}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-mono-700">
                      {formatCurrency(rec.estimatedCost)}
                    </td>

                    <td className="py-2.5 px-3 font-mono text-[11px] text-mono-600 truncate max-w-[120px]">
                      {rec.supplierName}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      {prod && (
                        <Button
                          size="sm"
                          variant="outline"
                          icon={<PlusCircle size={11} />}
                          onClick={() => onTriggerStockIn(prod)}
                        >
                          Stock In
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
