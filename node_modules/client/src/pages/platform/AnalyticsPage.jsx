import React from 'react';
import { Card, CardContent, Skeleton, StatCard } from '../../components/ui/index.js';

export default function AnalyticsPage() {
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: '1.8rem' }}>Ecosystem Analytics</h1>
        <p style={{ color: 'var(--muted)', marginTop: 4 }}>Impact, recovery & interventions — Coming soon</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <StatCard label="Waste Prevented" value="—" accent="green" />
        <StatCard label="Value Recovered" value="—" accent="brand" />
        <StatCard label="Products Tracked" value="—" accent="blue" />
        <StatCard label="Expiry Interventions" value="—" accent="warning" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
