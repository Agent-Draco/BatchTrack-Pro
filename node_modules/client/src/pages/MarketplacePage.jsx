import React from 'react';
import { Card, CardContent, Skeleton } from '../components/ui/index.js';

export default function MarketplacePage() {
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: '1.8rem' }}>Community Rescue Marketplace</h1>
        <p style={{ color: 'var(--muted)', marginTop: 4 }}>Offer & claim surplus near you — Coming soon</p>
      </div>
      <Skeleton className="h-16 w-full" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent style={{ display: 'grid', gap: 12 }}>
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
