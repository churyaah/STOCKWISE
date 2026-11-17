/**
 * Clean CSV Exporter for Inventory Ledger, Valuation & Product Reports
 */

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns: { header: string; key: keyof T | ((row: T) => string | number) }[]
) {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }

  const csvRows: string[] = [];

  // 1. Header row
  const headers = columns.map(c => `"${c.header.replace(/"/g, '""')}"`);
  csvRows.push(headers.join(','));

  // 2. Data rows
  for (const row of data) {
    const values = columns.map(c => {
      let val: any;
      if (typeof c.key === 'function') {
        val = c.key(row);
      } else {
        val = row[c.key];
      }

      if (val === null || val === undefined) {
        return '""';
      }

      const stringVal = String(val).replace(/"/g, '""');
      return `"${stringVal}"`;
    });

    csvRows.push(values.join(','));
  }

  // 3. Blob and auto-download
  const csvString = csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
