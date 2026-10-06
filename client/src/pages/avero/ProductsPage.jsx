import React, { useEffect, useState } from 'react';
import { getAveroProducts } from '../../services/avero/averoApi.js';
import { DataTable, Button, useToast, Skeleton, EmptyState } from '../../components/ui/index.js';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getAveroProducts();
      setProducts(data);
    } catch (err) {
      toast.push(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'SKU', accessor: 'sku' },
    { header: 'Name', accessor: 'name' },
    { header: 'Brand', accessor: 'brand' },
    { header: 'Category', accessor: 'category' },
    { header: 'Price', accessor: 'price', render: (val) => `$${Number(val || 0).toFixed(2)}` },
    { header: 'Stock', accessor: 'stock' },
    { header: 'Active?', accessor: 'is_active', render: (val) => val ? 'Yes' : 'No' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#173d35', margin: 0 }}>Products</h1>
        <Button>Add Product</Button>
      </div>
      
      <div style={{ backgroundColor: '#fffefb', padding: '24px', borderRadius: '16px', border: '1px solid #d8ded0' }}>
        {loading ? (
          <Skeleton height="300px" />
        ) : products.length > 0 ? (
          <DataTable columns={columns} data={products} />
        ) : (
          <EmptyState title="No Products" message="Get started by adding your first product." />
        )}
      </div>
    </div>
  );
}
