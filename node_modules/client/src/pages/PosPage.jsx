import React from 'react';
import { Card, CardContent, Skeleton, Pill } from '../components/ui/index.js';

export default function PosPage() {
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: '1.8rem' }}>Aztec POS</h1>
        <p style={{ color: 'var(--muted)', marginTop: 4 }}>
          Checkout, change credits & ownership transfer — Coming soon
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16 }}>
        <Card>
          <CardContent style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Pill variant="green">Scanning Area</Pill>
            </div>
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent style={{ display: 'grid', gap: 12 }}>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
