import React from 'react';
import { Card, CardContent, Skeleton } from '../components/ui/index.js';

export default function RecipesPage() {
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: '1.8rem' }}>Recipe Engine</h1>
        <p style={{ color: 'var(--muted)', marginTop: 4 }}>Rank recipes by most-at-risk ingredients — Coming soon</p>
      </div>
      <Skeleton className="h-24 w-full" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent style={{ display: 'grid', gap: 12 }}>
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
