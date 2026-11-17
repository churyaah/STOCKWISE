/**
 * Monochromatic Design System Formatters
 */

export function formatCurrency(amount: number, symbol: string = '$'): string {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);

  return `${symbol}${formatted}`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num || 0);
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | undefined): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    return dateString;
  }
}

export function getStockStatus(currentQuantity: number, reorderLevel: number): 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' {
  if (currentQuantity <= 0) return 'OUT_OF_STOCK';
  if (currentQuantity <= reorderLevel) return 'LOW_STOCK';
  return 'IN_STOCK';
}

export function getStockStatusLabel(status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'): string {
  switch (status) {
    case 'OUT_OF_STOCK':
      return 'Out of Stock';
    case 'LOW_STOCK':
      return 'Low Stock Alert';
    case 'IN_STOCK':
      return 'Optimal Level';
  }
}
