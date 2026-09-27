import React from 'react';

export default function Skeleton({ className = '', style, ...props }) {
  return (
    <span
      className={`ui-skeleton ${className}`.trim()}
      style={{ display: 'inline-block', ...style }}
      aria-hidden="true"
      {...props}
    />
  );
}

/*
Example usage:
  <Skeleton className="h-6 w-40" />
  <Skeleton className="h-64 w-full rounded-xl" />
  <div style={{ display: 'grid', gap: 8 }}>
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-4 w-2/3" />
  </div>
*/
