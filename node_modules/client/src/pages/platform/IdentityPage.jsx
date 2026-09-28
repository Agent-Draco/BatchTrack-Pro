import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, Skeleton, WadnDisplay, Pill } from '../../components/ui/index.js';

export default function IdentityPage() {
  const [params] = useSearchParams();
  const wadn = params.get('wadn');
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: '1.8rem' }}>WADN Product Identity</h1>
        <p style={{ color: 'var(--muted)', marginTop: 4 }}>
          Shared digital passport across Trackly & Avero — Coming soon
        </p>
        <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <WadnDisplay wadn={wadn || 'WADN-IND-2026-XXXXXXXX'} />
          <Pill variant="brand-accent">Identity Record</Pill>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 16 }}>
        <Card>
          <CardContent>
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent style={{ display: 'grid', gap: 14 }}>
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
