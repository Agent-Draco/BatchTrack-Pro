import React, { useEffect, useState } from 'react';
import { getAveroSales } from '../../services/avero/averoApi.js';
import { DataTable, useToast, Skeleton, EmptyState, Tag } from '../../components/ui/index.js';

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const data = await getAveroSales();
      setSales(data);
    } catch (err) {
      toast.push(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Invoice #', accessor: 'invoice_number' },
    { header: 'Date', accessor: 'created_at', render: (v) => new Date(v).toLocaleString() },
    { header: 'Customer', accessor: 'customer_name' },
    { header: 'Total', accessor: 'total_amount', render: (v) => `$${Number(v||0).toFixed(2)}` },
    { header: 'Status', accessor: 'status', render: (v) => <Tag>{v}</Tag> }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h1 style={{ color: '#173d35', margin: 0 }}>Sales History</h1>
      
      <div style={{ backgroundColor: '#fffefb', padding: '24px', borderRadius: '16px', border: '1px solid #d8ded0' }}>
        {loading ? (
          <Skeleton height="300px" />
        ) : sales.length > 0 ? (
          <DataTable columns={columns} data={sales} />
        ) : (
          <EmptyState title="No Sales" message="Sales will appear here once processed through POS." />
        )}
      </div>
    </div>
  );
}
