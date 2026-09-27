import React from 'react';

export default function LifecycleTimeline({ steps = [], className = '', ...props }) {
  const icons = {
    done: '✓',
    active: '●',
    pending: '○',
  };

  return (
    <div className={`ui-timeline ${className}`.trim()} {...props}>
      {steps.map((step, idx) => {
        const status = step.status || 'pending';
        return (
          <div
            key={step.id ?? idx}
            className={`ui-timeline-step ${status}`}
          >
            <div className="ui-timeline-dot">
              {icons[status] || icons.pending}
            </div>
            <div className="ui-timeline-label">{step.label}</div>
            {step.sub && <span className="ui-timeline-sub">{step.sub}</span>}
          </div>
        );
      })}
    </div>
  );
}

/*
Example usage:
  <LifecycleTimeline
    steps={[
      { label: 'Purchased', status: 'done', sub: '2026-09-01 · ₹45' },
      { label: 'Added to Inventory', status: 'done', sub: 'Trackly registered' },
      { label: 'Checked', status: 'active', sub: 'Expiry in 14 days' },
      { label: 'Warranty Active', status: 'pending' },
      { label: 'Action Required', status: 'pending' },
    ]}
  />
*/
