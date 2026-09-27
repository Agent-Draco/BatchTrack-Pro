import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Pill } from '../ui/index.js';

const STORAGE_KEY_PREFIX = 'batchtrack.demo.step.';

function readStoredStep(flowId) {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_PREFIX + String(flowId));
    if (raw === null) return 0;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

function writeStoredStep(flowId, step) {
  try {
    sessionStorage.setItem(STORAGE_KEY_PREFIX + String(flowId), String(step));
  } catch {
    /* noop */
  }
}

function clearStoredStep(flowId) {
  try {
    sessionStorage.removeItem(STORAGE_KEY_PREFIX + String(flowId));
  } catch {
    /* noop */
  }
}

function findTarget(selector) {
  if (typeof document === 'undefined' || !selector) return null;
  try {
    const el = document.querySelector(selector);
    if (el && el.getBoundingClientRect) return el;
  } catch {
    /* ignore bad selector */
  }
  return null;
}

function getRect(el) {
  if (!el || !el.getBoundingClientRect) return null;
  const r = el.getBoundingClientRect();
  return {
    top: r.top + (window.scrollY || 0),
    left: r.left + (window.scrollX || 0),
    width: r.width,
    height: r.height,
    bottom: r.bottom + (window.scrollY || 0),
    right: r.right + (window.scrollX || 0),
  };
}

export default function DemoWalkthrough({
  flow,
  startingStep = 0,
  onFinish,
  onExit,
}) {
  const navigate = useNavigate();
  const steps = flow?.steps || [];
  const initialStep = useMemo(
    () => (flow ? Math.min(Math.max(startingStep, 0), Math.max(steps.length - 1, 0)) : 0),
    [flow, startingStep]
  );
  const [stepIdx, setStepIdx] = useState(() =>
    flow ? readStoredStep(flow.id) : initialStep
  );
  const [rect, setRect] = useState(null);
  const [viewportH, setViewportH] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 800
  );
  const [viewportW, setViewportW] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const [toast, setToast] = useToastSilent();

  const routeRef = useRef(null);

  const step = steps[stepIdx] || null;
  const isLast = stepIdx === steps.length - 1;
  const isFirst = stepIdx === 0;

  useEffect(() => {
    if (!flow) return;
    writeStoredStep(flow.id, stepIdx);
  }, [flow, stepIdx]);

  useEffect(() => {
    if (!flow) return;
    const stored = readStoredStep(flow.id);
    if (stored !== stepIdx && stored >= 0 && stored < steps.length) {
      setStepIdx(stored);
    }
  }, [flow]);

  useEffect(() => {
    if (!step) return;
    if (step.route && step.route !== routeRef.current) {
      routeRef.current = step.route;
      navigate(step.route);
    }
  }, [step, navigate]);

  useLayoutEffect(() => {
    if (!step) return;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      const el = findTarget(step.target);
      const r = el ? getRect(el) : null;
      setRect(r);
      if (el && el.scrollIntoView) {
        try {
          el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        } catch {
          /* noop */
        }
      }
      setViewportH(window.innerHeight);
      setViewportW(window.innerWidth);
    };

    const t0 = setTimeout(tick, 120);
    const t1 = setTimeout(tick, 400);
    const t2 = setTimeout(tick, 900);

    const onResize = () => {
      setViewportH(window.innerHeight);
      setViewportW(window.innerWidth);
      tick();
    };
    const onScroll = () => tick();
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      cancelled = true;
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
    };
  }, [stepIdx, step?.target, step?.route]);

  if (!flow || !step) return null;

  const spotlight = rect
    ? {
        x: rect.left - 6,
        y: rect.top - 6,
        w: rect.width + 12,
        h: rect.height + 12,
      }
    : null;

  let tooltipPosition = { top: 0, left: 0, anchor: 'below' };
  if (spotlight) {
    const belowTop = spotlight.y + spotlight.h + 14;
    const fitsBelow = belowTop + 220 < (window.scrollY || 0) + viewportH - 24;
    if (fitsBelow) {
      tooltipPosition = {
        top: belowTop,
        left: Math.max(16, spotlight.x),
        anchor: 'below',
      };
    } else {
      tooltipPosition = {
        top: Math.max(16, spotlight.y - 220),
        left: Math.max(16, spotlight.x),
        anchor: 'above',
      };
    }
  } else {
    tooltipPosition = {
      top: (window.scrollY || 0) + viewportH / 2 - 100,
      left: viewportW / 2 - 200,
      anchor: 'center',
    };
  }

  const handlePrev = () => {
    if (isFirst) return;
    setStepIdx((i) => Math.max(0, i - 1));
  };

  const handleNext = () => {
    if (isLast) {
      setToast?.('Demo complete \u2014 explore freely!', 'success');
      clearStoredStep(flow.id);
      onFinish?.();
      navigate('/');
      return;
    }
    setStepIdx((i) => Math.min(steps.length - 1, i + 1));
  };

  const handleExit = () => {
    clearStoredStep(flow.id);
    onExit?.();
    navigate('/');
  };

  const total = steps.length;

  return (
    <DemoOverlay
      spotlight={spotlight}
      viewportW={viewportW}
      viewportH={viewportH}
      stepIdx={stepIdx}
      total={total}
      step={step}
      isLast={isLast}
      isFirst={isFirst}
      flowLabel={flow.label}
      flowPillVariant={flow.pillVariant}
      tooltipPosition={tooltipPosition}
      onPrev={handlePrev}
      onNext={handleNext}
      onExit={handleExit}
    />
  );
}

function useToastSilent() {
  try {
    const win = typeof window !== 'undefined' ? window : globalThis;
    const api = win.__batchtrackToast || null;
    return [
      undefined,
      (msg, type) => {
        if (api) {
          if (type === 'success') api.success?.(msg);
          else if (type === 'error') api.error?.(msg);
          else api.info?.(msg);
        }
      },
    ];
  } catch {
    return [undefined, () => {}];
  }
}

function DemoOverlay({
  spotlight,
  viewportW,
  viewportH,
  stepIdx,
  total,
  step,
  isLast,
  isFirst,
  flowLabel,
  flowPillVariant,
  tooltipPosition,
  onPrev,
  onNext,
  onExit,
}) {
  const [, setToast] = useToastSilent();
  const scrollY = typeof window !== 'undefined' ? window.scrollY || 0 : 0;

  const pageH = Math.max(viewportH, document.body?.scrollHeight || 0, document.documentElement?.scrollHeight || 0);
  const pageW = Math.max(viewportW, document.body?.scrollWidth || 0, document.documentElement?.scrollWidth || 0);

  const pathTop = spotlight
    ? [
        `M0,0 h${pageW} v${pageH} h${-pageW} Z`,
        `M${spotlight.x},${spotlight.y - scrollY} h${spotlight.w} v${spotlight.h} h${-spotlight.w} Z`,
      ].join(' ')
    : `M0,0 h${pageW} v${pageH} h${-pageW} Z`;

  const tooltipWidth = 420;
  const clampedLeft = Math.min(
    Math.max(16, tooltipPosition.left),
    Math.max(16, pageW - tooltipWidth - 16)
  );

  return (
    <div
      className="demo-walkthrough"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        width: pageW,
        minHeight: pageH,
        zIndex: 500,
        pointerEvents: 'none',
      }}
    >
      <svg
        width={pageW}
        height={pageH}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          display: 'block',
          pointerEvents: 'auto',
        }}
        aria-hidden="true"
      >
        <defs>
          <filter id="demo-blur">
            <feGaussianBlur stdDeviation="1" />
          </filter>
        </defs>
        <path
          d={pathTop}
          fill="rgba(11, 23, 38, 0.58)"
          fillRule="evenodd"
          style={{ backdropFilter: 'blur(1.4px)' }}
          onClick={() => setToast?.('Use Next / Previous or Exit to continue.')}
        />
        {spotlight && (
          <rect
            x={spotlight.x}
            y={spotlight.y - scrollY}
            width={spotlight.w}
            height={spotlight.h}
            rx={12}
            fill="none"
            stroke="rgba(245, 214, 92, 0.95)"
            strokeWidth={3}
            pointerEvents="none"
          />
        )}
      </svg>

      <div
        className="demo-tooltip"
        style={{
          position: 'absolute',
          top: tooltipPosition.top,
          left: clampedLeft,
          width: tooltipWidth,
          maxWidth: 'calc(100vw - 32px)',
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 16,
          boxShadow: '0 24px 60px rgba(0,0,0,0.28)',
          padding: 18,
          pointerEvents: 'auto',
          animation: 'demo-tooltip-pop 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <style>{`
          @keyframes demo-tooltip-pop {
            from { opacity: 0; transform: translateY(6px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .demo-progress-dot {
            width: 8px; height: 8px; border-radius: 999px;
            background: var(--line); transition: all 0.18s ease;
          }
          .demo-progress-dot.active {
            background: var(--brand-2); width: 22px;
          }
        `}</style>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <Pill variant={flowPillVariant || 'brand-accent'}>{flowLabel}</Pill>
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 800,
              color: 'var(--muted)',
              letterSpacing: '0.06em',
            }}
          >
            Step {stepIdx + 1} / {total}
          </span>
        </div>

        <h3
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1.15rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            margin: '12px 0 8px',
            color: 'var(--ink)',
          }}
        >
          {step.title}
        </h3>
        <p style={{ color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.6 }}>
          {step.tooltip}
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 16,
          }}
        >
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`demo-progress-dot${i === stepIdx ? ' active' : ''}`}
            />
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            marginTop: 16,
            flexWrap: 'wrap',
          }}
        >
          <Button variant="secondary" size="sm" onClick={onExit}>
            ✕ Exit
          </Button>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={onPrev}
              disabled={isFirst}
              style={isFirst ? { opacity: 0.5, cursor: 'not-allowed' } : null}
            >
              &larr; Previous
            </Button>
            <Button
              variant={isLast ? 'primary' : 'accent'}
              size="sm"
              onClick={onNext}
            >
              {isLast ? 'Finish \u2713' : 'Next &rarr;'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
