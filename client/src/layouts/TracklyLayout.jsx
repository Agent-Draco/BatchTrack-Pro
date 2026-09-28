import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { BrandLogo, Button, useToast } from '../components/ui/index.js';
import { useAuth } from '../context/index.js';

export default function TracklyLayout() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, switchRole } = useAuth();

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
    { to: '/trackly/dashboard', icon: '📊', label: 'Dashboard', badge: 'Live' },
    { to: '/trackly/pantry', icon: '🧺', label: 'Smart Pantry', badge: '18 items' },
    { to: '/trackly/expiry', icon: '⏰', label: 'Expiry Watch', badge: '2 urgent', badgeColor: '#ef4444' },
    { to: '/trackly/recipes', icon: '🍳', label: 'Smart Recipes', badge: '3 ready' },
    { to: '/identity', icon: '🔏', label: 'WADN Passport' },
    { to: '/marketplace', icon: '🛒', label: 'Rescue Market' },
  ];

  return (
    <div
      className="trackly-theme-root"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#f8fafc',
        color: '#0f172a',
      }}
    >
      <style>{`
        .trackly-theme-root {
          --trackly-primary: #0284c7;
          --trackly-primary-hover: #0369a1;
          --trackly-accent: #38bdf8;
          --trackly-light: #f0f9ff;
          --trackly-card-border: rgba(2, 132, 199, 0.18);
        }
        .trackly-nav-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          border-radius: 999px;
          font-size: 13.5px;
          font-weight: 600;
          color: #475569;
          text-decoration: none;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          background: transparent;
          border: 1px solid transparent;
          white-space: nowrap;
        }
        .trackly-nav-pill:hover {
          background: #e0f2fe;
          color: #0369a1;
          transform: translateY(-1px);
        }
        .trackly-nav-pill.active {
          background: #0284c7;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.28);
        }
        .trackly-nav-pill.active .trackly-pill-badge {
          background: rgba(255, 255, 255, 0.25);
          color: #ffffff;
        }
        .trackly-micro-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 11.5px;
          font-weight: 700;
          background: #e0f2fe;
          color: #0369a1;
          border: 1px solid rgba(2, 132, 199, 0.2);
          letter-spacing: 0.02em;
        }
        .trackly-pill-badge {
          font-size: 10px;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 999px;
          background: #e2e8f0;
          color: #475569;
        }
      `}</style>

      {/* Main Trackly Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
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
          {/* Logo container on clean neutral card (NOT on blue background) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link
              to="/trackly/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#ffffff',
                padding: '6px 14px',
                borderRadius: 14,
                border: '1px solid #bae6fd',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.08)',
                textDecoration: 'none',
              }}
            >
              <BrandLogo product="trackly" theme="light" height={44} />
            </Link>

            {/* Playful Micro-Entities */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className="trackly-micro-chip" style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}>
                🔥 2 Expiring
              </span>
              <span className="trackly-micro-chip">
                🧺 18 Tracked
              </span>
              <span className="trackly-micro-chip" style={{ background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }}>
                💰 ₹1,240 Saved
              </span>
            </div>
          </div>

          {/* User profile & Action toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 12px',
                background: '#f1f5f9',
                borderRadius: 20,
                fontSize: 12.5,
                fontWeight: 600,
                color: '#334155',
              }}
            >
              <span>{user?.avatar || '👨🏽‍💼'}</span>
              <span>{user?.name || 'Rahul Sharma'}</span>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={toggleViewMode}
              style={{ fontSize: 11.5, padding: '6px 10px' }}
            >
              {viewMode === 'phone' ? '🖥️ Desktop' : '📱 Phone'}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/trackly/pantry')}
              style={{
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: 12.5,
                borderRadius: 999,
                padding: '7px 16px',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
              }}
            >
              ✨ + Scan Pantry
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
                background: '#173d35',
                color: '#ffffff',
                borderColor: '#173d35',
                borderRadius: 999,
                fontWeight: 700,
                padding: '7px 14px',
              }}
            >
              🏪 Switch to Avero
            </Button>

            <Link
              to="/"
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: '#64748b',
                padding: '6px 10px',
                textDecoration: 'none',
              }}
            >
              ⚡ BatchTrack Home
            </Link>
          </div>
        </div>

        {/* Sub-navigation bar with playful pills */}
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
              className={({ isActive }) => `trackly-nav-pill ${isActive ? 'active' : ''}`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
              {link.badge && (
                <span
                  className="trackly-pill-badge"
                  style={link.badgeColor ? { background: link.badgeColor, color: '#fff' } : {}}
                >
                  {link.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </header>

      {/* Main Trackly Content */}
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
