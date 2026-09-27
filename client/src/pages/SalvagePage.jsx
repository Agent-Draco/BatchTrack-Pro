import React from 'react';
import { Card, CardContent, Skeleton } from '../components/ui/index.js';

export default function SalvagePage() {
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: '1.8rem' }}>Salvage Intelligence</h1>
        <p style={{ color: 'var(--muted)', marginTop: 4 }}>Returns, mark-downs & rescue — Coming soon</p>
      </div>
      <Card>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
