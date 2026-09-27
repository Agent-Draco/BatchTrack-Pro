import React from 'react';
import { Card, CardContent, Skeleton, Pill } from '../components/ui/index.js';

export default function InventoryPage() {
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: '1.8rem' }}>Inventory</h1>
        <p style={{ color: 'var(--muted)', marginTop: 4 }}>Avero stock & expiry overview — Coming soon</p>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['IN STOCK', 'LOW STOCK', 'EXPIRING', 'RETURNABLE', 'EXPIRED'].map((s) => (
          <Pill key={s} variant="gray">{s}</Pill>
        ))}
      </div>
      <Card>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
