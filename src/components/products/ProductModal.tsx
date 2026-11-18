import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Category, Product, Supplier } from '../../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  initialData?: Product | null;
  categories: Category[];
  suppliers: Supplier[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categories,
  suppliers,
}) => {
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    category_id: '',
    purchase_price: '',
    selling_price: '',
    current_quantity: '',
    reorder_level: '10',
    target_stock_level: '50',
    supplier_id: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        sku: initialData.sku,
        description: initialData.description || '',
        category: initialData.category,
        category_id: initialData.category_id || '',
        purchase_price: String(initialData.purchase_price),
        selling_price: String(initialData.selling_price),
        current_quantity: String(initialData.current_quantity),
        reorder_level: String(initialData.reorder_level),
        target_stock_level: String(initialData.target_stock_level || 50),
        supplier_id: initialData.supplier_id || '',
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        description: '',
        category: categories[0]?.name || 'General',
        category_id: categories[0]?.id || '',
        purchase_price: '0.00',
        selling_price: '0.00',
        current_quantity: '0',
        reorder_level: '10',
        target_stock_level: '50',
        supplier_id: suppliers[0]?.id || '',
      });
    }
    setErrors({});
  }, [initialData, categories, suppliers, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';

    const pPrice = parseFloat(formData.purchase_price);
    if (isNaN(pPrice) || pPrice < 0) newErrors.purchase_price = 'Must be >= 0';

    const sPrice = parseFloat(formData.selling_price);
    if (isNaN(sPrice) || sPrice < 0) newErrors.selling_price = 'Must be >= 0';

    const qty = parseInt(formData.current_quantity, 10);
    if (isNaN(qty) || qty < 0) newErrors.current_quantity = 'Must be a non-negative integer';

    const reorder = parseInt(formData.reorder_level, 10);
    if (isNaN(reorder) || reorder < 0) newErrors.reorder_level = 'Must be >= 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await onSubmit({
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        description: formData.description.trim(),
        category: formData.category,
        category_id: formData.category_id || undefined,
        purchase_price: parseFloat(formData.purchase_price),
        selling_price: parseFloat(formData.selling_price),
        current_quantity: parseInt(formData.current_quantity, 10),
        reorder_level: parseInt(formData.reorder_level, 10),
        target_stock_level: parseInt(formData.target_stock_level, 10) || 50,
        supplier_id: formData.supplier_id || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Operation failed' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Product Record' : 'Register New Product'}
      subtitle={isEditing ? `Modifying SKU: ${initialData?.sku}` : 'Enter catalog specifications & stock rules'}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 bg-mono-50 border border-mono-200 font-mono text-xs font-bold text-mono-950">
            [!] {errors.form}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Product Name"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Precision Sensor Module"
            error={errors.name}
          />

          <Input
            label="SKU (Stock Keeping Unit)"
            required
            value={formData.sku}
            onChange={e => setFormData({ ...formData, sku: e.target.value })}
            placeholder="e.g. SEN-LIDAR-003"
            error={errors.sku}
          />
        </div>

        <div>
          <Input
            label="Description"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Technical specs, tolerances, application scope..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            value={formData.category}
            onChange={e => {
              const selectedCat = categories.find(c => c.name === e.target.value);
              setFormData({
                ...formData,
                category: e.target.value,
                category_id: selectedCat?.id || '',
              });
            }}
          >
            {categories.map(c => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
            {categories.length === 0 && <option value="General">General</option>}
          </Select>

          <Select
            label="Primary Supplier"
            value={formData.supplier_id}
            onChange={e => setFormData({ ...formData, supplier_id: e.target.value })}
          >
            <option value="">Unassigned</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>
                {s.company} ({s.name})
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-mono-200">
          <Input
            label="Purchase Cost ($)"
            required
            type="number"
            step="0.01"
            value={formData.purchase_price}
            onChange={e => setFormData({ ...formData, purchase_price: e.target.value })}
            error={errors.purchase_price}
          />

          <Input
            label="Selling Price ($)"
            required
            type="number"
            step="0.01"
            value={formData.selling_price}
            onChange={e => setFormData({ ...formData, selling_price: e.target.value })}
            error={errors.selling_price}
          />

          <Input
            label="Current Stock"
            required
            type="number"
            value={formData.current_quantity}
            onChange={e => setFormData({ ...formData, current_quantity: e.target.value })}
            disabled={isEditing}
            helperText={isEditing ? 'Adjust via Stock In/Out' : undefined}
            error={errors.current_quantity}
          />

          <Input
            label="Reorder Threshold"
            required
            type="number"
            value={formData.reorder_level}
            onChange={e => setFormData({ ...formData, reorder_level: e.target.value })}
            error={errors.reorder_level}
          />
        </div>

        <div className="pt-2">
          <Input
            label="Target Optimal Stock Level"
            type="number"
            value={formData.target_stock_level}
            onChange={e => setFormData({ ...formData, target_stock_level: e.target.value })}
            helperText="Used by AI restock algorithms to calculate purchase deficit"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-mono-200">
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Processing...' : isEditing ? 'Save Product Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
