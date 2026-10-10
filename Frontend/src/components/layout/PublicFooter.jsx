import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import BrandLogo from '../common/BrandLogo';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  X,
  ShieldCheck,
  FileText,
  ExternalLink,
} from 'lucide-react';

export default function PublicFooter() {
  const [activeModal, setActiveModal] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (target, e) => {
    if (target === 'about') {
      if (e) e.preventDefault();
      if (location.pathname === '/' || location.pathname === '/about') {
        const el = document.getElementById('about');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate('/about');
      }
    } else if (target === 'home') {
      if (e) e.preventDefault();
      if (location.pathname === '/' || location.pathname === '/about') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate('/');
      }
    }
  };

  const modalContent = {
    privacy: {
      title: 'Privacy Policy',
      subtitle: 'Student Data Protection & Compliance',
      content: [
        'All student records, performance metrics, and cohort evaluations displayed within PRATIBHA adhere to institutional privacy standards and synthetic data governance.',
        'Qualitative student feedback is anonymized and aggregated to preserve student privacy and ensure honest communication.',
        'Institutional data is protected with role-based access control (RBAC), ensuring students, faculty, and administrators access only authorized intelligence.',
      ],
    },
    terms: {
      title: 'Terms of Service',
      subtitle: 'Platform Usage & Advisory Framework',
      content: [
        'PRATIBHA provides explainable readiness ratings and early alert indicators designed to assist academic mentors, counselors, and administrative leaders.',
        'System alerts serve as decision-support guidance; all student interventions and advisory actions require human-in-the-loop review and approval.',
        'Authorized users must uphold institutional confidentiality and access only records relevant to their designated educational roles.',
      ],
    },
  };

  return (
    <footer
      style={{
        backgroundColor: '#051329',
        color: 'rgba(255, 255, 255, 0.75)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '3.5rem 2rem 2rem',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '3rem',
          paddingBottom: '3rem',
        }}
      >
        {/* Column 1: Brand & Purpose */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <BrandLogo variant="dark" />
          </div>
          <p
            style={{
              fontSize: '0.88rem',
              lineHeight: 1.65,
              color: 'rgba(255, 255, 255, 0.65)',
              margin: 0,
              maxWidth: '360px',
            }}
          >
            Empowering higher education institutions with real-time student analytics,
            explainable early-warning indicators, and personalized career success pathways.
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '999px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontSize: '0.75rem',
              color: '#34D399',
              fontWeight: 500,
              width: 'fit-content',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 6px #10B981',
              }}
            />
            <span>Systems Operational</span>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4
            style={{
              color: '#FFFFFF',
              fontSize: '0.9rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Quick Links
          </h4>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              fontSize: '0.88rem',
            }}
          >
            <li>
              <a
                href="/"
                onClick={(e) => handleNavClick('home', e)}
                style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  display: 'inline-block',
                }}
                onMouseEnter={(e) => (e.target.style.color = '#38BDF8')}
                onMouseLeave={(e) => (e.target.style.color = 'rgba(255, 255, 255, 0.7)')}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#about"
                onClick={(e) => handleNavClick('about', e)}
                style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  display: 'inline-block',
                }}
                onMouseEnter={(e) => (e.target.style.color = '#38BDF8')}
                onMouseLeave={(e) => (e.target.style.color = 'rgba(255, 255, 255, 0.7)')}
              >
                About Platform
              </a>
            </li>
            <li>
              <Link
                to="/student/portal"
                style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  display: 'inline-block',
                }}
                onMouseEnter={(e) => (e.target.style.color = '#38BDF8')}
                onMouseLeave={(e) => (e.target.style.color = 'rgba(255, 255, 255, 0.7)')}
              >
                Student Portal
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  display: 'inline-block',
                }}
                onMouseEnter={(e) => (e.target.style.color = '#38BDF8')}
                onMouseLeave={(e) => (e.target.style.color = 'rgba(255, 255, 255, 0.7)')}
              >
                Institutional Login
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Contact & Support */}
        <div>
          <h4
            style={{
              color: '#FFFFFF',
              fontSize: '0.9rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Contact & Support
          </h4>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              fontSize: '0.88rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <Mail size={16} color="#38BDF8" style={{ marginTop: '3px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '2px' }}>Email Support</div>
                <a
                  href="mailto:support@pratibha.edu"
                  style={{
                    color: 'rgba(255, 255, 255, 0.85)',
                    textDecoration: 'none',
                    fontWeight: 500,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.target.style.color = '#38BDF8')}
                  onMouseLeave={(e) => (e.target.style.color = 'rgba(255, 255, 255, 0.85)')}
                >
                  support@pratibha.edu
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <Phone size={16} color="#38BDF8" style={{ marginTop: '3px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '2px' }}>Helpline / Toll-free</div>
                <a
                  href="tel:+9118002004567"
                  style={{
                    color: 'rgba(255, 255, 255, 0.85)',
                    textDecoration: 'none',
                    fontWeight: 500,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.target.style.color = '#38BDF8')}
                  onMouseLeave={(e) => (e.target.style.color = 'rgba(255, 255, 255, 0.85)')}
                >
                  +91 1800 200 4567
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <MapPin size={16} color="#38BDF8" style={{ marginTop: '3px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '2px' }}>Campus Office</div>
                <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Academic Innovation Center, Block 4, Institutional Area
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <Clock size={16} color="#38BDF8" style={{ marginTop: '3px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '2px' }}>Working Hours</div>
                <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Monday – Friday, 9:00 AM – 6:00 PM IST
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Legal */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'rgba(255, 255, 255, 0.55)',
        }}
      >
        <div>
          © {new Date().getFullYear()} PRATIBHA. All rights reserved.
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setActiveModal('privacy')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.target.style.color = '#38BDF8')}
            onMouseLeave={(e) => (e.target.style.color = 'rgba(255, 255, 255, 0.6)')}
          >
            Privacy Policy
          </button>
          <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>•</span>
          <button
            type="button"
            onClick={() => setActiveModal('terms')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.target.style.color = '#38BDF8')}
            onMouseLeave={(e) => (e.target.style.color = 'rgba(255, 255, 255, 0.6)')}
          >
            Terms of Service
          </button>
        </div>
      </div>

      {/* Modal Dialog for Privacy Policy / Terms */}
      {activeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(2, 6, 15, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem',
          }}
          onClick={() => setActiveModal(null)}
        >
          <div
            style={{
              backgroundColor: '#0A172E',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '14px',
              padding: '2rem',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 189, 248, 0.12)',
              color: '#FFFFFF',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1.25rem',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: '#38BDF8',
                    letterSpacing: '0.06em',
                  }}
                >
                  {modalContent[activeModal].subtitle}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '4px 0 0', color: '#FFFFFF' }}>
                  {modalContent[activeModal].title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#94A3B8',
                  borderRadius: '6px',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '1.5rem' }}>
              {modalContent[activeModal].content.map((paragraph, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    fontSize: '0.85rem',
                    color: '#CBD5E1',
                    lineHeight: 1.55,
                  }}
                >
                  {paragraph}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'var(--color-blue-primary)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = 'var(--color-blue-bright)')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = 'var(--color-blue-primary)')}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}
