import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Card, CardHeader, CardContent, CardFooter, Pill } from '../components/ui/index.js';
import DemoWalkthrough from '../components/demo/DemoWalkthrough.jsx';
import { FLOWS, getFlow } from '../data/demoFlows.js';

const FLOW_ORDER = ['consumer', 'retailer', 'identity'];

export default function DemoPage() {
  const [search, setSearch] = useSearchParams();
  const navigate = useNavigate();
  const requestedFlowId = search.get('flow') || '';
  const flowId = useMemo(
    () => (FLOWS[requestedFlowId] ? requestedFlowId : ''),
    [requestedFlowId]
  );
  const flow = flowId ? getFlow(flowId) : null;
  const [walkthroughKey, setWalkthroughKey] = useState(0);

  useEffect(() => {
    setWalkthroughKey((k) => k + 1);
  }, [flowId]);

  if (flow) {
    return (
      <div style={{ position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <Pill variant={flow.pillVariant}>{flow.label} \u2014 Running</Pill>
            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '1.6rem',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                marginTop: 10,
                marginBottom: 2,
              }}
            >
              {flow.label}
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>
              {flow.description} ({flow.steps.length} steps)
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {FLOW_ORDER.map((id) => {
              const f = FLOWS[id];
              return (
                <Button
                  key={id}
                  variant={id === flowId ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => {
                    const params = new URLSearchParams(search);
                    params.set('flow', id);
                    setSearch(params, { replace: true });
                  }}
                >
                  {f.label}
                </Button>
              );
            })}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const params = new URLSearchParams();
                params.delete('flow');
                setSearch(params, { replace: true });
              }}
            >
              Back to flows
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.05rem', marginBottom: 2 }}>
                  Walkthrough is active on this page
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: 13 }}>
                  Follow the tooltip overlay. Use Next / Previous to move between steps or Exit to
                  return to the landing page.
                </p>
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 999,
                  background: 'rgba(245, 214, 92, 0.2)',
                  color: '#7a5d0d',
                  fontSize: 11.5,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: '#e56b38',
                    boxShadow: '0 0 0 4px rgba(229, 107, 56, 0.18)',
                    animation: 'demo-pulse 1.4s ease-in-out infinite',
                  }}
                />
                LIVE
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'grid', gap: 8 }}>
              {flow.steps.map((s, i) => (
                <div
                  key={s.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr auto',
                    alignItems: 'start',
                    gap: 14,
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: 'var(--panel-alt)',
                    border: '1px solid var(--line)',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 999,
                      background: 'var(--brand-2)',
                      color: '#fffdfb',
                      display: 'grid',
                      placeItems: 'center',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 800,
                      fontSize: 12.5,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{s.title}</div>
                    <div
                      style={{
                        color: 'var(--muted)',
                        fontSize: 12.5,
                        marginTop: 2,
                        lineHeight: 1.5,
                      }}
                    >
                      {s.tooltip}
                    </div>
                  </div>
                  <code
                    style={{
                      fontFamily: "'SF Mono', 'JetBrains Mono', Menlo, Consolas, monospace",
                      fontSize: 11.5,
                      color: 'var(--muted)',
                      padding: '4px 8px',
                      background: 'var(--panel)',
                      borderRadius: 6,
                      border: '1px solid var(--line)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s.route}
                  </code>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <p style={{ color: 'var(--muted)', fontSize: 12.5 }}>
                Step progress is kept in session storage until you finish or exit.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setWalkthroughKey((k) => k + 1)}
                >
                  \u21BB Restart walkthrough
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/')}>
                  Back to landing
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>

        <style>{`
          @keyframes demo-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.15); }
          }
        `}</style>

        <DemoWalkthrough
          key={`${flowId}-${walkthroughKey}`}
          flow={flow}
          startingStep={0}
          onFinish={() => {
            try {
              const win = typeof window !== 'undefined' ? window : globalThis;
              win.__batchtrackToast?.success('Demo complete \u2014 explore freely!');
            } catch {
              /* noop */
            }
          }}
          onExit={() => {
            try {
              const win = typeof window !== 'undefined' ? window : globalThis;
              win.__batchtrackToast?.info('Demo exited.');
            } catch {
              /* noop */
            }
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <Pill variant="brand-accent" style={{ marginBottom: 12 }}>
          🎬 Demo Mode
        </Pill>
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            marginBottom: 6,
          }}
        >
          Pick a guided walkthrough
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, maxWidth: 620 }}>
          Each 3\u20135 minute tour walks you through the relevant screens and highlights the
          most important concepts. You can exit at any time, and progress is kept for the current
          session.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {FLOW_ORDER.map((id) => {
          const f = FLOWS[id];
          const colors = {
            consumer: 'var(--trackly-blue)',
            retailer: 'var(--avero-green)',
            identity: 'var(--brand-accent)',
          };
          const icons = {
            consumer: '👤',
            retailer: '🏪',
            identity: '🔏',
          };
          return (
            <Card key={id} className="feature-card">
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: colors[id],
                }}
              />
              <CardHeader>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'var(--panel-alt)',
                      border: '1px solid var(--line)',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '1.25rem',
                    }}
                  >
                    {icons[id]}
                  </div>
                  <div>
                    <Pill variant={f.pillVariant}>{f.label}</Pill>
                    <h3 style={{ marginTop: 8, fontSize: '1.1rem' }}>{f.label}</h3>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p style={{ color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.6 }}>
                  {f.description}
                </p>
                <div
                  style={{
                    marginTop: 14,
                    padding: '10px 12px',
                    background: 'var(--panel-alt)',
                    borderRadius: 10,
                    border: '1px solid var(--line)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 12.5,
                    color: 'var(--muted)',
                    fontWeight: 700,
                  }}
                >
                  <span>{f.steps.length} guided steps</span>
                  <span>~{(f.steps.length * 0.6).toFixed(1)} min</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant={id === 'retailer' ? 'primary' : id === 'identity' ? 'accent' : 'secondary'}
                  size="lg"
                  onClick={() => {
                    const params = new URLSearchParams(search);
                    params.set('flow', id);
                    setSearch(params, { replace: true });
                  }}
                >
                  Start tour &rarr;
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <h3>Launch with query params</h3>
        </CardHeader>
        <CardContent>
          <p style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 12 }}>
            You can also deep-link directly into any tour by adding a <code>flow</code> query param:
          </p>
          <ul style={{ display: 'grid', gap: 8 }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5 }}>
              <code
                style={{
                  background: 'var(--panel-alt)',
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid var(--line)',
                  fontFamily: "'SF Mono', 'JetBrains Mono', Menlo, Consolas, monospace",
                  fontSize: 12,
                }}
              >
                /demo?flow=consumer
              </code>
              <span style={{ color: 'var(--muted)' }}>\u2192 Consumer (Trackly) tour</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5 }}>
              <code
                style={{
                  background: 'var(--panel-alt)',
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid var(--line)',
                  fontFamily: "'SF Mono', 'JetBrains Mono', Menlo, Consolas, monospace",
                  fontSize: 12,
                }}
              >
                /demo?flow=retailer
              </code>
              <span style={{ color: 'var(--muted)' }}>\u2192 Retailer (Avero) tour</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5 }}>
              <code
                style={{
                  background: 'var(--panel-alt)',
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid var(--line)',
                  fontFamily: "'SF Mono', 'JetBrains Mono', Menlo, Consolas, monospace",
                  fontSize: 12,
                }}
              >
                /demo?flow=identity
              </code>
              <span style={{ color: 'var(--muted)' }}>\u2192 WADN Identity tour</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="secondary" to="/">
            &larr; Back to landing
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
