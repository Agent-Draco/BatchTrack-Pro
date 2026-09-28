import React from 'react';
import { Card, CardContent, Skeleton, Pill } from '../../components/ui/index.js';

export default function PantryScanPage() {
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: '1.8rem' }}>Pantry Scan</h1>
        <p style={{ color: 'var(--muted)', marginTop: 4 }}>AI-powered pantry detection — Coming soon</p>
      </div>
      <Card>
        <CardContent style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Pill variant="blue">Step 1 of 4</Pill>
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>Intro & scan set-up</span>
          </div>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
