import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, useToast } from '../../components/ui/index.js';
import { useAuth, DEMO_CONSUMER } from '../../context/index.js';

export default function TracklyAuthPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, loginAsDemo } = useAuth();

  const handleSwitchConsumer = () => {
    loginAsDemo('consumer');
    toast.success('Signed in as Rahul Sharma (Trackly Consumer)');
    navigate('/trackly/dashboard');
  };

  return (
    <div style={{ display: 'grid', gap: 24, maxWidth: 600, margin: '0 auto', width: '100%' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.8rem', fontWeight: 700 }}>
          Trackly Consumer Account
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
          Manage your digital pantry profile and wallet.
        </p>
      </div>

      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 20,
          padding: '24px',
          display: 'grid',
          gap: 16,
          boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#e0f2fe', display: 'grid', placeItems: 'center', fontSize: '1.6rem' }}>
            {user?.avatar || '👨🏽‍💼'}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{user?.name || DEMO_CONSUMER.name}</h3>
            <span style={{ fontSize: 13, color: '#64748b' }}>{user?.phone || DEMO_CONSUMER.phone}</span>
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 10, fontSize: 13, display: 'grid', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>Digital Change Coins:</span>
            <strong style={{ color: '#16a34a' }}>₹45.00</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>Pantry Products:</span>
            <strong>18 tracked items</strong>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleSwitchConsumer}
          style={{ background: '#0284c7', color: '#fff', borderRadius: 999, fontWeight: 700 }}
        >
          Open Trackly Dashboard &rarr;
        </Button>
      </div>
    </div>
  );
}
