import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Button, Sidebar, Nav, useToast } from '../components/ui/index.js';

const TRACKLY_LINKS = [
  { to: '/trackly/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/trackly/pantry', icon: '🧺', label: 'Pantry' },
  { to: '/trackly/expiry', icon: '⏰', label: 'Expiry' },
  { to: '/trackly/recipes', icon: '🍳', label: 'Recipes' },
];

const AVERO_LINKS = [
  { to: '/avero/dashboard', icon: '📈', label: 'Dashboard' },
  { to: '/avero/inventory', icon: '📦', label: 'Inventory' },
  { to: '/avero/salvage', icon: '♻️', label: 'Salvage' },
  { to: '/avero/pos', icon: '💳', label: 'POS' },
  { to: '/avero/service-queue', icon: '🎧', label: 'Service Queue' },
];

const PLATFORM_LINKS = [
  { to: '/identity', icon: '🪪', label: 'Identity' },
  { to: '/marketplace', icon: '🛒', label: 'Marketplace' },
  { to: '/analytics', icon: '📉', label: 'Analytics' },
  { to: '/demo', icon: '🎬', label: 'Demo' },
];

function getStored(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function setStored(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* noop */
  }
}

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState(() =>
    getStored('batchtrack_view_mode', 'desktop')
  );
  const [appMode, setAppMode] = useState(() =>
    getStored('batchtrack_app_mode', 'consumer')
  );
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  useEffect(() => {
    const apply = () => {
      const root = document.documentElement;
      const body = document.body;
      root.classList.toggle('phone-mode', viewMode === 'phone');
      body.classList.toggle('phone-mode', viewMode === 'phone');
      body.classList.toggle('mode-consumer', appMode === 'consumer');
      body.classList.toggle('mode-retailer', appMode === 'retailer');
    };
    apply();
  }, [viewMode, appMode]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const toggleViewMode = () => {
    const next = viewMode === 'phone' ? 'desktop' : 'phone';
    setViewMode(next);
    setStored('batchtrack_view_mode', next);
    toast.info(next === 'phone' ? 'Phone view enabled' : 'Desktop view enabled');
  };

  const setAppModeAndStore = (mode) => {
    setAppMode(mode);
    setStored('batchtrack_app_mode', mode);
    toast.info(`Switched to ${mode === 'consumer' ? 'Consumer (Trackly)' : 'Retailer (Avero)'} mode`);
  };

  const showTrackly = appMode !== 'retailer';
  const showAvero = appMode !== 'consumer';

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
        <Link
          to="/"
          className="brand-group"
          onClick={() => setSidebarOpen(false)}
          style={{ padding: '6px 10px 18px', borderBottom: '1px solid var(--line)' }}
        >
          <div className="brand-mark">B</div>
          <div className="brand">
            BatchTrack
            <span className="brand-sub">Product Ecosystem</span>
          </div>
        </Link>

        <div className="sidebar-section">
          <div className="sidebar-section-label">Ecosystem</div>
          <Nav to="/" icon="🏠" onClick={() => setSidebarOpen(false)}>
            Home
          </Nav>
        </div>

        {showTrackly && (
          <div className="sidebar-section">
            <div className="sidebar-section-label">Consumer · Trackly</div>
            {TRACKLY_LINKS.map((l) => (
              <Nav
                key={l.to}
                to={l.to}
                icon={l.icon}
                onClick={() => setSidebarOpen(false)}
              >
                {l.label}
              </Nav>
            ))}
          </div>
        )}

        {showAvero && (
          <div className="sidebar-section">
            <div className="sidebar-section-label">Retailer · Avero</div>
            {AVERO_LINKS.map((l) => (
              <Nav
                key={l.to}
                to={l.to}
                icon={l.icon}
                onClick={() => setSidebarOpen(false)}
              >
                {l.label}
              </Nav>
            ))}
          </div>
        )}

        <div className="sidebar-section">
          <div className="sidebar-section-label">Platform</div>
          {PLATFORM_LINKS.map((l) => (
            <Nav
              key={l.to}
              to={l.to}
              icon={l.icon}
              onClick={() => setSidebarOpen(false)}
            >
              {l.label}
            </Nav>
          ))}
        </div>

        <div className="mode-switch" role="tablist" aria-label="App mode">
          <button
            type="button"
            className={appMode === 'consumer' ? 'active' : ''}
            onClick={() => setAppModeAndStore('consumer')}
            aria-selected={appMode === 'consumer'}
            role="tab"
          >
            Consumer
          </button>
          <button
            type="button"
            className={appMode === 'retailer' ? 'active' : ''}
            onClick={() => setAppModeAndStore('retailer')}
            aria-selected={appMode === 'retailer'}
            role="tab"
          >
            Retailer
          </button>
        </div>
      </Sidebar>

      <div className="app-main">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              className="hamburger-btn"
              onClick={() => setSidebarOpen((s) => !s)}
              aria-label="Toggle navigation"
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? '✕' : '☰'}
            </button>
            <Link to="/" className="brand-group">
              <div className="brand-mark">B</div>
              <div className="brand">
                BatchTrack
                <span className="brand-sub">Product Ecosystem</span>
              </div>
            </Link>
          </div>

          <div className="topbar-actions">
            <Button variant="secondary" size="sm" onClick={toggleViewMode}>
              {viewMode === 'phone' ? '🖥️  Desktop view' : '📱 Phone view'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => toast.info('Survey coming soon!')}
            >
              📋 Take survey
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/trackly/dashboard')}
            >
              Open Trackly
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/avero/dashboard')}
            >
              Open Avero
            </Button>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
