import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { BrandLogo, Button, useToast } from '../components/ui/index.js';
import { useAuth } from '../context/index.js';

export default function AveroLayout() {
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
    { to: '/avero/dashboard', icon: '📈', label: 'Executive Dashboard' },
    { to: '/avero/inventory', icon: '📦', label: 'Live Stock & Batches', badge: '24 SKUs' },
    { to: '/avero/salvage', icon: '♻️', label: 'Expiry & Salvage', badge: '5 at risk', badgeColor: '#c88a18' },
    { to: '/avero/pos', icon: '💳', label: 'Aztec POS Checkout' },
    { to: '/avero/service-queue', icon: '🎧', label: 'Customer Service Queue', badge: '3 open' },
    { to: '/analytics', icon: '📉', label: 'Platform Analytics' },
  ];

  return (
    <div
      className="avero-theme-root"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#f6f3eb',
        color: '#16241e',
      }}
    >
      <style>{`
        .avero-theme-root {
          --avero-primary: #173d35;
          --avero-primary-hover: #0f2c25;
          --avero-green: #2f8059;
          --avero-parchment: #f6f3eb;
          --avero-panel: #fffefb;
          --avero-panel-alt: #f0ece1;
          --avero-border: #d8ded0;
          --avero-gold: #f5d65c;
        }
        .avero-nav-tab {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 600;
          color: #4a5a51;
          text-decoration: none;
          transition: all 0.18s ease;
          background: transparent;
          border: 1px solid transparent;
          white-space: nowrap;
        }
        .avero-nav-tab:hover {
          background: var(--avero-panel-alt);
          color: var(--avero-primary);
        }
        .avero-nav-tab.active {
          background: #173d35;
          color: #fffefb;
          border-color: #173d35;
          box-shadow: 0 4px 14px rgba(23, 61, 53, 0.22);
        }
        .avero-nav-tab.active .avero-tab-badge {
          background: rgba(245, 214, 92, 0.3);
          color: #f5d65c;
        }
        .avero-tab-badge {
          font-size: 10.5px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 999px;
          background: #e2ded2;
          color: #3b463f;
        }
        .avero-status-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          background: #e7e2d4;
          color: #173d35;
          border: 1px solid #d8ded0;
        }
      `}</style>

      {/* Main Avero Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(255, 254, 251, 0.96)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--avero-border)',
          boxShadow: '0 2px 8px rgba(23, 61, 53, 0.04)',
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
          {/* Logo container on clean parchment background */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link
              to="/avero/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#fffefb',
                padding: '6px 14px',
                borderRadius: 14,
                border: '1px solid #d8ded0',
                boxShadow: '0 2px 8px rgba(23,61,53,0.06)',
                textDecoration: 'none',
              }}
            >
              <BrandLogo product="avero" theme="light" height={46} />
            </Link>

            {/* Merchant Store Badge & Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className="avero-status-tag">
                <span>🏪</span>
                <span>{user?.name || 'Aztec Supermarket'}</span>
              </span>
              <span className="avero-status-tag" style={{ background: '#e6f4ea', color: '#137333', borderColor: '#ceead6' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#137333' }}></span>
                <span>Terminal Online</span>
              </span>
              <span className="avero-status-tag" style={{ background: '#fef7e0', color: '#b06000', borderColor: '#feefc3' }}>
                <span>♻️ ₹18,400 Salvageable</span>
              </span>
            </div>
          </div>

          {/* Action buttons & Switchers */}
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
              variant="primary"
              size="sm"
              onClick={() => navigate('/avero/pos')}
              style={{
                background: '#173d35',
                color: '#fffefb',
                fontWeight: 700,
                fontSize: 12.5,
                borderRadius: 10,
                padding: '8px 16px',
                boxShadow: '0 2px 8px rgba(23, 61, 53, 0.25)',
              }}
            >
              💳 Aztec POS Checkout
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
                background: '#0284c7',
                color: '#ffffff',
                borderColor: '#0284c7',
                borderRadius: 10,
                fontWeight: 700,
                padding: '8px 14px',
              }}
            >
              🧺 Switch to Trackly
            </Button>

            <Link
              to="/"
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: '#606d65',
                padding: '6px 10px',
                textDecoration: 'none',
              }}
            >
              ⚡ BatchTrack Home
            </Link>
          </div>
        </div>

        {/* Sub-navigation bar with rounded professional tabs */}
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
              className={({ isActive }) => `avero-nav-tab ${isActive ? 'active' : ''}`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
              {link.badge && (
                <span
                  className="avero-tab-badge"
                  style={link.badgeColor ? { background: link.badgeColor, color: '#ffffff' } : {}}
                >
                  {link.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </header>

      {/* Main Avero Content */}
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
