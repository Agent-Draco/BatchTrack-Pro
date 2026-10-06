import React, { useEffect, useState } from 'react';
import { getAveroInventory } from '../../services/avero/averoApi.js';
import { DataTable, useToast, Skeleton, EmptyState } from '../../components/ui/index.js';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const data = await getAveroInventory();
      setInventory(data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Product', accessor: 'product_name' },
    { header: 'Batch #', accessor: 'batch_number' },
    { header: 'Qty', accessor: 'qty' },
    { header: 'Cost', accessor: 'cost', render: (v) => `$${v}` },
    { header: 'Expiry', accessor: 'expiry_date' },
    { header: 'Status', accessor: 'status' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h1 style={{ color: '#173d35', margin: 0 }}>Inventory Management</h1>
      
      <div style={{ backgroundColor: '#fffefb', padding: '24px', borderRadius: '16px', border: '1px solid #d8ded0' }}>
        {loading ? (
          <Skeleton height="300px" />
        ) : inventory.length > 0 ? (
          <DataTable columns={columns} data={inventory} />
        ) : (
          <EmptyState title="No Inventory" message="Inventory data will appear here." />
        )}
      </div>
    </div>
  );
}
