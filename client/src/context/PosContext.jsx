import React, { createContext, useContext, useState, useEffect } from 'react';

const PosContext = createContext();

export function PosProvider({ children }) {
  const [session, setSession] = useState(null);
  const [terminal, setTerminal] = useState(null);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('avero_pos_session');
    if (token) {
      validateSession(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateSession = async (token) => {
    try {
      const res = await fetch('/api/pos/auth/session', {
        headers: {
          'X-POS-Session': token
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSession(token);
        setTerminal(data.terminal);
        setIsManager(data.isManager);
      } else {
        sessionStorage.removeItem('avero_pos_session');
      }
    } catch (err) {
      console.error('POS session validation failed', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (terminalCode, pin) => {
    const res = await fetch('/api/pos/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ terminalCode, pin })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Login failed');
    }
    const data = await res.json();
    sessionStorage.setItem('avero_pos_session', data.token);
    setSession(data.token);
    setTerminal(data.terminal);
    setIsManager(data.isManager);
    return data;
  };

  const logout = async () => {
    if (session) {
      try {
        await fetch('/api/pos/auth/logout', {
          method: 'POST',
          headers: {
            'X-POS-Session': session
          }
        });
      } catch (err) {
        console.error('POS logout error', err);
      }
    }
    sessionStorage.removeItem('avero_pos_session');
    setSession(null);
    setTerminal(null);
    setIsManager(false);
  };

  return (
    <PosContext.Provider value={{
      session,
      terminal,
      isManager,
      isAuthenticated: !!session,
      loading,
      login,
      logout
    }}>
      {children}
    </PosContext.Provider>
  );
}

export function usePosSession() {
  return useContext(PosContext);
}
