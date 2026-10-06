import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/ui/index.js';
import { useAuth } from '../context/index.js';

export default function AveroLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const headerStyle = {
    position: 'sticky',
    top: 0,
    backgroundColor: '#fffefb',
    borderBottom: '1px solid #d8ded0',
    padding: '12px 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(23, 61, 53, 0.04)',
    flexWrap: 'wrap',
    gap: '12px',
  };

  const navStyle = {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    overflowX: 'auto',
    paddingBottom: '2px',
  };

  const linkStyle = (isActive) => ({
    textDecoration: 'none',
    padding: '8px 14px',
    borderRadius: '12px',
    color: isActive ? '#fffefb' : '#3d4d44',
    backgroundColor: isActive ? '#173d35' : 'transparent',
    fontWeight: 600,
    fontSize: '13.5px',
    whiteSpace: 'nowrap',
    transition: 'all 0.18s ease',
    border: '1px solid',
    borderColor: isActive ? '#173d35' : 'transparent',
  });

  const rightNavStyle = {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f6f3eb', fontFamily: '"Space Grotesk", sans-serif', color: '#16241e' }}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div
            onClick={() => navigate('/avero/dashboard')}
            style={{
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              background: '#fffefb',
              padding: '4px 12px',
              borderRadius: 12,
              border: '1px solid #d8ded0',
              boxShadow: '0 2px 6px rgba(23, 61, 53, 0.06)',
            }}
          >
            <BrandLogo product="avero" theme="light" height={40} />
          </div>

          <span
            style={{
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#173d35',
              background: '#e7e2d4',
              padding: '6px 12px',
              borderRadius: '10px',
              border: '1px solid #d8ded0',
            }}
          >
            🏪 {user?.name || 'Aztec Supermarket & Fresh Mart'}
          </span>

          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#137333',
              background: '#e6f4ea',
              padding: '6px 10px',
              borderRadius: '10px',
              border: '1px solid #ceead6',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#137333' }}></span>
            Terminals Live
          </span>
        </div>

        <nav style={navStyle}>
          <NavLink to="/avero/dashboard" style={({ isActive }) => linkStyle(isActive)}>
            📊 Dashboard
          </NavLink>
          <NavLink to="/avero/products" style={({ isActive }) => linkStyle(isActive)}>
            📦 Products
          </NavLink>
          <NavLink to="/avero/inventory" style={({ isActive }) => linkStyle(isActive)}>
            📋 Inventory
          </NavLink>
          <NavLink to="/avero/sales" style={({ isActive }) => linkStyle(isActive)}>
            🧾 Sales
          </NavLink>
          <NavLink to="/avero/returns" style={({ isActive }) => linkStyle(isActive)}>
            ↩️ Returns & Triage
          </NavLink>
          <NavLink to="/avero/customers" style={({ isActive }) => linkStyle(isActive)}>
            👥 Customers
          </NavLink>
          <NavLink to="/avero/change-credits" style={({ isActive }) => linkStyle(isActive)}>
            🪙 Change Credits
          </NavLink>
          <NavLink to="/avero/salvage" style={({ isActive }) => linkStyle(isActive)}>
            ♻️ Salvage
          </NavLink>
          <NavLink to="/avero/terminals" style={({ isActive }) => linkStyle(isActive)}>
            🖥️ Terminals
          </NavLink>
          <NavLink to="/avero/audit" style={({ isActive }) => linkStyle(isActive)}>
            🔒 Audit
          </NavLink>
          <NavLink
            to="/pos"
            style={{
              ...linkStyle(false),
              background: '#173d35',
              color: '#fffefb',
              fontWeight: 700,
            }}
          >
            💳 Aztec POS
          </NavLink>
        </nav>

        <div style={rightNavStyle}>
          <div
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 10px',
              borderRadius: '10px',
              background: '#f0ece1',
              border: '1px solid #d8ded0',
            }}
            onClick={() => navigate('/avero/profile')}
            title="View Profile"
          >
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#173d35',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'M'}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#173d35' }}>Profile</span>
          </div>

          <div
            style={{
              cursor: 'pointer',
              fontSize: '1.2rem',
              padding: '6px',
              borderRadius: '8px',
            }}
            onClick={() => navigate('/avero/settings')}
            title="Settings"
          >
            ⚙️
          </div>
        </div>
      </header>

      <main style={{ padding: '28px 24px 60px', maxWidth: '1360px', margin: '0 auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
