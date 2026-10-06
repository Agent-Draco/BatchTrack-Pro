import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePosSession } from '../../context/index.js';
import { BrandLogo, Button, useToast } from '../../components/ui/index.js';

export default function PosLoginPage() {
  const [terminalCode, setTerminalCode] = useState('');
  const [pin, setPin] = useState('');
  const { login } = usePosSession();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(terminalCode, pin);
      navigate('/pos');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div style={{ height: '100vh', backgroundColor: '#1a1a2e', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '"Space Grotesk", sans-serif' }}>
      <div style={{ marginBottom: '48px' }}>
        <BrandLogo color="white" />
        <h2 style={{ textAlign: 'center', marginTop: '16px', fontWeight: 'normal' }}>POS Terminal Access</h2>
      </div>

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '320px', backgroundColor: '#16213e', padding: '32px', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label>Terminal Code</label>
          <input 
            type="text" 
            value={terminalCode} 
            onChange={e => setTerminalCode(e.target.value)}
            style={{ padding: '12px', fontSize: '1.2rem', backgroundColor: '#0f3460', color: 'white', border: 'none', borderRadius: '8px' }}
            required 
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label>Cashier PIN</label>
          <input 
            type="password" 
            value={pin} 
            onChange={e => setPin(e.target.value)}
            style={{ padding: '12px', fontSize: '1.2rem', backgroundColor: '#0f3460', color: 'white', border: 'none', borderRadius: '8px', letterSpacing: '8px' }}
            maxLength={4}
            required 
          />
        </div>

        <Button type="submit" style={{ padding: '16px', fontSize: '1.2rem', marginTop: '16px' }}>Login to POS</Button>
      </form>

      <div style={{ marginTop: '48px' }}>
        <Link to="/avero/auth" style={{ color: '#4ade80', textDecoration: 'none' }}>← Enterprise Portal Login</Link>
      </div>
    </div>
  );
}
