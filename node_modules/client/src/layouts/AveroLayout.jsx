import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/ui/index.js';
import { useAuth } from '../context/index.js';

export default function AveroLayout() {
  const { user, orgId } = useAuth();
  const navigate = useNavigate();

  const headerStyle = {
    position: 'sticky',
    top: 0,
    backgroundColor: '#fffefb',
    borderBottom: '1px solid #d8ded0',
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  };

  const navStyle = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  };

  const linkStyle = (isActive) => ({
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '16px',
    color: isActive ? '#fffefb' : '#173d35',
    backgroundColor: isActive ? '#173d35' : 'transparent',
    fontWeight: 'bold',
    transition: 'all 0.2s'
  });

  const rightNavStyle = {
    display: 'flex',
    gap: '16px',
    alignItems: 'center'
  };

  const badgeStyle = {
    backgroundColor: '#f5d65c',
    color: '#173d35',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 'bold'
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f6f3eb', fontFamily: '"Space Grotesk", sans-serif' }}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <BrandLogo />
          {orgId && <span style={badgeStyle}>ORG: {orgId}</span>}
        </div>
        
        <nav style={navStyle}>
          <NavLink to="/avero/dashboard" style={({ isActive }) => linkStyle(isActive)}>Dashboard</NavLink>
          <NavLink to="/avero/products" style={({ isActive }) => linkStyle(isActive)}>Products</NavLink>
          <NavLink to="/avero/inventory" style={({ isActive }) => linkStyle(isActive)}>Inventory</NavLink>
          <NavLink to="/avero/sales" style={({ isActive }) => linkStyle(isActive)}>Sales</NavLink>
          <NavLink to="/avero/returns" style={({ isActive }) => linkStyle(isActive)}>Returns & Triage</NavLink>
          <NavLink to="/avero/customers" style={({ isActive }) => linkStyle(isActive)}>Customers</NavLink>
          <NavLink to="/avero/change-credits" style={({ isActive }) => linkStyle(isActive)}>Change Credits</NavLink>
          <NavLink to="/avero/salvage" style={({ isActive }) => linkStyle(isActive)}>Salvage</NavLink>
          <NavLink to="/avero/terminals" style={({ isActive }) => linkStyle(isActive)}>Terminals</NavLink>
          <NavLink to="/avero/audit" style={({ isActive }) => linkStyle(isActive)}>Audit</NavLink>
          <NavLink to="/pos/login" style={linkStyle(false)}>POS Login</NavLink>
        </nav>

        <div style={rightNavStyle}>
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigate('/avero/profile')}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2f8059', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {user?.email?.[0].toUpperCase() || 'U'}
            </div>
          </div>
          <div style={{ cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => navigate('/avero/settings')}>
            ⚙️
          </div>
        </div>
      </header>
      
      <main style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
