import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Card, CardContent, CardHeader, StatCard, Skeleton, EmptyState, useToast } from '../../components/ui/index.js';
import { getAveroDashboard } from '../../services/avero/averoApi.js';

export default function AveroDashboardPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAveroDashboard();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load executive dashboard data');
      toast.error('Could not fetch Avero operational metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleAction = (item) => {
    if (item.type === 'DISTRIBUTOR_RETURN_URGENT') {
      toast.info(`Opening Distributor Return dispatch for ${item.productName}`);
      navigate('/avero/salvage');
    } else if (item.type === 'NEAR_EXPIRY_RISK') {
      toast.info(`Reviewing dynamic markdowns for ${item.productName}`);
      navigate('/avero/salvage');
    } else if (item.type === 'RETURN_DISPOSITION_PENDING') {
      toast.info(`Opening Return Inspection queue for #${item.returnNumber}`);
      navigate('/avero/service-queue');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', gap: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', color: '#173d35', fontWeight: 800 }}>Avero Executive Dashboard</h1>
          <p style={{ color: '#5a6b61', marginTop: 4 }}>Loading real-time retail intelligence &amp; terminal heartbeat...</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {[1, 2, 3, 4].map(i => (
            <Card key={i}><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
          ))}
        </div>
        <Card><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const attentionItems = data?.attentionItems || [];
  const recentAudits = data?.recentAudits || [];
  const activeTerminals = data?.activeTerminals || [];

  return (
    <div style={{ display: 'grid', gap: 28 }}>
      {/* Top Header with Context & Quick Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: '#e7e2d4', borderRadius: 999, fontSize: 12, fontWeight: 700, color: '#173d35', marginBottom: 8, border: '1px solid #d8ded0' }}>
            <span>🏪 Aztec Supermarket &amp; Fresh Mart</span>
            <span>&bull;</span>
            <span>Store ID: store_aztec_01</span>
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 800, color: '#173d35', margin: 0 }}>
            Executive Dashboard
          </h1>
          <p style={{ color: '#5a6b61', fontSize: 14.5, marginTop: 4, margin: 0 }}>
            Live retail orchestration, salvage opportunities, and terminal surveillance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={loadDashboard}
            style={{ background: '#fffefb', color: '#173d35', borderColor: '#d8ded0', fontWeight: 600 }}
          >
            🔄 Refresh Metrics
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/avero/pos')}
            style={{ background: '#173d35', color: '#fffefb', borderRadius: 10, fontWeight: 700, padding: '8px 16px' }}
          >
            💳 Open Aztec POS Terminal &rarr;
          </Button>
        </div>
      </div>

      {/* Primary KPI Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div style={{ background: '#fffefb', padding: '18px 20px', borderRadius: 18, border: '1px solid #d8ded0', boxShadow: '0 2px 10px rgba(23,61,53,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#606d65', fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Today's Sales</span>
            <span>📈</span>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#173d35', marginTop: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
            ₹{(kpis.todaySalesINR || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 12, color: '#2f8059', fontWeight: 600, marginTop: 4 }}>
            &bull; Immutable Transaction Ledger
          </div>
        </div>

        <div style={{ background: '#fffefb', padding: '18px 20px', borderRadius: 18, border: '1px solid #d8ded0', boxShadow: '0 2px 10px rgba(23,61,53,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#606d65', fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Inventory Value</span>
            <span>📦</span>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#173d35', marginTop: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
            ₹{(kpis.totalInventoryValueINR || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 12, color: '#5a6b61', fontWeight: 600, marginTop: 4 }}>
            Cost Basis: ₹{(kpis.totalCostValueINR || 0).toLocaleString('en-IN')} ({kpis.activeSkusCount} SKUs)
          </div>
        </div>

        <div style={{ background: '#fffefb', padding: '18px 20px', borderRadius: 18, border: '1px solid #d8ded0', boxShadow: '0 2px 10px rgba(23,61,53,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b06000', fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Recoverable Salvage Value</span>
            <span>♻️</span>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#b06000', marginTop: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
            ₹{(kpis.recoverableSalvageValueINR || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 12, color: '#b06000', fontWeight: 600, marginTop: 4 }}>
            Vendor Return Windows &amp; Markdowns
          </div>
        </div>

        <div style={{ background: '#fffefb', padding: '18px 20px', borderRadius: 18, border: '1px solid #d8ded0', boxShadow: '0 2px 10px rgba(23,61,53,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#137333', fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Live POS Terminals</span>
            <span>🟢</span>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#137333', marginTop: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
            {kpis.activeTerminalsCount || 3} Active
          </div>
          <div style={{ fontSize: 12, color: '#137333', fontWeight: 600, marginTop: 4 }}>
            Express &bull; Counter &bull; Service Desk
          </div>
        </div>
      </div>

      {/* CORE INTELLIGENCE: "WHAT NEEDS MY ATTENTION?" */}
      <div
        style={{
          background: '#fffefb',
          borderRadius: 22,
          border: '1px solid #d8ded0',
          padding: '24px',
          boxShadow: '0 4px 16px rgba(23,61,53,0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.5rem' }}>🚨</span>
            <div>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.25rem', fontWeight: 800, color: '#173d35', margin: 0 }}>
                What Needs My Attention?
              </h2>
              <span style={{ fontSize: 13, color: '#5a6b61' }}>
                Proactive intelligence: Distributor return deadlines, near-expiry stock, and return triage
              </span>
            </div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', background: '#fef7e0', color: '#b06000', borderRadius: 999, border: '1px solid #feefc3' }}>
            {attentionItems.length} Urgent Items
          </span>
        </div>

        {attentionItems.length === 0 ? (
          <EmptyState title="All operations clear" description="No critical distributor return deadlines or expiring batches requiring immediate intervention." />
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {attentionItems.map((item) => {
              const isCritical = item.severity === 'CRITICAL';
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 18px',
                    borderRadius: 14,
                    background: isCritical ? '#fff8f6' : '#fcfbf8',
                    border: `1px solid ${isCritical ? '#fcdad4' : '#e6e2d8'}`,
                    gap: 16,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 280, flex: 1 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: isCritical ? '#fce8e6' : '#fef7e0',
                      color: isCritical ? '#c5221f' : '#b06000',
                      display: 'grid', placeItems: 'center', fontSize: '1.2rem', fontWeight: 800,
                    }}>
                      {item.type === 'DISTRIBUTOR_RETURN_URGENT' ? '⏳' : item.type === 'NEAR_EXPIRY_RISK' ? '⚠️' : '🔄'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: '#173d35' }}>{item.title}</span>
                        <span style={{
                          fontSize: 10.5, fontWeight: 800, padding: '2px 7px', borderRadius: 6,
                          background: isCritical ? '#c5221f' : '#b06000', color: '#fff', textTransform: 'uppercase'
                        }}>
                          {item.severity}
                        </span>
                      </div>
                      <p style={{ margin: '3px 0 0', fontSize: 13, color: '#5a6b61' }}>{item.description}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {(item.recoverableValue || item.atRiskValue) && (
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 11, color: '#808f85', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Value at stake</span>
                        <strong style={{ fontSize: 14, color: '#173d35' }}>₹{(item.recoverableValue || item.atRiskValue).toLocaleString('en-IN')}</strong>
                      </div>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAction(item)}
                      style={{
                        background: isCritical ? '#173d35' : '#2f8059',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 12.5,
                        borderRadius: 10,
                        padding: '7px 14px',
                      }}
                    >
                      {item.action === 'DISPATCH_VENDOR_RETURN' ? 'Dispatch Return 📦' : item.action === 'APPLY_DYNAMIC_MARKDOWN' ? 'Apply Markdown 🏷️' : 'Inspect Return 🔎'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Two Column Section: Live POS Terminals & Recent Immutable Audit Stream */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        {/* Terminals Surveillance Card */}
        <div style={{ background: '#fffefb', borderRadius: 20, border: '1px solid #d8ded0', padding: '22px', boxShadow: '0 2px 10px rgba(23,61,53,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#173d35', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🖥️</span>
              <span>POS Terminal Surveillance</span>
            </h3>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#137333', background: '#e6f4ea', padding: '3px 8px', borderRadius: 999 }}>
              All Counters Online
            </span>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            {activeTerminals.map(term => (
              <div key={term.id} style={{ padding: '12px 14px', background: '#f6f3eb', borderRadius: 12, border: '1px solid #e2ded2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: 13.5, color: '#173d35' }}>{term.terminalCode} &bull; {term.terminalName}</strong>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#137333' }}></span>
                  </div>
                  <span style={{ fontSize: 12, color: '#606d65', display: 'block', marginTop: 2 }}>
                    Cashier: <strong>{term.activeCashier}</strong> &bull; {term.counterLocation}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/avero/pos')}
                  style={{ fontSize: 11, padding: '4px 10px', background: '#fffefb', color: '#173d35', borderColor: '#d8ded0' }}
                >
                  Access Counter &rarr;
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Trail Card */}
        <div style={{ background: '#fffefb', borderRadius: 20, border: '1px solid #d8ded0', padding: '22px', boxShadow: '0 2px 10px rgba(23,61,53,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#173d35', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📜</span>
              <span>Immutable System Audit Stream</span>
            </h3>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#606d65' }}>Live Event Feed</span>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            {recentAudits.slice(0, 4).map(audit => (
              <div key={audit.id} style={{ padding: '10px 12px', background: '#f6f3eb', borderRadius: 10, border: '1px solid #e2ded2', fontSize: 12.5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#173d35' }}>{audit.event}</span>
                  <span style={{ fontSize: 11, color: '#808f85' }}>{new Date(audit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div style={{ color: '#4a5a51', marginTop: 2 }}>{audit.detail}</div>
                <div style={{ fontSize: 11, color: '#606d65', marginTop: 4, fontWeight: 600 }}>Actor: {audit.actor}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
