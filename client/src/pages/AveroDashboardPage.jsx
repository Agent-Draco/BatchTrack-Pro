import React from 'react';
import { Card, CardContent, Skeleton, StatCard } from '../components/ui/index.js';

export default function AveroDashboardPage() {
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: '1.8rem' }}>Avero Dashboard</h1>
        <p style={{ color: 'var(--muted)', marginTop: 4 }}>Retailer operations & POS — Coming soon</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <StatCard label="Today's Sales" value="—" accent="brand" />
        <StatCard label="Inventory Value" value="—" accent="blue" />
        <StatCard label="Expiring Soon" value="—" accent="warning" />
        <StatCard label="Recoverable Value" value="—" accent="green" />
      </div>
      <Card>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
