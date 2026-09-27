import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, CardHeader, CardContent, CardFooter, Pill } from '../components/ui/index.js';

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

const FEATURE_CARDS = [
  {
    id: 'trackly',
    topBorder: 'var(--trackly-blue)',
    icon: '🧠',
    title: 'TRACKLY',
    subtitle: 'Consumer Intelligence',
    bullets: [
      'Product ownership dashboard',
      'Smart expiry intelligence',
      'Contextual action panels',
      'AI pantry scan',
      'Waste-minimizing recipe engine',
    ],
    ctaLabel: 'Explore',
    ctaTo: '/trackly/dashboard',
    ctaVariant: 'secondary',
  },
  {
    id: 'avero',
    topBorder: 'var(--avero-green)',
    icon: '🛒',
    title: 'AVERO',
    subtitle: 'Retail Intelligence',
    bullets: [
      'Live inventory management',
      'Expiry salvage & returns',
      'Aztec POS checkout',
      'Digital change credits',
      'Consumer service queue',
    ],
    ctaLabel: 'Open',
    ctaTo: '/avero/dashboard',
    ctaVariant: 'primary',
  },
  {
    id: 'wadn',
    topBorder: 'var(--brand-accent)',
    icon: '🔏',
    title: 'WADN',
    subtitle: 'Product Identity Layer',
    bullets: [
      'Persistent digital record per unit',
      'Links inventory \u2194 ownership',
      'Warranty & service history',
      'Searchable product passport',
      'Cross-system deep links',
    ],
    ctaLabel: 'Explore',
    ctaTo: '/identity',
    ctaVariant: 'accent',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

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
          padding: 28px 4px 4px;
        }
        .hero h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(2.6rem, 5.6vw, 4.6rem);
          font-weight: 700;
          letter-spacing: -0.05em;
          line-height: 1.02;
          color: var(--ink);
          max-width: 18ch;
        }
        .hero h1 .accent {
          background: linear-gradient(135deg, var(--brand-2), var(--brand));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .hero-subtitle {
          font-size: clamp(1rem, 1.3vw, 1.18rem);
          color: var(--muted);
          line-height: 1.6;
          max-width: 60ch;
        }
        .hero-ctas {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 6px;
        }
        .hero-visual {
          margin-top: 18px;
          width: 100%;
          height: 180px;
          border-radius: 22px;
          background:
            radial-gradient(1200px 300px at 10% 20%, rgba(2,132,199,0.12), transparent 60%),
            radial-gradient(900px 280px at 90% 80%, rgba(23,61,53,0.14), transparent 60%),
            radial-gradient(600px 220px at 50% 50%, rgba(229,107,56,0.10), transparent 60%),
            linear-gradient(135deg, #fbf8f1 0%, #f1ece0 100%);
          border: 1px solid var(--line);
          position: relative;
          overflow: hidden;
        }
        .hero-visual::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(transparent 95%, rgba(22,36,30,0.05) 95%),
            linear-gradient(90deg, transparent 95%, rgba(22,36,30,0.05) 95%);
          background-size: 32px 32px;
          mix-blend-mode: multiply;
          opacity: 0.6;
        }
        .section-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(1.4rem, 2.2vw, 1.8rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          color: var(--ink);
          margin: 0 0 6px;
        }
        .section-sub {
          color: var(--muted);
          max-width: 62ch;
          margin: 0 0 20px;
        }
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }
        .feature-card {
          position: relative;
          overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }
        .feature-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          font-size: 1.4rem;
          background: var(--panel-alt);
          border: 1px solid var(--line);
        }
        .feature-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.05rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          margin-top: 14px;
        }
        .feature-subtitle {
          color: var(--muted);
          font-size: 13px;
          margin-top: 4px;
        }
        .feature-bullets {
          display: grid;
          gap: 8px;
          margin-top: 14px;
        }
        .feature-bullets li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13.5px;
          color: var(--ink);
          line-height: 1.5;
        }
        .feature-bullets li::before {
          content: '';
          width: 6px;
          height: 6px;
          margin-top: 8px;
          border-radius: 50%;
          background: var(--brand);
          flex-shrink: 0;
          opacity: 0.75;
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
          padding: 22px 4px 8px;
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
          transition: color 0.15s ease;
        }
        .footer-links a:hover {
          color: var(--ink);
        }
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
        }
        @media (max-width: 960px) {
          .feature-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="hero">
        <span className="eyebrow-pill" data-keyword="BatchTrack Ecosystem">
          ⚡ BatchTrack Ecosystem
        </span>
        <h1 data-keyword="Make sense of what you know.">
          Make sense of <span className="accent">what you know.</span>
        </h1>
        <p className="hero-subtitle">
          Give every physical product a digital identity \u2014 turn scattered information into
          actionable intelligence.
        </p>
        <div className="hero-ctas">
          <Button
            variant="secondary"
            size="lg"
            to="/trackly/dashboard"
            data-cta="Explore Trackly"
          >
            🔍 Explore Trackly
          </Button>
          <Button
            variant="primary"
            size="lg"
            to="/avero/dashboard"
            style={{ background: 'var(--brand-2)' }}
            data-cta="Open Avero"
          >
            🛒 Open Avero
          </Button>
        </div>
        <div className="hero-visual" aria-hidden="true" />
      </section>

      <section>
        <h2 className="section-title">Three systems. One product identity.</h2>
        <p className="section-sub">
          Trackly for households, Avero for retailers, and WADN as the shared identity fabric \u2014
          every physical product finally has a memory.
        </p>
        <div className="feature-grid">
          {FEATURE_CARDS.map((c) => (
            <Card key={c.id} className="feature-card">
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: c.topBorder,
                }}
              />
              <CardContent style={{ paddingTop: 22 }}>
                <div className="feature-icon" data-keyword={c.title}>
                  {c.icon}
                </div>
                <div className="feature-title">{c.title}</div>
                <div className="feature-subtitle">{c.subtitle}</div>
                <ul className="feature-bullets">
                  {c.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant={c.ctaVariant} to={c.ctaTo}>
                  {c.ctaLabel} &rarr;
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">The lifecycle of a thing, now remembered.</h2>
        <p className="section-sub">
          From factory to pantry to service \u2014 every stage is attached to the same WADN and
          queryable by every system in the ecosystem.
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

      <section className="demo-entry">
        <div className="demo-head">
          <div>
            <Pill variant="brand-accent" style={{ marginBottom: 10 }}>
              🎬 Guided Tour
            </Pill>
            <h2>Take a 3-minute guided tour of BatchTrack</h2>
            <p>
              Pick a lens and we\u2019ll walk you through the relevant screens, highlighting the
              most important parts along the way.
            </p>
          </div>
        </div>
        <div className="demo-buttons">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/demo?flow=consumer')}
            data-demo="Consumer Demo"
          >
            👤 Consumer Demo
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/demo?flow=retailer')}
            data-demo="Retailer Demo"
            style={{ background: 'var(--avero-green)' }}
          >
            🏪 Retailer Demo
          </Button>
          <Button
            variant="accent"
            size="lg"
            onClick={() => navigate('/demo?flow=identity')}
            data-demo="Product Identity Demo"
          >
            🔏 Product Identity Demo
          </Button>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-brand">
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'var(--brand-2)',
              color: 'var(--brand-accent)',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 900,
              fontSize: 13,
            }}
          >
            B
          </span>
          BatchTrack &copy; 2026 &middot; Make sense of what you know.
        </div>
        <nav className="footer-links" aria-label="Footer">
          <Link to="/trackly/dashboard">Trackly</Link>
          <Link to="/avero/dashboard">Avero</Link>
          <Link to="/identity">Identity</Link>
          <Link
            to="#"
            onClick={(e) => {
              e.preventDefault();
              try {
                window.__batchtrackToast?.info('Survey coming soon!');
              } catch {
                /* noop */
              }
            }}
          >
            Survey
          </Link>
        </nav>
      </footer>
    </div>
  );
}
