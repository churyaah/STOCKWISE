import React, { useState, useMemo } from 'react';
import { Supplier, Product } from '../../types';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import {
  Search,
  Truck,
  Edit2,
  Trash2,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

interface SupplierTableProps {
  suppliers: Supplier[];
  products: Product[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => Promise<void>;
  onAddNew: () => void;
}

export const SupplierTable: React.FC<SupplierTableProps> = ({
  suppliers,
  products,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  const [search, setSearch] = useState('');
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Map product counts to suppliers
  const supplierProductCount = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of products) {
      if (p.supplier_id) {
        map[p.supplier_id] = (map[p.supplier_id] || 0) + 1;
      }
    }
    return map;
  }, [products]);

  const filtered = useMemo(() => {
    return suppliers.filter(s => {
      const term = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(term) ||
        s.company.toLowerCase().includes(term) ||
        (s.email && s.email.toLowerCase().includes(term)) ||
        (s.address && s.address.toLowerCase().includes(term))
      );
    });
  }, [suppliers, search]);

  const confirmDelete = async () => {
    if (!supplierToDelete) return;
    try {
      setDeleting(true);
      await onDelete(supplierToDelete.id);
      setSupplierToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Search */}
      <div className="bg-mono-0 border border-mono-200 p-4 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mono-400" />
          <input
            type="text"
            placeholder="Search suppliers by company, name, email or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-mono-50 border border-mono-300 font-sans text-xs px-3.5 py-2 pl-9 focus:outline-none focus:border-mono-950"
          />
        </div>

        <Button onClick={onAddNew} icon={<Truck size={14} />}>
          Register Supplier
        </Button>
      </div>

      {/* Grid of Supplier Cards & Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-mono-400 font-mono text-xs bg-mono-0 border border-mono-200">
            No suppliers found matching your query.
          </div>
        ) : (
          filtered.map(supplier => {
            const productCount = supplierProductCount[supplier.id] || 0;

            return (
              <div
                key={supplier.id}
                className="bg-mono-0 border border-mono-200 p-5 flex flex-col justify-between hover:border-mono-800 transition-colors group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display font-bold text-base text-mono-950 tracking-tight leading-snug">
                        {supplier.company}
                      </h3>
                      <p className="font-sans text-xs text-mono-600 mt-0.5">
                        Attn: {supplier.name}
                      </p>
                    </div>

                    <span className="font-mono text-[10px] uppercase px-2 py-0.5 bg-mono-100 border border-mono-300 font-semibold whitespace-nowrap">
                      {productCount} SKUs
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5 font-mono text-xs text-mono-700">
                    {supplier.email && (
                      <div className="flex items-center gap-2 truncate">
                        <Mail size={13} className="text-mono-400 flex-shrink-0" />
                        <span className="truncate">{supplier.email}</span>
                      </div>
                    )}
                    {supplier.phone && (
                      <div className="flex items-center gap-2 truncate">
                        <Phone size={13} className="text-mono-400 flex-shrink-0" />
                        <span>{supplier.phone}</span>
                      </div>
                    )}
                    {supplier.address && (
                      <div className="flex items-center gap-2 truncate text-[11px] text-mono-500">
                        <MapPin size={13} className="text-mono-400 flex-shrink-0" />
                        <span className="truncate">{supplier.address}</span>
                      </div>
                    )}
                  </div>

                  {supplier.notes && (
                    <div className="mt-3 pt-3 border-t border-mono-150 font-sans text-xs text-mono-600 line-clamp-2">
                      {supplier.notes}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-mono-200 flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<Edit2 size={12} />}
                    onClick={() => onEdit(supplier)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Trash2 size={12} />}
                    onClick={() => setSupplierToDelete(supplier)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {supplierToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setSupplierToDelete(null)}
          title="Confirm Supplier Deletion"
          subtitle={supplierToDelete.company}
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-sm font-sans text-mono-800 leading-relaxed">
              Are you sure you want to remove{' '}
              <strong className="text-mono-950">{supplierToDelete.company}</strong>?
              Associated products will have their supplier designation cleared.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-mono-200">
              <Button
                variant="ghost"
                onClick={() => setSupplierToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Removing...' : 'Delete Supplier'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
