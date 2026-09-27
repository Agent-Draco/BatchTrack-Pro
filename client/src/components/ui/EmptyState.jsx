import React from 'react';
import Button from './Button.jsx';

export default function EmptyState({
  icon = '📭',
  title = 'Nothing here yet',
  description,
  actionLabel,
  onAction,
  actionTo,
  className = '',
  ...props
}) {
  return (
    <div className={`ui-emptystate ${className}`.trim()} {...props}>
      <div className="ui-emptystate-icon">{icon}</div>
      {title && <div className="ui-emptystate-title">{title}</div>}
      {description && <div className="ui-emptystate-desc">{description}</div>}
      {(actionLabel && (onAction || actionTo)) && (
        <div className="ui-emptystate-action">
          <Button variant="primary" size="sm" to={actionTo} onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

/*
Example usage:
  <EmptyState
    icon="🧺"
    title="No products in pantry"
    description="Scan your pantry to start tracking expiry dates."
    actionLabel="Scan Pantry"
    actionTo="/trackly/pantry"
  />
*/
