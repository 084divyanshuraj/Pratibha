import React from 'react';
import { Link } from 'react-router-dom';

/**
 * BrandLogo — Official PRATIBHA Logo Component
 * Uses the user's custom high-resolution stylized logo featuring the
 * graduation mortarboard cap, ribbon swash, and elegant blue typography.
 */
export default function BrandLogo({ variant = 'dark', size = 'default', showTagline = false }) {
  const isDark = variant === 'dark';

  // Sizing variants that scale cleanly in navbar, headers, and footer
  const logoHeights = {
    small: 34,
    default: 44,
    large: 58,
  };

  const h = logoHeights[size] || logoHeights.default;

  return (
    <Link
      to="/"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        textDecoration: 'none',
        flexShrink: 0,
      }}
      aria-label="PRATIBHA Home"
    >
      <img
        src="/assets/images/pratibha_logo.png"
        alt="PRATIBHA"
        style={{
          height: `${h}px`,
          width: 'auto',
          objectFit: 'contain',
          display: 'block',
          filter: isDark
            ? 'drop-shadow(0 0 10px rgba(0, 162, 255, 0.45)) drop-shadow(0 2px 5px rgba(0,0,0,0.4))'
            : 'drop-shadow(0 2px 4px rgba(6, 26, 51, 0.15))',
          transition: 'transform 0.2s ease, filter 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.03)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      />

      {showTagline && (
        <span
          style={{
            fontSize: '0.72rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: isDark ? 'rgba(255,255,255,0.75)' : 'var(--color-text-secondary)',
            fontWeight: 600,
            lineHeight: 1.25,
            borderLeft: `1.5px solid ${isDark ? 'rgba(255,255,255,0.25)' : 'var(--color-border)'}`,
            paddingLeft: '10px',
            marginLeft: '2px',
          }}
        >
          Student Success
          <br />
          Intelligence
        </span>
      )}
    </Link>
  );
}
