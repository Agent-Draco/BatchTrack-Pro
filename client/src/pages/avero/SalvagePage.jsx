import React, { useEffect, useState } from 'react';
import { getAveroSalvage } from '../../services/avero/averoApi.js';
import { DataTable, Button, useToast, Skeleton, EmptyState, Tag } from '../../components/ui/index.js';

export default function SalvagePage() {
  const [salvage, setSalvage] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    loadSalvage();
  }, []);

  const loadSalvage = async () => {
    try {
      const data = await getAveroSalvage();
      setSalvage(data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Ticket #', accessor: 'ticket_number' },
    { header: 'Date', accessor: 'created_at', render: (v) => new Date(v).toLocaleDateString() },
    { header: 'Items', accessor: 'item_count' },
    { header: 'Value', accessor: 'estimated_value', render: (v) => `$${Number(v||0).toFixed(2)}` },
    { header: 'Status', accessor: 'status', render: (v) => <Tag color="blue">{v}</Tag> }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#173d35', margin: 0 }}>Salvage Operations</h1>
        <Button>Create Ticket</Button>
      </div>
      
      <div style={{ backgroundColor: '#fffefb', padding: '24px', borderRadius: '16px', border: '1px solid #d8ded0' }}>
        {loading ? (
          <Skeleton height="300px" />
        ) : salvage.length > 0 ? (
          <DataTable columns={columns} data={salvage} />
        ) : (
          <EmptyState title="No Salvage Tickets" message="Create a salvage ticket to recover value from defective/expired items." />
        )}
      </div>
    </div>
  );
}
