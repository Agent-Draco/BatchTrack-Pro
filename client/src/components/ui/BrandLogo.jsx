import React, { useState } from 'react';

/**
 * BrandLogo Component
 * Renders official brand assets from /logos/{product}_{theme}.png
 * Products: 'batchtrack' | 'trackly' | 'avero'
 * Themes: 'light' (for light backgrounds - dark text) | 'dark' (for dark backgrounds - light text)
 * Constraint: DO NOT place logos on a blue theme/background. Use neutral/white/parchment.
 */
export default function BrandLogo({
  product = 'batchtrack',
  theme = 'light',
  size = 'md',
  height,
  className = '',
  style = {},
  showBadge = false,
  badgeBg,
  alt,
  ...props
}) {
  const [imageError, setImageError] = useState(false);

  // Height mappings with larger, prominent dimensions per user request
  const sizeMap = {
    xs: 28,
    sm: 36,
    md: 48,
    lg: 60,
    xl: 76,
    hero: 92,
  };

  const resolvedHeight = height || sizeMap[size] || 48;
  const imageSrc = `/logos/${product}_${theme}.png`;
  const fallbackLabel =
    product === 'trackly'
      ? 'Trackly'
      : product === 'avero'
      ? 'Avero'
      : 'BatchTrack';

  const defaultBadgeBg =
    product === 'avero'
      ? '#fffefb'
      : '#ffffff';

  const badgeBorderColor =
    product === 'avero'
      ? 'rgba(23, 61, 53, 0.12)'
      : 'rgba(0, 0, 0, 0.08)';

  if (imageError) {
    return (
      <div
        className={`brand-logo-fallback ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: resolvedHeight * 0.45,
          color: theme === 'dark' ? '#f8fafc' : '#0f172a',
          ...style,
        }}
        {...props}
      >
        <span
          style={{
            display: 'inline-grid',
            placeItems: 'center',
            width: resolvedHeight * 0.8,
            height: resolvedHeight * 0.8,
            borderRadius: resolvedHeight * 0.25,
            background: product === 'trackly' ? '#0284c7' : product === 'avero' ? '#173d35' : '#0f172a',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: resolvedHeight * 0.4,
          }}
        >
          {product === 'trackly' ? 'T' : product === 'avero' ? 'A' : 'B'}
        </span>
        <span>{fallbackLabel}</span>
      </div>
    );
  }

  const logoImg = (
    <img
      src={imageSrc}
      alt={alt || `${fallbackLabel} logo`}
      onError={() => setImageError(true)}
      style={{
        height: resolvedHeight,
        width: 'auto',
        maxWidth: '100%',
        objectFit: 'contain',
        display: 'block',
        ...style,
      }}
      className={`brand-logo-img brand-logo-${product} ${className}`}
      {...props}
    />
  );

  if (showBadge) {
    return (
      <div
        className="brand-logo-badge"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px 14px',
          background: badgeBg || defaultBadgeBg,
          border: `1px solid ${badgeBorderColor}`,
          borderRadius: 14,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}
      >
        {logoImg}
      </div>
    );
  }

  return logoImg;
}
