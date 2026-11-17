import React, { useState, useEffect } from 'react';
import { Search, X, Package, Truck, ArrowLeftRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { NavigationTab } from '../layout/Sidebar';
import { formatCurrency } from '../../utils/formatters';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { products, suppliers, transactions } = useData();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open if caller handles state
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const filteredProducts = trimmed
    ? products.filter(
        p =>
          p.name.toLowerCase().includes(trimmed) ||
          p.sku.toLowerCase().includes(trimmed) ||
          p.category.toLowerCase().includes(trimmed)
      ).slice(0, 5)
    : [];

  const filteredSuppliers = trimmed
    ? suppliers.filter(
        s =>
          s.name.toLowerCase().includes(trimmed) ||
          s.company.toLowerCase().includes(trimmed) ||
          s.email.toLowerCase().includes(trimmed)
      ).slice(0, 4)
    : [];

  const filteredTransactions = trimmed
    ? transactions.filter(
        t =>
          (t.reason && t.reason.toLowerCase().includes(trimmed)) ||
          (t.reference_number && t.reference_number.toLowerCase().includes(trimmed))
      ).slice(0, 4)
    : [];

  const hasResults =
    filteredProducts.length > 0 ||
    filteredSuppliers.length > 0 ||
    filteredTransactions.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div
        className="fixed inset-0 bg-mono-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-mono-0 border border-mono-900 shadow-2xl z-10 animate-in zoom-in-95">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-mono-200">
          <Search size={18} className="text-mono-500 mr-3" />
          <input
            autoFocus
            type="text"
            placeholder="Type to search products, SKUs, suppliers or transaction codes..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full font-sans text-sm bg-transparent outline-none text-mono-950 placeholder:text-mono-400"
          />
          <button
            onClick={onClose}
            className="p-1 text-mono-400 hover:text-mono-950 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!trimmed && (
            <div className="py-8 text-center text-mono-400 font-mono text-xs">
              Type at least 1 character to initiate search across active database records.
            </div>
          )}

          {trimmed && !hasResults && (
            <div className="py-8 text-center text-mono-500 font-mono text-xs">
              No matching products, suppliers, or transactions found for &quot;{query}&quot;.
            </div>
          )}

          {/* Products Result Group */}
          {filteredProducts.length > 0 && (
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-mono-400 mb-2">
                Products &amp; SKUs ({filteredProducts.length})
              </p>
              <div className="space-y-1">
                {filteredProducts.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      onNavigate('products');
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 hover:bg-mono-100 cursor-pointer border border-transparent hover:border-mono-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-mono-150 text-mono-900">
                        <Package size={16} />
                      </div>
                      <div>
                        <p className="font-sans font-semibold text-xs text-mono-950">
                          {prod.name}
                        </p>
                        <p className="font-mono text-[11px] text-mono-500">
                          SKU: {prod.sku} &bull; {prod.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xs font-bold text-mono-950">
                        {prod.current_quantity} in stock
                      </p>
                      <p className="font-mono text-[11px] text-mono-500">
                        {formatCurrency(prod.selling_price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suppliers Result Group */}
          {filteredSuppliers.length > 0 && (
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-mono-400 mb-2">
                Suppliers ({filteredSuppliers.length})
              </p>
              <div className="space-y-1">
                {filteredSuppliers.map(sup => (
                  <div
                    key={sup.id}
                    onClick={() => {
                      onNavigate('suppliers');
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 hover:bg-mono-100 cursor-pointer border border-transparent hover:border-mono-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-mono-150 text-mono-900">
                        <Truck size={16} />
                      </div>
                      <div>
                        <p className="font-sans font-semibold text-xs text-mono-950">
                          {sup.company}
                        </p>
                        <p className="font-mono text-[11px] text-mono-500">
                          Contact: {sup.name} &bull; {sup.email}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transactions Group */}
          {filteredTransactions.length > 0 && (
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-mono-400 mb-2">
                Transactions ({filteredTransactions.length})
              </p>
              <div className="space-y-1">
                {filteredTransactions.map(tx => (
                  <div
                    key={tx.id}
                    onClick={() => {
                      onNavigate('transactions');
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 hover:bg-mono-100 cursor-pointer border border-transparent hover:border-mono-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-mono-150 text-mono-900">
                        <ArrowLeftRight size={16} />
                      </div>
                      <div>
                        <p className="font-mono font-bold text-xs text-mono-950 uppercase">
                          {tx.type === 'IN' ? '+ Stock In' : '- Stock Out'}: {tx.quantity} units
                        </p>
                        <p className="font-sans text-[11px] text-mono-500">
                          {tx.reason || 'General'} &bull; Ref: {tx.reference_number || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Keybind Info */}
        <div className="p-3 border-t border-mono-200 bg-mono-50 flex items-center justify-between font-mono text-[10px] text-mono-500">
          <span>Navigate with click</span>
          <span>ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
};
