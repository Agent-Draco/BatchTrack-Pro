import React, { useEffect, useState } from 'react';
import { getAveroCustomers } from '../../services/avero/averoApi.js';
import { DataTable, Button, useToast, Skeleton, EmptyState } from '../../components/ui/index.js';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await getAveroCustomers();
      setCustomers(data);
    } catch (err) {
      toast.push(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Email', accessor: 'email' },
    { header: 'Credit Balance', accessor: 'credit_balance', render: (v) => `$${Number(v||0).toFixed(2)}` }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#173d35', margin: 0 }}>Customers</h1>
        <Button>Add Customer</Button>
      </div>
      
      <div style={{ backgroundColor: '#fffefb', padding: '24px', borderRadius: '16px', border: '1px solid #d8ded0' }}>
        {loading ? (
          <Skeleton height="300px" />
        ) : customers.length > 0 ? (
          <DataTable columns={columns} data={customers} />
        ) : (
          <EmptyState title="No Customers" message="Customer database is empty." />
        )}
      </div>
    </div>
  );
}
