import React, { useEffect, useState } from 'react';
import { getAveroChangeCredits } from '../../services/avero/averoApi.js';
import { DataTable, useToast, Skeleton, EmptyState, Tag } from '../../components/ui/index.js';

export default function ChangeCreditsPage() {
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    try {
      const data = await getAveroChangeCredits();
      setCredits(data);
    } catch (err) {
      toast.push(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Date', accessor: 'created_at', render: (v) => new Date(v).toLocaleString() },
    { header: 'Customer', accessor: 'customer_name' },
    { header: 'Amount', accessor: 'amount', render: (v) => `$${Number(v||0).toFixed(2)}` },
    { header: 'Type', accessor: 'type', render: (v) => <Tag color={v === 'ISSUED' ? 'green' : 'gray'}>{v}</Tag> },
    { header: 'Reference', accessor: 'reference_id' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h1 style={{ color: '#173d35', margin: 0 }}>Change Credits</h1>
      
      <div style={{ backgroundColor: '#fffefb', padding: '24px', borderRadius: '16px', border: '1px solid #d8ded0' }}>
        {loading ? (
          <Skeleton height="300px" />
        ) : credits.length > 0 ? (
          <DataTable columns={columns} data={credits} />
        ) : (
          <EmptyState title="No Credits" message="No store credit activity yet." />
        )}
      </div>
    </div>
  );
}
