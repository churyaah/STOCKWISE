import React, { useState, useMemo } from 'react';
import { InventoryTransaction } from '../../types';
import { Button } from '../common/Button';
import { formatDateTime } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportCsv';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Search,
  Filter,
} from 'lucide-react';

interface TransactionListProps {
  transactions: InventoryTransaction[];
  onOpenStockIn: () => void;
  onOpenStockOut: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onOpenStockIn,
  onOpenStockOut,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const matchType = typeFilter === 'ALL' || t.type === typeFilter;
      const term = search.toLowerCase();
      const matchSearch =
        (t.product?.name && t.product.name.toLowerCase().includes(term)) ||
        (t.product?.sku && t.product.sku.toLowerCase().includes(term)) ||
        (t.reference_number && t.reference_number.toLowerCase().includes(term)) ||
        (t.reason && t.reason.toLowerCase().includes(term));

      return matchType && matchSearch;
    });
  }, [transactions, typeFilter, search]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const handleExportCSV = () => {
    exportToCSV(filtered, 'Inventory_Movement_Ledger', [
      { header: 'Transaction ID', key: 'id' },
      { header: 'Date', key: t => formatDateTime(t.transaction_date) },
      { header: 'Type', key: 'type' },
      { header: 'Product SKU', key: t => t.product?.sku || '' },
      { header: 'Product Name', key: t => t.product?.name || '' },
      { header: 'Quantity', key: 'quantity' },
      { header: 'Previous Balance', key: 'previous_quantity' },
      { header: 'New Balance', key: 'new_quantity' },
      { header: 'Reason', key: t => t.reason || '' },
      { header: 'Reference #', key: t => t.reference_number || '' },
      { header: 'Supplier', key: t => t.supplier?.company || '' },
      { header: 'Notes', key: t => t.notes || '' },
    ]);
  };

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="bg-mono-0 border border-mono-200 p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mono-400" />
            <input
              type="text"
              placeholder="Search by SKU, product, reference or reason..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-mono-50 border border-mono-300 font-sans text-xs px-3.5 py-2 pl-9 focus:outline-none focus:border-mono-950"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-mono-500 hidden sm:block" />
            <select
              value={typeFilter}
              onChange={e => {
                setTypeFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-mono-0 border border-mono-300 font-mono text-xs px-2.5 py-2 uppercase text-mono-800 focus:outline-none focus:border-mono-950"
            >
              <option value="ALL">All Types</option>
              <option value="IN">Stock In (+ Inbound)</option>
              <option value="OUT">Stock Out (- Outbound)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            icon={<Download size={14} />}
          >
            Export Ledger CSV
          </Button>
          <Button size="sm" onClick={onOpenStockIn}>
            + Stock In
          </Button>
          <Button size="sm" variant="secondary" onClick={onOpenStockOut}>
            - Stock Out
          </Button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-mono-0 border border-mono-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-mono-200 bg-mono-50 font-mono text-[11px] text-mono-600 uppercase tracking-wider">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Direction</th>
              <th className="py-3 px-4">Product / SKU</th>
              <th className="py-3 px-4 text-right">Delta</th>
              <th className="py-3 px-4 text-right">Balance Shift</th>
              <th className="py-3 px-4">Reason / Reference</th>
              <th className="py-3 px-4">Vendor / Notes</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-mono-200 text-xs">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-mono-400 font-mono">
                  No movement transactions recorded for current criteria.
                </td>
              </tr>
            ) : (
              paginated.map(tx => {
                const isStockIn = tx.type === 'IN';
                return (
                  <tr key={tx.id} className="hover:bg-mono-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-mono-500 text-[11px] whitespace-nowrap">
                      {formatDateTime(tx.transaction_date)}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[10px] font-bold uppercase border ${
                          isStockIn
                            ? 'bg-mono-950 text-mono-0 border-mono-950'
                            : 'bg-mono-150 text-mono-900 border-mono-300'
                        }`}
                      >
                        {isStockIn ? <ArrowDownLeft size={11} /> : <ArrowUpRight size={11} />}
                        {isStockIn ? 'STOCK IN' : 'STOCK OUT'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-sans font-semibold text-mono-950">
                        {tx.product?.name || 'Catalog Item'}
                      </p>
                      <p className="font-mono text-[11px] text-mono-500">
                        SKU: {tx.product?.sku || 'N/A'}
                      </p>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-mono-950">
                      {isStockIn ? `+${tx.quantity}` : `-${tx.quantity}`}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-[11px] text-mono-600">
                      <span className="text-mono-400">{tx.previous_quantity}</span>
                      <span className="mx-1">&rarr;</span>
                      <span className="font-bold text-mono-950">{tx.new_quantity}</span>
                    </td>

                    <td className="py-3 px-4 font-sans text-mono-800">
                      <div className="font-medium">{tx.reason || 'Standard Adjustment'}</div>
                      {tx.reference_number && (
                        <div className="font-mono text-[10px] text-mono-500 uppercase">
                          Ref: {tx.reference_number}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 font-sans text-mono-600 text-[11px] max-w-xs truncate">
                      {tx.supplier?.company || tx.notes || '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="px-4 py-3 border-t border-mono-200 bg-mono-50 flex items-center justify-between text-xs font-mono text-mono-600">
          <div>
            Showing{' '}
            <span className="font-bold text-mono-950">
              {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-bold text-mono-950">
              {Math.min(currentPage * pageSize, filtered.length)}
            </span>{' '}
            of <span className="font-bold text-mono-950">{filtered.length}</span> ledger rows
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 border border-mono-300 bg-mono-0 disabled:opacity-40 uppercase hover:bg-mono-950 hover:text-mono-0 transition-colors"
            >
              Prev
            </button>
            <span className="px-2 font-bold text-mono-950">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 border border-mono-300 bg-mono-0 disabled:opacity-40 uppercase hover:bg-mono-950 hover:text-mono-0 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
