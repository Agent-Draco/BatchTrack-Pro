import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, CardFooter, Pill, BrandLogo } from '../../components/ui/index.js';
import { useAuth } from '../../context/index.js';

const LIFECYCLE_STAGES = [
  {
    id: 'product',
    label: 'PRODUCT',
    description: 'A physical product is manufactured and assigned a unique identity.',
  },
  {
    id: 'identity',
    label: 'IDENTITY',
    description: 'WADN becomes the persistent digital name for every unit.',
  },
  {
    id: 'inventory',
    label: 'INVENTORY',
    description: 'Retailer receives stock with batch, expiry, and warranty data.',
  },
  {
    id: 'purchase',
    label: 'PURCHASE',
    description: 'POS checkout transfers ownership from retailer to consumer.',
  },
  {
    id: 'ownership',
    label: 'OWNERSHIP',
    description: 'Consumer tracks the product in Trackly alongside pantry, expiry, and value.',
  },
  {
    id: 'intelligence',
    label: 'INTELLIGENCE',
    description: 'Patterns surface: at-risk expiry, expiring warranties, waste opportunities.',
  },
  {
    id: 'action',
    label: 'ACTION',
    description: 'One-tap service tickets, rescue offers, recipes, and returns close the loop.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { switchRole } = useAuth();

  return (
    <div className="landing-page" style={{ display: 'grid', gap: 56 }}>
      <style>{`
        .eyebrow-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          background: rgba(245, 214, 92, 0.35);
          color: #7a5d0d;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          border: 1px solid rgba(245, 214, 92, 0.65);
        }
        .hero {
          display: grid;
          gap: 24px;
          justify-items: start;
          padding: 16px 4px 4px;
        }
        .hero h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(2.4rem, 5.2vw, 4.2rem);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.05;
          color: var(--ink);
          max-width: 19ch;
          margin: 0;
        }
        .hero h1 .accent {
          background: linear-gradient(135deg, #173d35, #0284c7);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .hero-subtitle {
          font-size: clamp(1.05rem, 1.4vw, 1.25rem);
          color: var(--muted);
          line-height: 1.6;
          max-width: 62ch;
          margin: 0;
        }
        .hero-ctas {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 8px;
        }
        .section-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(1.4rem, 2.2vw, 1.9rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          color: var(--ink);
          margin: 0 0 8px;
        }
        .section-sub {
          color: var(--muted);
          max-width: 65ch;
          font-size: 15px;
          line-height: 1.55;
          margin: 0 0 28px;
        }
        .identity-showcase-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
        }
        @media (max-width: 860px) {
          .identity-showcase-grid {
            grid-template-columns: 1fr;
          }
        }
        .trackly-card-showcase {
          background: #ffffff;
          border: 2px solid #bae6fd;
          border-radius: 24px;
          padding: 28px;
          display: grid;
          gap: 20px;
          box-shadow: 0 10px 30px -10px rgba(2, 132, 199, 0.15);
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .trackly-card-showcase:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 36px -8px rgba(2, 132, 199, 0.22);
        }
        .avero-card-showcase {
          background: #fffefb;
          border: 2px solid #d8ded0;
          border-radius: 24px;
          padding: 28px;
          display: grid;
          gap: 20px;
          box-shadow: 0 10px 30px -10px rgba(23, 61, 53, 0.12);
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .avero-card-showcase:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 36px -8px rgba(23, 61, 53, 0.18);
        }
        .micro-pill-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .trackly-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          background: #e0f2fe;
          color: #0369a1;
          border: 1px solid #bae6fd;
        }
        .avero-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
          background: #e7e2d4;
          color: #173d35;
          border: 1px solid #d8ded0;
        }
        .lifecycle-wrap {
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: var(--card-radius);
          padding: 24px;
          box-shadow: var(--shadow-sm);
        }
        .lifecycle-row {
          display: flex;
          align-items: stretch;
          gap: 0;
          overflow-x: auto;
          padding-bottom: 8px;
        }
        .lifecycle-stage {
          flex: 1 1 0;
          min-width: 150px;
          display: grid;
          gap: 10px;
          justify-items: flex-start;
          padding: 14px 12px;
          border-radius: 12px;
          transition: all 0.2s ease;
          cursor: default;
          position: relative;
        }
        .lifecycle-stage:hover {
          background: var(--panel-alt);
          transform: translateY(-2px);
        }
        .lifecycle-stage:hover .stage-label {
          color: var(--brand-2);
        }
        .lifecycle-stage:hover .stage-num {
          background: var(--brand-2);
          color: #fffdfb;
          box-shadow: 0 0 0 5px rgba(23,61,53,0.12);
        }
        .stage-num {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          font-size: 13px;
          background: var(--panel-alt);
          color: var(--ink);
          border: 1px solid var(--line);
          transition: all 0.2s ease;
        }
        .stage-label {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          font-size: 11px;
          letter-spacing: 0.14em;
          color: var(--muted);
          transition: color 0.2s ease;
        }
        .stage-desc {
          font-size: 12px;
          color: var(--muted);
          line-height: 1.5;
        }
        .lifecycle-arrow {
          flex-shrink: 0;
          width: 24px;
          display: grid;
          place-items: center;
          color: var(--line);
          font-size: 1.1rem;
          font-weight: 700;
        }
        .demo-entry {
          background:
            radial-gradient(800px 220px at 0% 0%, rgba(245,214,92,0.22), transparent 60%),
            radial-gradient(700px 240px at 100% 100%, rgba(2,132,199,0.12), transparent 60%),
            var(--panel);
          border: 1px solid var(--line);
          border-radius: 22px;
          padding: 28px;
          display: grid;
          gap: 18px;
          box-shadow: var(--shadow-sm);
        }
        .demo-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }
        .demo-head h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(1.3rem, 2vw, 1.65rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          margin: 0 0 6px;
        }
        .demo-head p {
          color: var(--muted);
          margin-top: 4px;
          max-width: 54ch;
        }
        .demo-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .footer {
          border-top: 1px solid var(--line);
          padding: 28px 4px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          color: var(--muted);
          font-size: 13px;
        }
        .footer-links {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
        }
        .footer-links a {
          font-weight: 600;
          color: var(--muted);
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .footer-links a:hover {
          color: var(--ink);
        }
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
        }
      `}</style>

      {/* Hero Section with Official BatchTrack Branding */}
      <section className="hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div
            style={{
              background: '#ffffff',
              padding: '6px 16px',
              borderRadius: 14,
              border: '1px solid var(--line)',
              boxShadow: 'var(--shadow-sm)',
              display: 'inline-flex',
            }}
          >
            <BrandLogo product="batchtrack" theme="light" height={48} />
          </div>
          <span className="eyebrow-pill" data-keyword="BatchTrack Ecosystem">
            ⚡ Unified Product Operating System
          </span>
        </div>

        <h1 data-keyword="Make sense of what you know.">
          Make sense of <span className="accent">what you know.</span>
        </h1>
        <p className="hero-subtitle">
          Give every physical product a persistent digital identity — turn scattered information
          into actionable intelligence across consumers and retail merchants.
        </p>

        <div className="hero-ctas">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              switchRole('consumer');
              navigate('/trackly/dashboard');
            }}
            data-cta="Explore Trackly"
            style={{
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: 999,
              fontWeight: 700,
              padding: '14px 28px',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
            }}
          >
            🧺 Launch Trackly Consumer App &rarr;
          </Button>

          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              switchRole('retailer');
              navigate('/avero/dashboard');
            }}
            data-cta="Open Avero"
            style={{
              background: '#173d35',
              color: '#fffefb',
              border: 'none',
              borderRadius: 14,
              fontWeight: 700,
              padding: '14px 28px',
              boxShadow: '0 4px 14px rgba(23, 61, 53, 0.25)',
            }}
          >
            🏪 Launch Avero Retailer OS &rarr;
          </Button>

          <Button
            variant="accent"
            size="lg"
            onClick={() => navigate('/demo')}
            style={{
              borderRadius: 14,
              fontWeight: 700,
              padding: '14px 24px',
            }}
          >
            🎬 Guided Ecosystem Tour
          </Button>
        </div>
      </section>

      {/* Dual Visual Identities Showcase: Trackly (Vivid Blue + Micro Entities) & Avero (Parchment & Forest Green) */}
      <section>
        <h2 className="section-title">Two Dedicated Visual Identities. One Closed-Loop Architecture.</h2>
        <p className="section-sub">
          Experience Trackly’s vivid, consumer-first intelligence alongside Avero’s rounded, executive merchant OS — connected seamlessly by WADN digital passports.
        </p>

        <div className="identity-showcase-grid">
          {/* TRACKLY SHOWCASE CARD */}
          <div className="trackly-card-showcase">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              {/* Logo in clean white container (NEVER on blue background) */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '6px 16px',
                  borderRadius: 14,
                  border: '1px solid #bae6fd',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.08)',
                  display: 'inline-flex',
                }}
              >
                <BrandLogo product="trackly" theme="light" height={44} />
              </div>

              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#0284c7',
                  background: '#f0f9ff',
                  padding: '4px 10px',
                  borderRadius: 999,
                  border: '1px solid #bae6fd',
                }}
              >
                Consumer Intelligence
              </span>
            </div>

            <div>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
                Trackly Household OS
              </h3>
              <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.55, margin: 0 }}>
                Playful, vivid blue dashboard designed for effortless pantry tracking, AI barcode scanner, predictive expiry buckets, and zero-waste recipe recommendations.
              </p>
            </div>

            {/* Playful Micro-Entities */}
            <div className="micro-pill-row">
              <span className="trackly-badge-pill" style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}>
                🔥 2 Expiring Soon
              </span>
              <span className="trackly-badge-pill">
                🧺 18 Products Tracked
              </span>
              <span className="trackly-badge-pill" style={{ background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }}>
                💰 ₹1,240 Waste Saved
              </span>
              <span className="trackly-badge-pill" style={{ background: '#fef3c7', color: '#d97706', borderColor: '#fde68a' }}>
                🍳 3 Smart Recipes
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, background: '#f0f9ff', padding: 14, borderRadius: 16 }}>
              <div style={{ fontSize: 13, color: '#334155' }}>
                <strong>• 4-Step Pantry Vision:</strong> Scan, classify & log
              </div>
              <div style={{ fontSize: 13, color: '#334155' }}>
                <strong>• 4 Expiry Tiers:</strong> Urgent, High, Mid, Safe
              </div>
              <div style={{ fontSize: 13, color: '#334155' }}>
                <strong>• Digital Change Coins:</strong> Cashless loyalty
              </div>
              <div style={{ fontSize: 13, color: '#334155' }}>
                <strong>• Warranty Passport:</strong> 1-tap claim tickets
              </div>
            </div>

            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                switchRole('consumer');
                navigate('/trackly/dashboard');
              }}
              style={{
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: 999,
                fontWeight: 700,
                width: '100%',
                padding: '12px 20px',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
              }}
            >
              Enter Trackly App &rarr;
            </Button>
          </div>

          {/* AVERO SHOWCASE CARD */}
          <div className="avero-card-showcase">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              {/* Logo in clean parchment container */}
              <div
                style={{
                  background: '#fffefb',
                  padding: '6px 16px',
                  borderRadius: 14,
                  border: '1px solid #d8ded0',
                  boxShadow: '0 2px 8px rgba(23, 61, 53, 0.08)',
                  display: 'inline-flex',
                }}
              >
                <BrandLogo product="avero" theme="light" height={44} />
              </div>

              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#173d35',
                  background: '#e7e2d4',
                  padding: '4px 10px',
                  borderRadius: 8,
                  border: '1px solid #d8ded0',
                }}
              >
                Merchant OS & POS
              </span>
            </div>

            <div>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: '#16241e', margin: '0 0 6px' }}>
                Avero Retail Operating System
              </h3>
              <p style={{ color: '#4a5a51', fontSize: 14, lineHeight: 1.55, margin: 0 }}>
                Executive warm parchment & forest green workstation built for high-throughput inventory batches, vendor salvage claims, Aztec POS checkout, and claim queues.
              </p>
            </div>

            {/* Merchant Tags & Status */}
            <div className="micro-pill-row">
              <span className="avero-badge-pill">
                🏪 Aztec Supermarket (BLR-01)
              </span>
              <span className="avero-badge-pill" style={{ background: '#e6f4ea', color: '#137333', borderColor: '#ceead6' }}>
                🟢 POS Terminal Live
              </span>
              <span className="avero-badge-pill" style={{ background: '#fef7e0', color: '#b06000', borderColor: '#feefc3' }}>
                ♻️ ₹18,400 Salvageable
              </span>
              <span className="avero-badge-pill" style={{ background: '#fce8e6', color: '#c5221f', borderColor: '#fad2cf' }}>
                🎧 3 Service Claims
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, background: '#f0ece1', padding: 14, borderRadius: 16 }}>
              <div style={{ fontSize: 13, color: '#263b31' }}>
                <strong>• Live Batch Tracking:</strong> 24 active SKUs
              </div>
              <div style={{ fontSize: 13, color: '#263b31' }}>
                <strong>• Salvage Claims:</strong> Automatic credit notes
              </div>
              <div style={{ fontSize: 13, color: '#263b31' }}>
                <strong>• Aztec POS Terminal:</strong> Instant WADN issuance
              </div>
              <div style={{ fontSize: 13, color: '#263b31' }}>
                <strong>• Service Queue:</strong> Warranty & return triage
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => {
                switchRole('retailer');
                navigate('/avero/dashboard');
              }}
              style={{
                background: '#173d35',
                color: '#fffefb',
                border: 'none',
                borderRadius: 12,
                fontWeight: 700,
                width: '100%',
                padding: '12px 20px',
                boxShadow: '0 4px 12px rgba(23, 61, 53, 0.22)',
              }}
            >
              Enter Avero OS &rarr;
            </Button>
          </div>
        </div>
      </section>

      {/* Shared Lifecycle Section */}
      <section>
        <h2 className="section-title">The lifecycle of a thing, now remembered.</h2>
        <p className="section-sub">
          From factory to pantry to customer service — every event attaches to the persistent WADN passport, queryable across the entire ecosystem.
        </p>
        <div className="lifecycle-wrap">
          <div className="lifecycle-row">
            {LIFECYCLE_STAGES.map((stage, idx) => (
              <React.Fragment key={stage.id}>
                <div className="lifecycle-stage" data-keyword={stage.label}>
                  <div className="stage-num">{idx + 1}</div>
                  <div className="stage-label">{stage.label}</div>
                  <div className="stage-desc">{stage.description}</div>
                </div>
                {idx < LIFECYCLE_STAGES.length - 1 && (
                  <div className="lifecycle-arrow" aria-hidden="true">
                    &rarr;
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Guided Tour Demo Section */}
      <section className="demo-entry">
        <div className="demo-head">
          <div>
            <Pill variant="brand-accent" style={{ marginBottom: 10 }}>
              🎬 Interactive Guided Tour
            </Pill>
            <h2>Experience BatchTrack in 3 minutes</h2>
            <p>
              Choose a perspective to explore the synchronized flow between consumer pantry management, retail inventory, and persistent WADN digital passports.
            </p>
          </div>
        </div>
        <div className="demo-buttons">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/demo?flow=consumer')}
            data-demo="Consumer Demo"
            style={{
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: 999,
              fontWeight: 700,
            }}
          >
            👤 Consumer Flow (Trackly)
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/demo?flow=retailer')}
            data-demo="Retailer Demo"
            style={{
              background: '#173d35',
              color: '#fffefb',
              border: 'none',
              borderRadius: 12,
              fontWeight: 700,
            }}
          >
            🏪 Retailer Flow (Avero)
          </Button>
          <Button
            variant="accent"
            size="lg"
            onClick={() => navigate('/demo?flow=identity')}
            data-demo="Product Identity Demo"
            style={{ borderRadius: 12, fontWeight: 700 }}
          >
            🔏 WADN Identity Flow
          </Button>
        </div>
      </section>

      {/* Footer with BatchTrack Logo */}
      <footer className="footer">
        <div className="footer-brand">
          <div
            style={{
              background: '#ffffff',
              padding: '4px 10px',
              borderRadius: 10,
              border: '1px solid var(--line)',
              display: 'inline-flex',
            }}
          >
            <BrandLogo product="batchtrack" theme="light" height={34} />
          </div>
          <span>&copy; 2026 BatchTrack Ecosystem &middot; Make sense of what you know.</span>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <Link to="/trackly/dashboard" onClick={() => switchRole('consumer')}>Trackly</Link>
          <Link to="/avero/dashboard" onClick={() => switchRole('retailer')}>Avero</Link>
          <Link to="/identity">Identity</Link>
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/analytics">Analytics</Link>
        </nav>
      </footer>
    </div>
  );
}
