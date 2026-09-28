import React from 'react';
import { Card, CardContent } from '../../components/ui/index.js';

export default function ShoppingListPage() {
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: '1.8rem' }}>Shopping List</h1>
        <p style={{ color: 'var(--muted)', marginTop: 4 }}>Auto-generated restock recommendations</p>
      </div>
      <Card>
        <CardContent>
          <p style={{ color: 'var(--muted)' }}>No items in shopping list currently.</p>
        </CardContent>
      </Card>
    </div>
  );
}
