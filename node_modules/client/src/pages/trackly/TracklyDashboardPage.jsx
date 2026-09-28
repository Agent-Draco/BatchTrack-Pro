import React from 'react';
import { Card, CardContent, Skeleton, StatCard } from '../../components/ui/index.js';

export default function TracklyDashboardPage() {
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: '1.8rem' }}>Trackly Dashboard</h1>
        <p style={{ color: 'var(--muted)', marginTop: 4 }}>Consumer product tracking — Coming soon</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <StatCard label="Total Products" value="—" accent="brand" />
        <StatCard label="Expiring Soon" value="—" accent="warning" />
        <StatCard label="Fresh Products" value="—" accent="green" />
        <StatCard label="Warranty Items" value="—" accent="blue" />
      </div>
      <Card>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
