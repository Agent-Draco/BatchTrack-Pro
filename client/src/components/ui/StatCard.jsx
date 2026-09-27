import React from 'react';

export default function StatCard({
  label,
  value,
  caption,
  accent,
  className = '',
  ...props
}) {
  const accentClass = accent ? `accent-${accent}` : '';
  return (
    <div className={`ui-statcard ${accentClass} ${className}`.trim()} {...props}>
      <span className="ui-statcard-label">{label}</span>
      <span className="ui-statcard-value">{value}</span>
      {caption !== undefined && caption !== null && (
        <span className="ui-statcard-caption">{caption}</span>
      )}
    </div>
  );
}

/*
Example usage:
  <StatCard
    label="Products Tracked"
    value="247"
    caption="+12 this week"
    accent="brand"
  />
  <StatCard
    label="Waste Prevented"
    value="₹24,680"
    caption="Last 30 days"
    accent="green"
  />
  <StatCard
    label="Expiring Soon"
    value="18"
    caption="≤ 14 days"
    accent="warning"
  />
*/
