import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import BrandLogo from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';

export default function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDashboardClick = () => {
    if (isAuthenticated && currentUser) {
      navigate(currentUser.portal === 'student' ? '/student/dashboard' : '/institution/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleNavClick = (linkKey, e) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    if (linkKey === 'home') {
      if (location.pathname === '/' || location.pathname === '/about') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate('/');
      }
    } else if (linkKey === 'about') {
      if (location.pathname === '/' || location.pathname === '/about') {
        const el = document.getElementById('about');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate('/about');
      }
    }
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(6, 26, 51, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(228, 233, 240, 0.12)',
        padding: '0.85rem 2rem',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo */}
        <BrandLogo variant="dark" />

        {/* Right Desktop Nav Group (Home, About & CTA) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2.5rem',
            marginLeft: 'auto',
          }}
          className="desktop-nav-group"
        >
          {/* Desktop Navigation Links */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2.25rem',
            }}
            className="desktop-nav"
          >
            <button
              type="button"
              onClick={(e) => handleNavClick('home', e)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '0.92rem',
                fontWeight: 500,
                padding: 0,
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-blue-bright)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)')}
            >
              Home
            </button>

            <button
              type="button"
              onClick={(e) => handleNavClick('about', e)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '0.92rem',
                fontWeight: 500,
                padding: 0,
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-blue-bright)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)')}
            >
              About
            </button>
          </nav>

          {/* Right CTA Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="desktop-actions">
            <button
              onClick={handleDashboardClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(8, 43, 86, 0.55)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                padding: '0.55rem 1.25rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.88rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-blue-primary)';
                e.currentTarget.style.borderColor = 'var(--color-blue-bright)';
                e.currentTarget.style.boxShadow = '0 0 12px rgba(37, 139, 250, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(8, 43, 86, 0.55)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {isAuthenticated ? 'Open Dashboard' : 'Explore Dashboard'}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: '#FFFFFF',
            cursor: 'pointer',
            padding: '4px',
          }}
          className="mobile-nav-toggle"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            padding: '1.25rem 1rem 1.5rem',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            marginTop: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <button
            type="button"
            onClick={(e) => handleNavClick('home', e)}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '1rem',
              fontWeight: 500,
              padding: '0.5rem 0',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            Home
          </button>
          <button
            type="button"
            onClick={(e) => handleNavClick('about', e)}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '1rem',
              fontWeight: 500,
              padding: '0.5rem 0',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            About
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleDashboardClick();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: 'var(--color-blue-primary)',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '0.5rem',
            }}
          >
            {isAuthenticated ? 'Open Dashboard' : 'Explore Dashboard'}
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Embedded CSS for responsive navbar toggle */}
      <style>{`
        @media (max-width: 820px) {
          .desktop-nav-group, .desktop-nav, .desktop-actions {
            display: none !important;
          }
          .mobile-nav-toggle {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}
