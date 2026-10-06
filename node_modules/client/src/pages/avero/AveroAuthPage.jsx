import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/index.js';
import { BrandLogo, Button, Card, CardContent, useToast } from '../../components/ui/index.js';

export default function AveroAuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [orgCode, setOrgCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignIn) {
        await signIn(email, password);
        addToast('Signed in successfully', 'success');
        navigate('/avero/dashboard');
      } else {
        await signUp(email, password, fullName, orgCode);
        addToast('Account created successfully. Please sign in.', 'success');
        setIsSignIn(true);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f6f3eb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '"Space Grotesk", sans-serif' }}>
      <div style={{ marginBottom: '32px' }}>
        <BrandLogo />
      </div>
      <Card style={{ width: '400px', backgroundColor: '#fffefb' }}>
        <CardContent>
          <div style={{ display: 'flex', marginBottom: '24px', borderBottom: '1px solid #d8ded0' }}>
            <div style={{ flex: 1, padding: '12px', textAlign: 'center', cursor: 'pointer', borderBottom: isSignIn ? '2px solid #173d35' : 'none', fontWeight: isSignIn ? 'bold' : 'normal' }} onClick={() => setIsSignIn(true)}>Sign In</div>
            <div style={{ flex: 1, padding: '12px', textAlign: 'center', cursor: 'pointer', borderBottom: !isSignIn ? '2px solid #173d35' : 'none', fontWeight: !isSignIn ? 'bold' : 'normal' }} onClick={() => setIsSignIn(false)}>Sign Up</div>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!isSignIn && (
              <>
                <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d8ded0' }} />
                <input type="text" placeholder="Organization Code" value={orgCode} onChange={e => setOrgCode(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d8ded0' }} />
              </>
            )}
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d8ded0' }} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d8ded0' }} />
            <Button type="submit" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? 'Processing...' : (isSignIn ? 'Sign In' : 'Create Account')}
            </Button>
          </form>
        </CardContent>
      </Card>
      <div style={{ marginTop: '32px' }}>
        <Link to="/pos/login" style={{ color: '#2f8059', textDecoration: 'none', fontWeight: 'bold' }}>Access POS Terminal →</Link>
      </div>
    </div>
  );
}
