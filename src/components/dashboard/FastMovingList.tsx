import React, { useMemo } from 'react';
import { Card } from '../common/Card';
import { InventoryTransaction, Product } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { ArrowUpRight } from 'lucide-react';

interface FastMovingListProps {
  products: Product[];
  transactions: InventoryTransaction[];
}

export const FastMovingList: React.FC<FastMovingListProps> = ({
  products,
  transactions,
}) => {
  const ranked = useMemo(() => {
    const map: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.type === 'OUT') {
        map[tx.product_id] = (map[tx.product_id] || 0) + tx.quantity;
      }
    }

    const list = products
      .map(p => ({
        product: p,
        dispatched: map[p.id] || 0,
        revenue: (map[p.id] || 0) * p.selling_price,
      }))
      .filter(item => item.dispatched > 0)
      .sort((a, b) => b.dispatched - a.dispatched);

    return list.slice(0, 5);
  }, [products, transactions]);

  return (
    <Card
      title="High-Velocity Products"
      subtitle="Top items ranked by outbound demand"
      className="h-full"
    >
      {ranked.length === 0 ? (
        <div className="py-8 text-center text-mono-400 font-mono text-xs">
          No outbound transactions recorded yet to establish product velocity.
        </div>
      ) : (
        <div className="divide-y divide-mono-200">
          {ranked.map((item, idx) => (
            <div
              key={item.product.id}
              className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-xs font-bold text-mono-400 w-4">
                  0{idx + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-sans font-semibold text-xs text-mono-950 truncate">
                    {item.product.name}
                  </p>
                  <p className="font-mono text-[11px] text-mono-500">
                    SKU: {item.product.sku} &bull; {item.product.category}
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="font-mono text-xs font-bold text-mono-950 flex items-center justify-end gap-1">
                  <span>{item.dispatched} units</span>
                  <ArrowUpRight size={12} className="text-mono-600" />
                </p>
                <p className="font-mono text-[11px] text-mono-500">
                  {formatCurrency(item.revenue)} rev
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
