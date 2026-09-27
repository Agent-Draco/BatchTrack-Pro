import React from 'react';

export default function Sidebar({ className = '', children, open, onClose, ...props }) {
  return (
    <>
      <div
        className={`sidebar-backdrop${open ? ' open' : ''}`}
        onClick={onClose}
      />
      <aside
        className={`ui-sidebar${open ? ' open' : ''} ${className}`.trim()}
        {...props}
      >
        {children}
      </aside>
    </>
  );
}

/*
Example usage:
  <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
    <div className="sidebar-section">
      <div className="sidebar-section-label">Ecosystem</div>
      <Nav to="/" icon="🏠">Home</Nav>
    </div>
  </Sidebar>
*/
