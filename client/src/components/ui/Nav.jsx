import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Nav({
  to,
  icon,
  children,
  onClick,
  className = '',
  ...props
}) {
  const content = (
    <>
      {icon && <span className="ui-nav-icon">{icon}</span>}
      <span>{children}</span>
    </>
  );

  const classes = `ui-nav-item ${className}`.trim();

  if (to) {
    return (
      <NavLink
        to={to}
        className={({ isActive }) =>
          `${classes}${isActive ? ' active' : ''}`.trim()
        }
        onClick={onClick}
        {...props}
      >
        {content}
      </NavLink>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick} {...props}>
      {content}
    </button>
  );
}

/*
Example usage:
  <Nav to="/trackly/dashboard" icon="📊">Dashboard</Nav>
  <Nav to="/trackly/pantry" icon="🧺">Pantry Scan</Nav>
  <Nav icon="⚙️" onClick={() => alert('Settings')}>Settings</Nav>
*/
