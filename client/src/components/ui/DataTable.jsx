import React, { useState, useMemo } from 'react';

export default function DataTable({
  columns = [],
  rows = [],
  data = [],
  sortable = true,
  className = '',
  emptyTitle = 'No data yet',
  emptyDesc = 'There are no rows to display.',
  ...props
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const actualRows = useMemo(() => {
    return rows && rows.length > 0 ? rows : (data || []);
  }, [rows, data]);

  const normalizedColumns = useMemo(() => {
    return columns.map((col) => ({
      ...col,
      key: col.key || col.accessor,
      label: col.label || col.header || col.name || '',
    }));
  }, [columns]);

  const sortedRows = useMemo(() => {
    if (!sortKey || !sortable) return actualRows;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...actualRows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === bv) return 0;
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [actualRows, sortKey, sortDir, sortable]);

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
    const val = row[col.key];
    if (col.render) return col.render(val, row, rowIdx);
    if (val === null || val === undefined) return '';
    return String(val);
  };

  return (
    <div className={`ui-datatable-wrap ${className}`.trim()} {...props}>
      {actualRows.length === 0 ? (
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
              {normalizedColumns.map((col) => {
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
                {normalizedColumns.map((col) => (
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
