import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { usePosSession } from '../context/index.js';
import { BrandLogo, Button } from '../components/ui/index.js';

export default function PosLayout() {
  const { terminal, isManager, logout } = usePosSession();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/pos/login');
  };

  const headerStyle = {
    backgroundColor: '#0f172a', // Dark theme for POS
    color: 'white',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #334155'
  };

  const infoStyle = {
    display: 'flex',
    gap: '24px',
    alignItems: 'center',
    fontSize: '0.9rem'
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#1e293b', color: 'white' }}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <BrandLogo color="white" />
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Terminal: {terminal?.name || 'Unknown'}</span>
        </div>
        
        <div style={infoStyle}>
          <span>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
          {isManager && <span style={{ backgroundColor: '#dc2626', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>MANAGER</span>}
          <Button variant="danger" onClick={handleLogout} style={{ padding: '8px 16px' }}>Logout</Button>
        </div>
      </header>
      
      <main style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        <Outlet />
      </main>
    </div>
  );
}
