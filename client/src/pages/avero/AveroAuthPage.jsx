import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, useToast, BrandLogo } from '../../components/ui/index.js';
import { useAuth, DEMO_RETAILER } from '../../context/index.js';

export default function AveroAuthPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, loginAsDemo } = useAuth();

  const handleSignInEnterprise = () => {
    loginAsDemo('retailer');
    toast.success('Authenticated as Aztec Supermarket (Avero Enterprise OS)');
    navigate('/avero/dashboard');
  };

  return (
    <div style={{ display: 'grid', gap: 24, maxWidth: 640, margin: '20px auto', width: '100%' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', marginBottom: 12, padding: '8px 16px', background: '#fffefb', borderRadius: 16, border: '1px solid #d8ded0', boxShadow: '0 2px 8px rgba(23,61,53,0.06)' }}>
          <BrandLogo product="avero" theme="light" height={52} />
        </div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.9rem', fontWeight: 700, color: '#173d35', margin: '4px 0' }}>
          Avero Enterprise &amp; POS Access
        </h1>
        <p style={{ color: '#5a6b61', fontSize: 14.5, marginTop: 4 }}>
          Executive merchant management and counter POS terminal gatekeeper.
        </p>
      </div>

      <div
        style={{
          background: '#fffefb',
          border: '1px solid #d8ded0',
          borderRadius: 22,
          padding: '28px',
          display: 'grid',
          gap: 20,
          boxShadow: '0 6px 20px rgba(23, 61, 53, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: '#e7e2d4', display: 'grid', placeItems: 'center', fontSize: '1.8rem', border: '1px solid #d8ded0' }}>
            🏪
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#16241e' }}>{user?.name || DEMO_RETAILER.name}</h3>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#e6f4ea', color: '#137333', border: '1px solid #ceead6' }}>
                ENTERPRISE
              </span>
            </div>
            <span style={{ fontSize: 13, color: '#606d65' }}>Store Code: {user?.storeCode || DEMO_RETAILER.storeCode} &bull; Koramangala 4th Block, BLR</span>
          </div>
        </div>

        <div style={{ background: '#f6f3eb', padding: '14px 18px', borderRadius: 14, fontSize: 13.5, display: 'grid', gap: 10, border: '1px solid #e2ded2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#606d65', fontWeight: 500 }}>Active Terminals:</span>
            <strong style={{ color: '#2f8059' }}>3 Counters Online (POS-01, POS-02, POS-03)</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#606d65', fontWeight: 500 }}>Product SKUs &amp; Batches:</span>
            <strong style={{ color: '#173d35' }}>14 Active SKUs &bull; 15 Batches</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#606d65', fontWeight: 500 }}>Distributor Return Attention:</span>
            <strong style={{ color: '#b06000' }}>4 Batches with deadlines closing</strong>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          <Button
            variant="primary"
            size="lg"
            onClick={handleSignInEnterprise}
            style={{
              background: '#173d35',
              color: '#fffefb',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 15,
              padding: '12px 20px',
              boxShadow: '0 4px 14px rgba(23, 61, 53, 0.25)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>🔐</span>
            <span>Enter Avero Enterprise OS</span>
            <span>&rarr;</span>
          </Button>

          <div style={{ textAlign: 'center', padding: '8px 0', borderTop: '1px solid #e7e2d4', marginTop: 6 }}>
            <span style={{ fontSize: 12.5, color: '#606d65', display: 'block', marginBottom: 8 }}>Looking for fast cashier operation without enterprise management login?</span>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/avero/pos')}
              style={{
                width: '100%',
                background: '#fffefb',
                color: '#173d35',
                borderColor: '#173d35',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                padding: '10px 16px',
              }}
            >
              💳 Launch Standalone POS Counter Terminal &rarr;
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
