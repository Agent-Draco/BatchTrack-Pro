import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase.js';

const AuthContext = createContext();

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
  organizationId: '11111111-1111-1111-1111-111111111101',
  activeSkus: 240,
  dailyTurnoverINR: 84500,
};

export function AuthProvider({ children }) {
  const [role, setRole] = useState(() => {
    try {
      return localStorage.getItem('batchtrack_active_role') || 'retailer';
    } catch {
      return 'retailer';
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('batchtrack_auth_user');
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return role === 'consumer' ? DEMO_CONSUMER : DEMO_RETAILER;
  });

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orgId, setOrgId] = useState(() => {
    return role === 'retailer' ? 'AZTEC-BLR-01' : null;
  });

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
          name: meta.full_name || prev?.name || 'Retailer User',
          role: meta.role || prev?.role || 'retailer',
        }));
        fetchProfile(s.access_token);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        const meta = s.user.user_metadata || {};
        setUser((prev) => ({
          ...prev,
          id: s.user.id,
          email: s.user.email,
          name: meta.full_name || prev?.name || 'Retailer User',
          role: meta.role || prev?.role || 'retailer',
        }));
        fetchProfile(s.access_token);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const fetchProfile = async (token) => {
    try {
      const res = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.orgId) setOrgId(data.orgId);
        if (data.role) setRole(data.role);
      }
    } catch (err) {
      console.warn('Profile fetch notice:', err?.message);
    }
  };

  const switchRole = (newRole) => {
    const targetRole = newRole === 'consumer' ? 'consumer' : 'retailer';
    setRole(targetRole);
    const targetUser = targetRole === 'consumer' ? DEMO_CONSUMER : DEMO_RETAILER;
    setUser(targetUser);
    setOrgId(targetRole === 'retailer' ? 'AZTEC-BLR-01' : null);
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

  const signIn = async (email, password) => {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUp = async (email, password, fullName, orgCode) => {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          org_code: orgCode
        }
      }
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // noop
      }
    }
    setSession(null);
    switchRole('consumer');
  };

  const updateProfile = async (data) => {
    try {
      const token = session?.access_token || 'demo-retailer-token';
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update profile');
      if (session?.access_token) {
        await fetchProfile(session.access_token);
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const isRetailer = role === 'retailer' || user?.role === 'retailer';
  const isConsumer = role === 'consumer' || user?.role === 'consumer';
  const isAuthenticated = !!session || isRetailer;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isAuthenticated,
      isRetailer,
      isConsumer,
      role,
      orgId,
      switchRole,
      loginAsDemo,
      signIn,
      signUp,
      signOut,
      updateProfile
    }}>
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
