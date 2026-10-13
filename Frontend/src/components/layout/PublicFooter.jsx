import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import BrandLogo from '../common/BrandLogo';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  X,
  Shield,
  FileText,
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
      icon: Shield,
      content: [
        'All student records, performance metrics, and cohort evaluations displayed within PRATIBHA adhere to institutional privacy standards and synthetic data governance.',
        'Qualitative student feedback is anonymized and aggregated to preserve student privacy and ensure honest communication.',
        'Institutional data is protected with role-based access control (RBAC), ensuring students, faculty, and administrators access only authorized intelligence.',
      ],
    },
    terms: {
      title: 'Terms of Service',
      subtitle: 'Platform Usage & Advisory Framework',
      icon: FileText,
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
        backgroundColor: '#1A0912',
        color: 'rgba(255, 255, 255, 0.75)',
        borderTop: '1px solid rgba(217, 119, 6, 0.22)',
        padding: '3.5rem 1.5rem 2rem',
        marginTop: 'auto',
        position: 'relative',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '3rem',
          paddingBottom: '3rem',
        }}
      >
        {/* Column 1: Brand & Purpose */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <BrandLogo variant="dark" />
          </div>
          <p
            style={{
              fontSize: '0.88rem',
              lineHeight: 1.65,
              color: 'rgba(255, 255, 255, 0.72)',
              margin: 0,
              maxWidth: '380px',
            }}
          >
            Empowering higher education institutions with real-time student analytics,
            explainable early-warning indicators, and personalized career success pathways.
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '9px',
              padding: '7px 14px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.32)',
              fontSize: '0.78rem',
              color: '#34D399',
              fontWeight: 600,
              width: 'fit-content',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 8px #10B981',
              }}
            />
            <span>All Diagnostic Services Operational</span>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4
            style={{
              color: '#FFFFFF',
              fontSize: '0.90rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ width: '4px', height: '14px', borderRadius: '2px', backgroundColor: '#F59E0B' }} />
            Quick Links
          </h4>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              fontSize: '0.90rem',
            }}
          >
            <li>
              <a
                href="/"
                onClick={(e) => handleNavClick('home', e)}
                style={{
                  color: 'rgba(255, 255, 255, 0.75)',
                  textDecoration: 'none',
                  transition: 'color 0.2s, transform 0.2s',
                  display: 'inline-block',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#F59E0B';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'rgba(255, 255, 255, 0.75)';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                Home Overview
              </a>
            </li>
            <li>
              <a
                href="#about"
                onClick={(e) => handleNavClick('about', e)}
                style={{
                  color: 'rgba(255, 255, 255, 0.75)',
                  textDecoration: 'none',
                  transition: 'color 0.2s, transform 0.2s',
                  display: 'inline-block',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#F59E0B';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'rgba(255, 255, 255, 0.75)';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                About Platform & Architecture
              </a>
            </li>
            <li>
              <Link
                to="/student/portal"
                style={{
                  color: 'rgba(255, 255, 255, 0.75)',
                  textDecoration: 'none',
                  transition: 'color 0.2s, transform 0.2s',
                  display: 'inline-block',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#F59E0B';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'rgba(255, 255, 255, 0.75)';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                Student Success Portal
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                style={{
                  color: 'rgba(255, 255, 255, 0.75)',
                  textDecoration: 'none',
                  transition: 'color 0.2s, transform 0.2s',
                  display: 'inline-block',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#F59E0B';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'rgba(255, 255, 255, 0.75)';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                Institutional Console (Admin / Faculty / TPO)
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Contact & Support */}
        <div>
          <h4
            style={{
              color: '#FFFFFF',
              fontSize: '0.90rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ width: '4px', height: '14px', borderRadius: '2px', backgroundColor: '#F59E0B' }} />
            Contact & Support
          </h4>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.15rem',
              fontSize: '0.88rem',
            }}
          >
            {/* Email */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.28)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#F59E0B',
                }}
              >
                <Mail size={15} />
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.50)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Email Support
                </div>
                <a
                  href="mailto:support@pratibha.edu"
                  style={{
                    color: 'rgba(255, 255, 255, 0.90)',
                    textDecoration: 'none',
                    fontWeight: 500,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.target.style.color = '#F59E0B')}
                  onMouseLeave={(e) => (e.target.style.color = 'rgba(255, 255, 255, 0.90)')}
                >
                  support@pratibha.edu
                </a>
              </div>
            </div>

            {/* Helpline */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.28)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#F59E0B',
                }}
              >
                <Phone size={15} />
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.50)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Helpline / Toll-free
                </div>
                <a
                  href="tel:+9118002004567"
                  style={{
                    color: 'rgba(255, 255, 255, 0.90)',
                    textDecoration: 'none',
                    fontWeight: 500,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.target.style.color = '#F59E0B')}
                  onMouseLeave={(e) => (e.target.style.color = 'rgba(255, 255, 255, 0.90)')}
                >
                  +91 1800 200 4567
                </a>
              </div>
            </div>

            {/* Campus Office */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.28)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#F59E0B',
                }}
              >
                <MapPin size={15} />
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.50)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Campus Center
                </div>
                <span style={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.5 }}>
                  Academic Innovation Center, Block 4, Institutional Area
                </span>
              </div>
            </div>

            {/* Working Hours */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.28)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#F59E0B',
                }}
              >
                <Clock size={15} />
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.50)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Working Hours
                </div>
                <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
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
          maxWidth: '1280px',
          margin: '0 auto',
          paddingTop: '1.75rem',
          borderTop: '1px solid rgba(245, 158, 11, 0.15)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.82rem',
          color: 'rgba(255, 255, 255, 0.60)',
        }}
      >
        <div>
          © {new Date().getFullYear()} PRATIBHA · Student Success Intelligence Platform. All rights reserved.
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setActiveModal('privacy')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'rgba(255, 255, 255, 0.70)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.target.style.color = '#F59E0B')}
            onMouseLeave={(e) => (e.target.style.color = 'rgba(255, 255, 255, 0.70)')}
          >
            Privacy Policy
          </button>
          <span style={{ color: 'rgba(245, 158, 11, 0.35)' }}>•</span>
          <button
            type="button"
            onClick={() => setActiveModal('terms')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'rgba(255, 255, 255, 0.70)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.target.style.color = '#F59E0B')}
            onMouseLeave={(e) => (e.target.style.color = 'rgba(255, 255, 255, 0.70)')}
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
            backgroundColor: 'rgba(15, 4, 10, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.25rem',
          }}
          onClick={() => setActiveModal(null)}
        >
          <div
            style={{
              backgroundColor: '#240D18',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '16px',
              padding: '1.75rem',
              maxWidth: '540px',
              width: '100%',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(225, 29, 72, 0.20)',
              color: '#FFFFFF',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#F59E0B',
                    letterSpacing: '0.08em',
                  }}
                >
                  {modalContent[activeModal].subtitle}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '4px 0 0', color: '#FFFFFF' }}>
                  {modalContent[activeModal].title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: '8px',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.2)';
                  e.currentTarget.style.color = '#F59E0B';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
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
                    backgroundColor: 'rgba(38, 14, 25, 0.85)',
                    border: '1px solid rgba(245, 158, 11, 0.16)',
                    borderRadius: '10px',
                    padding: '0.9rem 1.1rem',
                    fontSize: '0.88rem',
                    color: 'rgba(255, 255, 255, 0.88)',
                    lineHeight: 1.6,
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
                padding: '0.85rem',
                background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                color: '#FFFFFF',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: '10px',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'filter 0.2s, transform 0.2s',
                boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(1.15)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'brightness(1.0)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}
