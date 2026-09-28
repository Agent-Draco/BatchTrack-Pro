import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase.js';

const AuthContext = createContext(null);

export const DEMO_CONSUMER = {
  id: 'usr_rahul_01',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@example.com',
  phone: '9876543210',
  role: 'consumer',
  avatar: '👨🏽‍💼',
  location: 'Indiranagar, Bengaluru',
  pantryItemsCount: 18,
  savedValueINR: 1240,
};

export const DEMO_RETAILER = {
  id: 'ret_aztec_01',
  name: 'Aztec Supermarket & Fresh Mart',
  email: 'manager@aztecretail.in',
  phone: '9898012345',
  role: 'retailer',
  avatar: '🏪',
  location: 'Koramangala 4th Block, Bengaluru',
  storeCode: 'AZTEC-BLR-01',
  activeSkus: 240,
  dailyTurnoverINR: 84500,
};

export function AuthProvider({ children }) {
  const [role, setRole] = useState(() => {
    try {
      return localStorage.getItem('batchtrack_active_role') || 'consumer';
    } catch {
      return 'consumer';
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('batchtrack_auth_user');
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return role === 'retailer' ? DEMO_RETAILER : DEMO_CONSUMER;
  });

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        const meta = s.user.user_metadata || {};
        setUser((prev) => ({
          ...prev,
          id: s.user.id,
          email: s.user.email,
          name: meta.full_name || prev?.name || 'User',
          role: meta.role || prev?.role || role,
        }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [role]);

  const switchRole = (newRole) => {
    const targetRole = newRole === 'retailer' ? 'retailer' : 'consumer';
    setRole(targetRole);
    const targetUser = targetRole === 'retailer' ? DEMO_RETAILER : DEMO_CONSUMER;
    setUser(targetUser);
    try {
      localStorage.setItem('batchtrack_active_role', targetRole);
      localStorage.setItem('batchtrack_auth_user', JSON.stringify(targetUser));
    } catch {
      // noop
    }
  };

  const loginAsDemo = (targetRole) => {
    switchRole(targetRole);
  };

  const logout = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // noop
      }
    }
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        session,
        loading,
        switchRole,
        loginAsDemo,
        logout,
        isConsumer: role === 'consumer',
        isRetailer: role === 'retailer',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
