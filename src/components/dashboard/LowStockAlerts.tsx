import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Product } from '../../types';
import { AlertCircle, PlusCircle } from 'lucide-react';

interface LowStockAlertsProps {
  products: Product[];
  onTriggerRestock: (product: Product) => void;
}

export const LowStockAlerts: React.FC<LowStockAlertsProps> = ({
  products,
  onTriggerRestock,
}) => {
  const lowStockItems = products.filter(
    p => p.current_quantity <= p.reorder_level
  );

  return (
    <Card
      title="Replenishment Alerts"
      subtitle="SKUs requiring immediate reorder action"
      headerAction={
        <span className="font-mono text-xs px-2 py-0.5 bg-mono-150 border border-mono-300 font-bold">
          {lowStockItems.length} ACTIONABLE
        </span>
      }
    >
      {lowStockItems.length === 0 ? (
        <div className="py-8 text-center text-mono-400 font-mono text-xs">
          No low stock alerts. All inventory items are above their safety thresholds.
        </div>
      ) : (
        <div className="divide-y divide-mono-200">
          {lowStockItems.map(item => {
            const deficit = Math.max(0, (item.target_stock_level || item.reorder_level * 2) - item.current_quantity);
            const isZero = item.current_quantity === 0;

            return (
              <div
                key={item.id}
                className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 p-1.5 bg-mono-100 text-mono-900 border border-mono-200">
                    <AlertCircle size={15} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-sans font-semibold text-xs text-mono-950 truncate">
                        {item.name}
                      </p>
                      <Badge
                        status={isZero ? 'OUT_OF_STOCK' : 'LOW_STOCK'}
                        size="sm"
                      />
                    </div>
                    <p className="font-mono text-[11px] text-mono-500 mt-0.5">
                      SKU: <span className="font-semibold text-mono-900">{item.sku}</span> &bull; Current: {item.current_quantity} / Reorder: {item.reorder_level} (Deficit: +{deficit})
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  icon={<PlusCircle size={12} />}
                  onClick={() => onTriggerRestock(item)}
                >
                  Restock
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
