import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Product } from '../../types';
import { TrendingDown, ArrowRight, AlertTriangle } from 'lucide-react';

interface StockOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: {
    productId: string;
    quantity: number;
    reason: string;
    referenceNumber?: string;
    notes?: string;
    transactionDate?: string;
  }) => Promise<void>;
  preselectedProduct?: Product | null;
  products: Product[];
}

const STOCK_OUT_REASONS = [
  'Direct Sale / Customer Order',
  'Damaged / Defective Stock',
  'Internal Testing & Development',
  'Scrap / Disposal',
  'Customer Return / RMA Out',
  'Cycle Count Audit Adjustment',
];

export const StockOutModal: React.FC<StockOutModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  preselectedProduct,
  products,
}) => {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState(STOCK_OUT_REASONS[0]);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedProduct) {
      setProductId(preselectedProduct.id);
    } else if (products.length > 0) {
      setProductId(products[0].id);
    }
    setQuantity('1');
    setReason(STOCK_OUT_REASONS[0]);
    setReferenceNumber(`SO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setNotes('');
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setError(null);
  }, [preselectedProduct, products, isOpen]);

  const selectedProduct = products.find(p => p.id === productId);
  const numQty = parseInt(quantity, 10) || 0;
  const currentQty = selectedProduct?.current_quantity || 0;
  const isInsufficient = numQty > currentQty;
  const projectedQty = Math.max(0, currentQty - numQty);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      setError('Please select a product.');
      return;
    }
    if (numQty <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }
    if (isInsufficient) {
      setError(
        `Negative inventory prohibited. Requested ${numQty} units exceeds on-hand stock of ${currentQty} units.`
      );
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit({
        productId,
        quantity: numQty,
        reason,
        referenceNumber: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        transactionDate: new Date(transactionDate).toISOString(),
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Stock Out transaction failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Stock Out (Fulfillment / Dispatch)"
      subtitle="Decreases warehouse inventory balance. Negative inventory strictly disallowed."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-mono-100 border border-mono-950 font-mono text-xs font-bold text-mono-950 flex items-start gap-2">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <Select
          label="Target Product / SKU"
          required
          value={productId}
          onChange={e => setProductId(e.target.value)}
        >
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {p.sku} — {p.name} (Available: {p.current_quantity})
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Outbound Quantity"
            required
            type="number"
            min="1"
            max={currentQty > 0 ? currentQty : 1}
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            error={isInsufficient ? `Max available: ${currentQty}` : undefined}
          />

          <Input
            label="Dispatch Date"
            required
            type="date"
            value={transactionDate}
            onChange={e => setTransactionDate(e.target.value)}
          />
        </div>

        {/* Projected Inventory Calculation Preview */}
        {selectedProduct && (
          <div
            className={`p-3 border font-mono text-xs flex items-center justify-between ${
              isInsufficient
                ? 'bg-mono-100 border-mono-950 font-bold'
                : 'bg-mono-50 border-mono-300'
            }`}
          >
            <span className="text-mono-600">Balance Preview:</span>
            <div className="flex items-center gap-2 font-bold text-mono-950">
              <span>{currentQty} units</span>
              <ArrowRight size={13} />
              <span className={isInsufficient ? 'line-through text-mono-500' : 'underline'}>
                {projectedQty} units
              </span>
              <span className="text-mono-600 font-normal">(-{numQty})</span>
            </div>
          </div>
        )}

        <Select
          label="Dispatch Reason"
          required
          value={reason}
          onChange={e => setReason(e.target.value)}
        >
          {STOCK_OUT_REASONS.map(r => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>

        <Input
          label="Sales Order / Reference #"
          value={referenceNumber}
          onChange={e => setReferenceNumber(e.target.value)}
          placeholder="e.g. SO-2026-1049"
        />

        <Input
          label="Transaction Notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Carrier tracking, recipient department, project code..."
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-mono-200">
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || isInsufficient || currentQty === 0}
            icon={<TrendingDown size={14} />}
          >
            {submitting ? 'Recording...' : 'Commit Stock Out'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
