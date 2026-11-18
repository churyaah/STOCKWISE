import React, { useState, useMemo } from 'react';
import { Product, StockStatus } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { formatCurrency, getStockStatus } from '../../utils/formatters';
import {
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  Package,
} from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => Promise<void>;
  onStockIn: (product: Product) => void;
  onStockOut: (product: Product) => void;
  onAddNew: () => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEdit,
  onDelete,
  onStockIn,
  onStockOut,
  onAddNew,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | StockStatus>('ALL');
  const [sortField, setSortField] = useState<keyof Product>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Delete confirmation modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Distinct categories
  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category));
    return Array.from(set);
  }, [products]);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;

      const status = getStockStatus(p.current_quantity, p.reorder_level);
      const matchesStatus = statusFilter === 'ALL' || status === statusFilter;

      return matchesSearch && matchesCat && matchesStatus;
    }).sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [products, search, selectedCategory, statusFilter, sortField, sortAsc]);

  // Pagination slice
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage]);

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      setDeleting(true);
      await onDelete(productToDelete.id);
      setProductToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="bg-mono-0 border border-mono-200 p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mono-400" />
            <input
              type="text"
              placeholder="Filter by product name, SKU or keyword..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-mono-50 border border-mono-300 font-sans text-xs px-3.5 py-2 pl-9 focus:outline-none focus:border-mono-950"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-mono-500 hidden sm:block" />
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-mono-0 border border-mono-300 font-mono text-xs px-2.5 py-2 uppercase text-mono-800 focus:outline-none focus:border-mono-950"
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="bg-mono-0 border border-mono-300 font-mono text-xs px-2.5 py-2 uppercase text-mono-800 focus:outline-none focus:border-mono-950"
          >
            <option value="ALL">All Stock Statuses</option>
            <option value="IN_STOCK">In Stock (Optimal)</option>
            <option value="LOW_STOCK">Low Stock Alert</option>
            <option value="OUT_OF_STOCK">Out of Stock (Zero)</option>
          </select>
        </div>

        <Button onClick={onAddNew} icon={<Package size={14} />}>
          Register Product
        </Button>
      </div>

      {/* Product Table Container */}
      <div className="bg-mono-50 border border-mono-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-mono-200 bg-mono-50 font-mono text-[11px] text-mono-600 uppercase tracking-wider">
              <th
                className="py-3 px-4 cursor-pointer hover:text-mono-950 select-none"
                onClick={() => handleSort('sku')}
              >
                <div className="flex items-center gap-1.5">
                  <span>SKU</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-mono-950 select-none"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Product Name</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th className="py-3 px-4">Category</th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-mono-950 select-none text-right"
                onClick={() => handleSort('current_quantity')}
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Stock Units</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th className="py-3 px-4">Status</th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-mono-950 select-none text-right"
                onClick={() => handleSort('purchase_price')}
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Cost</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-mono-950 select-none text-right"
                onClick={() => handleSort('selling_price')}
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Price</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th className="py-3 px-4">Supplier</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-mono-200 text-xs">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-mono-400 font-mono">
                  No products found matching the specified search criteria.
                </td>
              </tr>
            ) : (
              paginated.map(product => {
                const status = getStockStatus(product.current_quantity, product.reorder_level);
                return (
                  <tr
                    key={product.id}
                    className="hover:bg-mono-50/70 transition-colors group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-mono-950">
                      {product.sku}
                    </td>

                    <td className="py-3 px-4 font-sans font-medium text-mono-900 max-w-xs">
                      <div className="truncate font-semibold">{product.name}</div>
                      {product.description && (
                        <div className="truncate text-[11px] text-mono-500 font-normal">
                          {product.description}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-mono-700">
                      {product.category}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-mono-950">
                      {product.current_quantity}
                      <span className="text-[10px] text-mono-400 font-normal ml-1">
                        / {product.reorder_level}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <Badge status={status} size="sm" />
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-mono-600">
                      {formatCurrency(product.purchase_price)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-semibold text-mono-950">
                      {formatCurrency(product.selling_price)}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-mono-600 truncate max-w-[140px]">
                      {product.supplier?.company || 'Unassigned'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100">
                        <button
                          onClick={() => onStockIn(product)}
                          title="Quick Stock In"
                          className="p-1.5 text-mono-700 hover:text-mono-950 hover:bg-mono-200 transition-colors"
                        >
                          <TrendingUp size={14} />
                        </button>
                        <button
                          onClick={() => onStockOut(product)}
                          title="Quick Stock Out"
                          className="p-1.5 text-mono-700 hover:text-mono-950 hover:bg-mono-200 transition-colors"
                        >
                          <TrendingDown size={14} />
                        </button>
                        <button
                          onClick={() => onEdit(product)}
                          title="Edit Product"
                          className="p-1.5 text-mono-700 hover:text-mono-950 hover:bg-mono-200 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setProductToDelete(product)}
                          title="Delete Product"
                          className="p-1.5 text-mono-700 hover:text-mono-950 hover:bg-mono-200 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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
              {filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-bold text-mono-950">
              {Math.min(currentPage * pageSize, filteredProducts.length)}
            </span>{' '}
            of <span className="font-bold text-mono-950">{filteredProducts.length}</span> entries
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

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setProductToDelete(null)}
          title="Confirm Product Deletion"
          subtitle={`SKU: ${productToDelete.sku}`}
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-sm font-sans text-mono-800 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-mono-950">{productToDelete.name}</strong> from the catalog?
              This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-mono-200">
              <Button
                variant="ghost"
                onClick={() => setProductToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Product'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
