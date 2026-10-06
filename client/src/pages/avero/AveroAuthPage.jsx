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
  const { signIn, signUp, switchRole } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleDemoSignIn = () => {
    switchRole('retailer');
    toast.push('Signed in as Aztec Supermarket Manager', 'success');
    navigate('/avero/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignIn) {
        await signIn(email, password);
        toast.push('Signed in successfully', 'success');
        navigate('/avero/dashboard');
      } else {
        await signUp(email, password, fullName, orgCode);
        toast.push('Account created successfully. Please sign in.', 'success');
        setIsSignIn(true);
      }
    } catch (err) {
      toast.push(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f6f3eb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '"Space Grotesk", sans-serif', padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <BrandLogo product="avero" theme="light" height={48} />
      </div>

      <Card style={{ width: '100%', maxWidth: '440px', backgroundColor: '#fffefb', boxShadow: '0 8px 30px rgba(23,61,53,0.08)' }}>
        <CardContent>
          {/* Quick Demo Access */}
          <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f0ece1', borderRadius: '12px', border: '1px solid #d8ded0', textAlign: 'center' }}>
            <div style={{ fontWeight: 700, color: '#173d35', marginBottom: '6px', fontSize: '14px' }}>
              🏪 Instant Merchant Access
            </div>
            <p style={{ margin: '0 0 12px 0', fontSize: '12.5px', color: '#526259' }}>
              Launch directly into Aztec Supermarket with live inventory, batch tracking, and Aztec POS.
            </p>
            <Button
              variant="primary"
              onClick={handleDemoSignIn}
              style={{
                width: '100%',
                backgroundColor: '#173d35',
                color: '#fffefb',
                fontWeight: 700,
                borderRadius: '10px',
                padding: '10px 16px',
              }}
            >
              Sign In as Aztec Supermarket Manager &rarr;
            </Button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#d8ded0' }} />
            <span style={{ fontSize: '12px', color: '#7a8a81', fontWeight: 600 }}>OR USE YOUR CREDENTIALS</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#d8ded0' }} />
          </div>

          <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '1px solid #d8ded0' }}>
            <div
              style={{
                flex: 1,
                padding: '10px',
                textAlign: 'center',
                cursor: 'pointer',
                borderBottom: isSignIn ? '2px solid #173d35' : 'none',
                fontWeight: isSignIn ? 'bold' : 'normal',
                color: isSignIn ? '#173d35' : '#7a8a81',
              }}
              onClick={() => setIsSignIn(true)}
            >
              Sign In
            </div>
            <div
              style={{
                flex: 1,
                padding: '10px',
                textAlign: 'center',
                cursor: 'pointer',
                borderBottom: !isSignIn ? '2px solid #173d35' : 'none',
                fontWeight: !isSignIn ? 'bold' : 'normal',
                color: !isSignIn ? '#173d35' : '#7a8a81',
              }}
              onClick={() => setIsSignIn(false)}
            >
              Create Account
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {!isSignIn && (
              <>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d8ded0', fontSize: '14px' }}
                />
                <input
                  type="text"
                  placeholder="Organization Code (e.g. AZTEC-BLR-01)"
                  value={orgCode}
                  onChange={(e) => setOrgCode(e.target.value)}
                  required
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d8ded0', fontSize: '14px' }}
                />
              </>
            )}
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d8ded0', fontSize: '14px' }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d8ded0', fontSize: '14px' }}
            />
            <Button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '6px',
                backgroundColor: '#2f8059',
                color: '#ffffff',
                fontWeight: 700,
                borderRadius: '10px',
                padding: '12px',
              }}
            >
              {loading ? 'Processing...' : (isSignIn ? 'Sign In &rarr;' : 'Create Account &rarr;')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div style={{ marginTop: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/pos/login" style={{ color: '#173d35', textDecoration: 'none', fontWeight: 'bold', fontSize: '13.5px' }}>
          💳 Access Standalone POS Terminal &rarr;
        </Link>
        <span style={{ color: '#d8ded0' }}>&middot;</span>
        <Link to="/" style={{ color: '#6a7a70', textDecoration: 'none', fontSize: '13.5px' }}>
          Return to BatchTrack Home
        </Link>
      </div>
    </div>
  );
}
