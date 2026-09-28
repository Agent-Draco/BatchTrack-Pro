import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Button, Nav, useToast, BrandLogo } from '../components/ui/index.js';

export default function AppShell() {
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem('batchtrack_view_mode') || 'desktop';
    } catch {
      return 'desktop';
    }
  });

  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.classList.toggle('phone-mode', viewMode === 'phone');
    body.classList.toggle('phone-mode', viewMode === 'phone');
  }, [viewMode]);

  const toggleViewMode = () => {
    const next = viewMode === 'phone' ? 'desktop' : 'phone';
    setViewMode(next);
    try {
      localStorage.setItem('batchtrack_view_mode', next);
    } catch {
      /* noop */
    }
    toast.info(next === 'phone' ? 'Phone view enabled' : 'Desktop view enabled');
  };

  return (
    <div className="app-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="topbar" style={{ padding: '12px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex' }}>
            <div
              style={{
                background: '#ffffff',
                padding: '6px 14px',
                borderRadius: 12,
                border: '1px solid var(--line)',
                display: 'inline-flex',
              }}
            >
              <BrandLogo product="batchtrack" theme="light" height={42} />
            </div>
          </Link>
        </div>

        <div className="topbar-actions">
          <Button variant="secondary" size="sm" onClick={toggleViewMode}>
            {viewMode === 'phone' ? '🖥️ Desktop view' : '📱 Phone view'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/trackly/dashboard')}
            style={{
              background: '#0284c7',
              color: '#ffffff',
              borderRadius: 999,
              fontWeight: 700,
            }}
          >
            Open Trackly
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/avero/dashboard')}
            style={{
              background: '#173d35',
              color: '#fffefb',
              borderRadius: 12,
              fontWeight: 700,
            }}
          >
            Open Avero
          </Button>
        </div>
      </header>

      <main className="app-content" style={{ flex: 1, padding: '24px' }}>
        <Outlet />
      </main>
    </div>
  );
}
