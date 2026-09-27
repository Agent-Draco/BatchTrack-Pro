import React from 'react';

export default function Pill({ variant = 'gray', className = '', children, ...props }) {
  return (
    <span className={`ui-pill ${variant} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}

/*
Example usage:
  <Pill variant="green">Active</Pill>
  <Pill variant="blue">Trackly</Pill>
  <Pill variant="red">Expired</Pill>
  <Pill variant="gray">Pending</Pill>
  <Pill variant="brand-accent">Warranty</Pill>
*/
