import React from 'react';
import { Card, CardContent, Skeleton, Pill } from '../components/ui/index.js';

export default function ExpiryIntelligencePage() {
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: '1.8rem' }}>Smart Expiry Intelligence</h1>
        <p style={{ color: 'var(--muted)', marginTop: 4 }}>Buckets & action hints — Coming soon</p>
      </div>
      <div style={{ display: 'grid', gap: 16 }}>
        {[
          { label: 'URGENT (≤ 3d)', pill: 'red' },
          { label: 'USE SOON (≤ 14d)', pill: 'brand-accent' },
          { label: 'SAFE', pill: 'green' },
          { label: 'EXPIRED', pill: 'gray' },
        ].map((b) => (
          <Card key={b.label}>
            <CardContent style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Pill variant={b.pill}>{b.label}</Pill>
              </div>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
