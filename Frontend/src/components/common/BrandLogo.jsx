import React from 'react';
import { Link } from 'react-router-dom';

export default function BrandLogo({ variant = 'dark', size = 'default', showTagline = false }) {
  // variant: 'dark' (for dark navy hero/headers) | 'light' (for light analytics backgrounds)
  const isDark = variant === 'dark';

  const iconSizes = {
    small: 28,
    default: 36,
    large: 46,
  };

  const textClasses = {
    small: 'text-lg',
    default: 'text-2xl',
    large: 'text-3xl',
  };

  const iconDim = iconSizes[size] || iconSizes.default;

  return (
    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
      <svg
        width={iconDim}
        height={iconDim}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, filter: 'drop-shadow(0 0 8px rgba(37, 139, 250, 0.45))' }}
      >
        <defs>
          <radialGradient id="sphereGradLogo" cx="35%" cy="30%" r="65%" fx="30%" fy="25%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="40%" stopColor="#258BFA" />
            <stop offset="85%" stopColor="#082B56" />
            <stop offset="100%" stopColor="#061A33" />
          </radialGradient>
        </defs>
        <circle cx="24" cy="24" r="21" fill="url(#sphereGradLogo)" />
        <ellipse cx="19" cy="16" rx="9" ry="5" fill="#FFFFFF" fillOpacity="0.4" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 800,
            fontSize: size === 'small' ? '1.15rem' : size === 'large' ? '1.65rem' : '1.35rem',
            letterSpacing: '0.04em',
            color: isDark ? '#FFFFFF' : 'var(--color-navy)',
            lineHeight: 1.1,
          }}
        >
          PRATIBHA<span style={{ color: 'var(--color-blue-bright)' }}>.</span>
        </span>
        {showTagline && (
          <span
            style={{
              fontSize: '0.68rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: isDark ? 'rgba(255,255,255,0.7)' : 'var(--color-text-secondary)',
              fontWeight: 600,
              marginTop: '2px',
            }}
          >
            Student Success Intelligence
          </span>
        )}
      </div>
    </Link>
  );
}
