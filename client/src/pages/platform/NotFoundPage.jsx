import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/index.js';

export default function NotFoundPage() {
  return (
    <div
      style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 420 }}>
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(4rem, 14vw, 7rem)',
            fontWeight: 800,
            letterSpacing: '-0.06em',
            lineHeight: 1,
            color: 'var(--brand-2)',
            marginBottom: 12,
          }}
        >
          404
        </div>
        <h1 style={{ fontSize: '1.6rem', marginBottom: 10 }}>Not found</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 24, lineHeight: 1.6 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="md">
              Go home
            </Button>
          </Link>
          <Link to="/demo" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="md">
              Try Demo
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
