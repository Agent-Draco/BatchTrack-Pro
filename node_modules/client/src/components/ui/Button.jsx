import React from 'react';
import { Link } from 'react-router-dom';

export default function Button({
  asChild,
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
  to,
  href,
  type = 'button',
  ...props
}) {
  const classes = [
    'ui-btn',
    variant,
    size,
    asChild ? 'as-child' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (asChild && typeof children === 'function') {
    return children({ className: classes, ...props });
  }

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}

/*
Example usage:
  <Button variant="primary" size="lg" onClick={...}>Save</Button>
  <Button variant="ghost" to="/trackly/dashboard">Go to Dashboard</Button>
  <Button variant="danger" size="sm">Delete</Button>
  <Button variant="accent">Highlighted</Button>
*/
