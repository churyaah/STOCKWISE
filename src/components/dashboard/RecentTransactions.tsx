import React from 'react';
import { Card } from '../common/Card';
import { InventoryTransaction } from '../../types';
import { formatDateTime } from '../../utils/formatters';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface RecentTransactionsProps {
  transactions: InventoryTransaction[];
  onViewAll: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  onViewAll,
}) => {
  const recent = transactions.slice(0, 6);

  return (
    <Card
      title="Recent Ledger Activity"
      subtitle="Latest recorded stock-in and stock-out events"
      headerAction={
        <button
          onClick={onViewAll}
          className="font-mono text-xs text-mono-600 hover:text-mono-950 underline decoration-mono-400 hover:decoration-mono-950 uppercase"
        >
          View Full Ledger &rarr;
        </button>
      }
    >
      {recent.length === 0 ? (
        <div className="py-8 text-center text-mono-400 font-mono text-xs">
          No transactions recorded.
        </div>
      ) : (
        <div className="divide-y divide-mono-200">
          {recent.map(tx => {
            const isStockIn = tx.type === 'IN';
            return (
              <div
                key={tx.id}
                className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 border ${
                      isStockIn
                        ? 'bg-mono-950 text-mono-0 border-mono-950'
                        : 'bg-mono-100 text-mono-900 border-mono-300'
                    }`}
                  >
                    {isStockIn ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-sans font-semibold text-xs text-mono-950 truncate">
                      {tx.product?.name || `Product ID: ${tx.product_id}`}
                    </p>
                    <p className="font-mono text-[11px] text-mono-500">
                      {isStockIn ? 'STOCK IN' : 'STOCK OUT'} &bull; {tx.reason || 'General'} &bull;{' '}
                      {formatDateTime(tx.transaction_date)}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span
                    className={`font-mono text-xs font-bold ${
                      isStockIn ? 'text-mono-950' : 'text-mono-700'
                    }`}
                  >
                    {isStockIn ? `+${tx.quantity}` : `-${tx.quantity}`} units
                  </span>
                  <p className="font-mono text-[10px] text-mono-400 uppercase">
                    Balance: {tx.new_quantity}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
