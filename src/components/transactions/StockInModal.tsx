import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Product, Supplier } from '../../types';
import { TrendingUp, ArrowRight } from 'lucide-react';

interface StockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: {
    productId: string;
    quantity: number;
    supplierId?: string;
    referenceNumber?: string;
    notes?: string;
    transactionDate?: string;
  }) => Promise<void>;
  preselectedProduct?: Product | null;
  products: Product[];
  suppliers: Supplier[];
}

export const StockInModal: React.FC<StockInModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  preselectedProduct,
  products,
  suppliers,
}) => {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('10');
  const [supplierId, setSupplierId] = useState('');
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
      setSupplierId(preselectedProduct.supplier_id || '');
    } else if (products.length > 0) {
      setProductId(products[0].id);
      setSupplierId(products[0].supplier_id || '');
    }
    setQuantity('10');
    setReferenceNumber(`PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setNotes('');
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setError(null);
  }, [preselectedProduct, products, isOpen]);

  const selectedProduct = products.find(p => p.id === productId);
  const numQty = parseInt(quantity, 10) || 0;
  const currentQty = selectedProduct?.current_quantity || 0;
  const projectedQty = currentQty + Math.max(0, numQty);

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

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit({
        productId,
        quantity: numQty,
        supplierId: supplierId || undefined,
        referenceNumber: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        transactionDate: new Date(transactionDate).toISOString(),
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Stock In transaction failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Stock In (Inbound Receipt)"
      subtitle="Increases on-hand warehouse inventory balance"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-mono-50 border border-mono-200 font-mono text-xs font-bold text-mono-950">
            [!] {error}
          </div>
        )}

        <Select
          label="Target Product / SKU"
          required
          value={productId}
          onChange={e => {
            const id = e.target.value;
            setProductId(id);
            const found = products.find(p => p.id === id);
            if (found?.supplier_id) setSupplierId(found.supplier_id);
          }}
        >
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {p.sku} — {p.name} (Current: {p.current_quantity})
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Inbound Quantity"
            required
            type="number"
            min="1"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
          />

          <Input
            label="Receipt Date"
            required
            type="date"
            value={transactionDate}
            onChange={e => setTransactionDate(e.target.value)}
          />
        </div>

        {/* Projected Inventory Calculation Preview */}
        {selectedProduct && (
          <div className="p-3 bg-mono-50 border border-mono-300 font-mono text-xs flex items-center justify-between">
            <span className="text-mono-600">Balance Preview:</span>
            <div className="flex items-center gap-2 font-bold text-mono-950">
              <span>{currentQty} units</span>
              <ArrowRight size={13} />
              <span className="underline decoration-mono-950">{projectedQty} units</span>
              <span className="text-mono-600 font-normal">(+{numQty})</span>
            </div>
          </div>
        )}

        <Select
          label="Delivering Supplier"
          value={supplierId}
          onChange={e => setSupplierId(e.target.value)}
        >
          <option value="">Vendor Unspecified</option>
          {suppliers.map(s => (
            <option key={s.id} value={s.id}>
              {s.company} ({s.name})
            </option>
          ))}
        </Select>

        <Input
          label="PO / Invoice Reference #"
          value={referenceNumber}
          onChange={e => setReferenceNumber(e.target.value)}
          placeholder="e.g. PO-2026-9041"
        />

        <Input
          label="Transaction Notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Bill of lading, inspection condition, bay location..."
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-mono-200">
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} icon={<TrendingUp size={14} />}>
            {submitting ? 'Recording...' : 'Commit Stock In'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
