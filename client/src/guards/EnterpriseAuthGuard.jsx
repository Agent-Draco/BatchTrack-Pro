import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/index.js';
import { Skeleton } from '../components/ui/index.js';

export default function EnterpriseAuthGuard({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f6f3eb' }}>
        <Skeleton width="50px" height="50px" borderRadius="50%" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/avero/auth" state={{ from: location }} replace />;
  }

  return children;
}
