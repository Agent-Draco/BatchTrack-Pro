import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { BrandLogo, Button, useToast } from '../components/ui/index.js';
import { useAuth } from '../context/index.js';

export default function PlatformLayout() {
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

  const navLinks = [
    { to: '/identity', icon: '🔏', label: 'WADN Digital Passport' },
    { to: '/marketplace', icon: '🛒', label: 'Community Rescue' },
    { to: '/analytics', icon: '📉', label: 'Ecosystem Analytics' },
    { to: '/demo', icon: '🎬', label: 'Guided Tour' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#f6f3eb',
        color: '#16241e',
      }}
    >
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(255, 254, 251, 0.96)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <div
          style={{
            maxWidth: 1360,
            margin: '0 auto',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          {/* Logo container */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#ffffff',
                padding: '6px 14px',
                borderRadius: 14,
                border: '1px solid var(--line)',
                boxShadow: 'var(--shadow-sm)',
                textDecoration: 'none',
              }}
            >
              <BrandLogo product="batchtrack" theme="light" height={44} />
            </Link>

            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--muted)',
                paddingLeft: 10,
                borderLeft: '1px solid var(--line)',
              }}
            >
              Shared Platform Infrastructure
            </span>
          </div>

          {/* Quick launch to apps & view controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleViewMode}
              style={{ fontSize: 11.5, padding: '6px 10px' }}
            >
              {viewMode === 'phone' ? '🖥️ Desktop' : '📱 Phone'}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                switchRole('consumer');
                navigate('/trackly/dashboard');
              }}
              style={{
                fontSize: 12.5,
                background: 'rgba(2, 132, 199, 0.10)',
                color: '#0284c7',
                borderColor: 'rgba(2, 132, 199, 0.3)',
                fontWeight: 700,
                borderRadius: 999,
                padding: '7px 14px',
              }}
            >
              🧺 Open Trackly
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                switchRole('retailer');
                navigate('/avero/dashboard');
              }}
              style={{
                fontSize: 12.5,
                background: 'rgba(23, 61, 53, 0.10)',
                color: '#173d35',
                borderColor: 'rgba(23, 61, 53, 0.3)',
                fontWeight: 700,
                borderRadius: 10,
                padding: '7px 14px',
              }}
            >
              🏪 Open Avero
            </Button>
          </div>
        </div>

        {/* Navigation tabs */}
        <div
          style={{
            maxWidth: 1360,
            margin: '0 auto',
            padding: '0 24px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            overflowX: 'auto',
          }}
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: 600,
                color: isActive ? '#fffefb' : 'var(--muted)',
                background: isActive ? 'var(--brand-2)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.16s ease',
              })}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>
      </header>

      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 1360,
          margin: '0 auto',
          padding: '28px 24px 60px',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
