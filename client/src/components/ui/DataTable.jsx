import React, { useState, useMemo } from 'react';

export default function DataTable({
  columns = [],
  rows = [],
  sortable = true,
  className = '',
  emptyTitle = 'No data yet',
  emptyDesc = 'There are no rows to display.',
  ...props
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const sortedRows = useMemo(() => {
    if (!sortKey || !sortable) return rows;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === bv) return 0;
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [rows, sortKey, sortDir, sortable]);

  const handleSort = (key) => {
    if (!sortable) return;
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const renderCell = (col, row, rowIdx) => {
    if (col.render) return col.render(row[col.key], row, rowIdx);
    const val = row[col.key];
    if (val === null || val === undefined) return '';
    return String(val);
  };

  return (
    <div className={`ui-datatable-wrap ${className}`.trim()} {...props}>
      {rows.length === 0 ? (
        <div className="ui-datatable-empty">
          <div className="ui-emptystate">
            <div className="ui-emptystate-icon">📋</div>
            <div className="ui-emptystate-title">{emptyTitle}</div>
            <div className="ui-emptystate-desc">{emptyDesc}</div>
          </div>
        </div>
      ) : (
        <table className="ui-datatable">
          <thead>
            <tr>
              {columns.map((col) => {
                const canSort = sortable && col.sortable !== false;
                const isSorted = sortKey === col.key;
                const thClass = [
                  canSort ? 'sortable' : '',
                  isSorted ? (sortDir === 'asc' ? 'sorted-asc' : 'sorted-desc') : '',
                ]
                  .filter(Boolean)
                  .join(' ');
                return (
                  <th
                    key={col.key}
                    className={thClass || undefined}
                    onClick={canSort ? () => handleSort(col.key) : undefined}
                    style={{ width: col.width }}
                  >
                    {col.label}
                    {canSort && <span className="sort-arrow" />}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, ri) => (
              <tr key={row.id ?? ri}>
                {columns.map((col) => (
                  <td key={col.key}>{renderCell(col, row, ri)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/*
Example usage:
  <DataTable
    columns={[
      { key: 'name', label: 'Product' },
      { key: 'price', label: 'Price (₹)', sortable: true },
      { key: 'expiry', label: 'Expiry', sortable: true },
      {
        key: 'status',
        label: 'Status',
        render: (v) => <Pill variant={v === 'ok' ? 'green' : 'red'}>{v}</Pill>,
      },
    ]}
    rows={[
      { id: 1, name: 'Amul Milk', price: 42, expiry: '2026-09-30', status: 'ok' },
      { id: 2, name: 'Britannia Bread', price: 45, expiry: '2026-09-28', status: 'warn' },
    ]}
  />
*/
