import React, { useEffect, useState } from 'react';
import { getAveroTerminals } from '../../services/avero/averoApi.js';
import { DataTable, Button, useToast, Skeleton, EmptyState, Tag } from '../../components/ui/index.js';

export default function TerminalsPage() {
  const [terminals, setTerminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    loadTerminals();
  }, []);

  const loadTerminals = async () => {
    try {
      const data = await getAveroTerminals();
      setTerminals(data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Location', accessor: 'location' },
    { header: 'Code', accessor: 'terminal_code' },
    { header: 'Status', accessor: 'status', render: (v) => <Tag color={v === 'ONLINE' ? 'green' : 'gray'}>{v}</Tag> },
    { header: 'Active Cashier', accessor: 'active_cashier' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#173d35', margin: 0 }}>POS Terminals</h1>
        <Button>Register Terminal</Button>
      </div>
      
      <div style={{ backgroundColor: '#fffefb', padding: '24px', borderRadius: '16px', border: '1px solid #d8ded0' }}>
        {loading ? (
          <Skeleton height="300px" />
        ) : terminals.length > 0 ? (
          <DataTable columns={columns} data={terminals} />
        ) : (
          <EmptyState title="No Terminals" message="Register your first POS terminal." />
        )}
      </div>
    </div>
  );
}
