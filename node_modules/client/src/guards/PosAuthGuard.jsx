import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePosSession } from '../context/index.js';
import { Skeleton } from '../components/ui/index.js';

export default function PosAuthGuard({ children }) {
  const { isAuthenticated, loading } = usePosSession();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1a1a2e' }}>
        <Skeleton width="50px" height="50px" borderRadius="50%" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/pos/login" state={{ from: location }} replace />;
  }

  return children;
}
