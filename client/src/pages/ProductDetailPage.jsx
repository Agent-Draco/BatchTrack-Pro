import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, Skeleton, WadnDisplay, Pill } from '../components/ui/index.js';

export default function ProductDetailPage() {
  const { wadn } = useParams();
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: '1.8rem' }}>Product Detail</h1>
        <p style={{ color: 'var(--muted)', marginTop: 4 }}>
          Digital product passport — Coming soon
        </p>
        <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <WadnDisplay wadn={wadn || 'WADN-IND-2026-XXXXXXXX'} />
          <Pill variant="blue">Trackly</Pill>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent style={{ display: 'grid', gap: 12 }}>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
