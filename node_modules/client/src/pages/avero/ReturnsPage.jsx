import React, { useEffect, useState } from 'react';
import { getAveroReturns } from '../../services/avero/averoApi.js';
import { DataTable, Button, useToast, Skeleton, EmptyState, Tag } from '../../components/ui/index.js';

export default function ReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadReturns();
  }, []);

  const loadReturns = async () => {
    try {
      const data = await getAveroReturns();
      setReturns(data);
    } catch (err) {
      toast.push(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Return ID', accessor: 'id' },
    { header: 'Date', accessor: 'created_at', render: (v) => new Date(v).toLocaleString() },
    { header: 'Original Invoice', accessor: 'invoice_number' },
    { header: 'Refund', accessor: 'refund_amount', render: (v) => `$${Number(v||0).toFixed(2)}` },
    { header: 'Status', accessor: 'status', render: (v) => <Tag color="yellow">{v}</Tag> }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#173d35', margin: 0 }}>Returns & Triage</h1>
        <Button>Process Return</Button>
      </div>
      
      <div style={{ backgroundColor: '#fffefb', padding: '24px', borderRadius: '16px', border: '1px solid #d8ded0' }}>
        {loading ? (
          <Skeleton height="300px" />
        ) : returns.length > 0 ? (
          <DataTable columns={columns} data={returns} />
        ) : (
          <EmptyState title="No Returns" message="Processed returns will appear here." />
        )}
      </div>
    </div>
  );
}
