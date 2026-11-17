import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Supplier } from '../../types';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  initialData?: Supplier | null;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        company: initialData.company,
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Contact person name is required';
    if (!formData.company.trim()) errs.company = 'Company name is required';
    if (formData.email && !formData.email.includes('@')) errs.email = 'Valid email required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await onSubmit({
        name: formData.name.trim(),
        company: formData.company.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        notes: formData.notes.trim() || undefined,
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
      title={isEditing ? 'Modify Supplier Record' : 'Register New Vendor / Supplier'}
      subtitle={isEditing ? formData.company : 'Maintain verified supply chain entities'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 bg-mono-100 border border-mono-950 font-mono text-xs font-bold text-mono-950">
            [!] {errors.form}
          </div>
        )}

        <Input
          label="Company / Vendor Organization"
          required
          value={formData.company}
          onChange={e => setFormData({ ...formData, company: e.target.value })}
          placeholder="e.g. Apex Micro Precision Ltd"
          error={errors.company}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Key Account Contact"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Marcus Vance"
            error={errors.name}
          />

          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            placeholder="orders@apexmicro.com"
            error={errors.email}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Phone Number"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 (555) 019-2834"
          />

          <Input
            label="Warehouse / HQ Address"
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
            placeholder="City, State, Country"
          />
        </div>

        <Input
          label="Vendor Terms & SLA Notes"
          value={formData.notes}
          onChange={e => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Lead times, payment terms, minimum order quantities..."
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-mono-200">
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Register Supplier'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
