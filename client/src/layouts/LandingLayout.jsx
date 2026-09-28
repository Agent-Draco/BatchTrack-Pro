import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { BrandLogo, Button, useToast } from '../components/ui/index.js';
import { useAuth } from '../context/index.js';

export default function LandingLayout() {
  const navigate = useNavigate();
  const toast = useToast();
  const { switchRole } = useAuth();

  const [viewMode, setViewMode] = useState(() => {
    try { return localStorage.getItem('batchtrack_view_mode') || 'desktop'; } catch { return 'desktop'; }
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.classList.toggle('phone-mode', viewMode === 'phone');
    body.classList.toggle('phone-mode', viewMode === 'phone');
  }, [viewMode]);

  const toggleViewMode = () => {
    const next = viewMode === 'phone' ? 'desktop' : 'phone';
    setViewMode(next);
    try { localStorage.setItem('batchtrack_view_mode', next); } catch { /* noop */ }
    toast.info(next === 'phone' ? 'Phone view enabled' : 'Desktop view enabled');
  };

  return (
    <div className="landing-layout-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(255, 254, 251, 0.96)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--line)',
          padding: '14px 28px',
        }}
      >
        <div
          style={{
            maxWidth: 1360,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            flexWrap: 'wrap',
          }}
        >
          {/* Official BatchTrack Logo (Prominently Sized in Clean Neutral Container) */}
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
            <div
              style={{
                background: '#ffffff',
                padding: '6px 16px',
                borderRadius: 14,
                border: '1px solid var(--line)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <BrandLogo product="batchtrack" theme="light" height={44} />
            </div>
          </Link>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }} aria-label="Ecosystem Navigation">
            <Link
              to="/trackly/dashboard"
              onClick={() => switchRole('consumer')}
              style={{
                padding: '8px 16px',
                borderRadius: 999,
                fontSize: 13.5,
                fontWeight: 700,
                color: '#0369a1',
                background: 'rgba(2, 132, 199, 0.10)',
                border: '1px solid rgba(2, 132, 199, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <span>🧺</span> Trackly App
            </Link>

            <Link
              to="/avero/dashboard"
              onClick={() => switchRole('retailer')}
              style={{
                padding: '8px 16px',
                borderRadius: 12,
                fontSize: 13.5,
                fontWeight: 700,
                color: '#173d35',
                background: 'rgba(23, 61, 53, 0.10)',
                border: '1px solid rgba(23, 61, 53, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <span>🏪</span> Avero OS
            </Link>

            <Link
              to="/identity"
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: 600,
                color: 'var(--muted)',
                textDecoration: 'none',
                transition: 'color 0.15s ease',
              }}
            >
              WADN Identity
            </Link>

            <Link
              to="/marketplace"
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: 600,
                color: 'var(--muted)',
                textDecoration: 'none',
                transition: 'color 0.15s ease',
              }}
            >
              Marketplace
            </Link>

            <Link
              to="/analytics"
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: 600,
                color: 'var(--muted)',
                textDecoration: 'none',
                transition: 'color 0.15s ease',
              }}
            >
              Analytics
            </Link>
          </nav>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleViewMode}
              style={{ fontSize: 12, padding: '7px 12px' }}
            >
              {viewMode === 'phone' ? '🖥️ Desktop' : '📱 Phone'}
            </Button>

            <Button
              variant="accent"
              size="sm"
              onClick={() => navigate('/demo')}
              style={{ fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 10 }}
            >
              🎬 Guided Tour
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                switchRole('consumer');
                navigate('/trackly/dashboard');
              }}
              style={{
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                borderRadius: 999,
                padding: '8px 16px',
                fontSize: 13,
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
              }}
            >
              Open Trackly
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                switchRole('retailer');
                navigate('/avero/dashboard');
              }}
              style={{
                background: '#173d35',
                color: '#fffefb',
                border: 'none',
                fontWeight: 700,
                borderRadius: 12,
                padding: '8px 16px',
                fontSize: 13,
                boxShadow: '0 2px 8px rgba(23, 61, 53, 0.22)',
              }}
            >
              Open Avero
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, width: '100%', maxWidth: 1360, margin: '0 auto', padding: '32px 24px 64px' }}>
        <Outlet />
      </main>
    </div>
  );
}
