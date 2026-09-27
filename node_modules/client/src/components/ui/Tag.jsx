import React from 'react';

export default function Tag({ className = '', children, ...props }) {
  return (
    <span className={`ui-tag ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}

/*
Example usage:
  <Tag>Consumables</Tag>
  <Tag>Electronics</Tag>
  <Tag>Pharma</Tag>
*/
