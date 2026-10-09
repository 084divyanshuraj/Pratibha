import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Info,
  Building2,
  GraduationCap,
  BarChart3,
  CheckCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import BrandLogo from '../../components/common/BrandLogo';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginWithCredentials, loginWithDemo, DEMO_PROFILES } = useAuth();

  const [portal, setPortal] = useState('institution'); // 'institution' | 'student'
  const [email, setEmail] = useState('admin@pratibha.edu');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Switch portal and populate sensible defaults
  const handlePortalSwitch = (newPortal) => {
    setPortal(newPortal);
    setError('');
    if (newPortal === 'student') {
      setEmail('aarav.sharma@pratibha.edu');
      setPassword('student123');
    } else {
      setEmail('admin@pratibha.edu');
      setPassword('admin123');
    }
  };

  const handle1ClickDemo = (profileKey) => {
    const user = loginWithDemo(profileKey);
    setPortal(user.portal);
    navigate(user.portal === 'student' ? '/student/dashboard' : '/institution/dashboard');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your institutional email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address (e.g. name@university.edu).');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    if (password.trim().length < 4) {
      setError('Password must contain at least 4 characters.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      try {
        const loggedInUser = loginWithCredentials(trimmedEmail, password, portal);
        setLoading(false);
        navigate(loggedInUser.portal === 'student' ? '/student/dashboard' : '/institution/dashboard');
      } catch (err) {
        setLoading(false);
        setError('Login failed. Please verify credentials.');
      }
    }, 400);
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="login-container"
    >
      {/* =========================================================================
          LEFT SIDE: AUTHENTICATION FORM & DEMO CONTROLS
          ========================================================================= */}
      <div
        style={{
          flex: '1 1 50%',
          maxWidth: '640px',
          padding: '2.5rem 3.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#FFFFFF',
          zIndex: 5,
        }}
        className="login-form-wrapper"
      >
        {/* Top Header: Logo + Nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <BrandLogo variant="light" size="default" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.88rem' }}>
            <Link
              to="/"
              style={{
                color: 'var(--color-navy)',
                textDecoration: 'none',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Home
            </Link>
            <a
              href="mailto:support@pratibha.edu"
              style={{
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              onClick={(e) => {
                e.preventDefault();
                alert('PRATIBHA Demo Support: Contact your campus administrator or select a preconfigured 1-click persona below.');
              }}
            >
              <HelpCircle size={15} />
              <span>Help</span>
            </a>
          </div>
        </div>

        {/* Center Main Form */}
        <div style={{ maxWidth: '440px', width: '100%', margin: '0 auto' }}>
          {/* Eyebrow */}
          <div
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-blue-primary)',
              marginBottom: '0.4rem',
            }}
          >
            WELCOME BACK
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2.25rem',
              fontWeight: 700,
              color: 'var(--color-navy)',
              lineHeight: 1.15,
              marginBottom: '0.4rem',
            }}
          >
            Welcome to PRATIBHA<span style={{ color: 'var(--color-blue-bright)' }}>.</span>
          </h1>

          {/* Subtitle */}
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
            Your student success journey starts here.
          </p>

          {/* Portal Switcher Tabs */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--color-bg-page)',
              border: '1px solid var(--color-border)',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
              gap: '6px',
              marginBottom: '1.5rem',
            }}
          >
            <button
              type="button"
              onClick={() => handlePortalSwitch('institution')}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '9px 12px',
                borderRadius: 'var(--radius-xs)',
                border: 'none',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: portal === 'institution' ? 'var(--color-blue-primary)' : 'transparent',
                color: portal === 'institution' ? '#FFFFFF' : 'var(--color-navy)',
                boxShadow: portal === 'institution' ? '0 1px 3px rgba(22, 119, 210, 0.3)' : 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Building2 size={16} />
              <span>Institution Portal</span>
            </button>

            <button
              type="button"
              onClick={() => handlePortalSwitch('student')}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '9px 12px',
                borderRadius: 'var(--radius-xs)',
                border: 'none',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: portal === 'student' ? 'var(--color-blue-primary)' : 'transparent',
                color: portal === 'student' ? '#FFFFFF' : 'var(--color-navy)',
                boxShadow: portal === 'student' ? '0 1px 3px rgba(22, 119, 210, 0.3)' : 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              <GraduationCap size={16} />
              <span>Student Portal</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid rgba(220, 38, 38, 0.25)',
                color: 'var(--color-status-danger)',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.84rem',
                marginBottom: '1.25rem',
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {/* Email Field */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-secondary)',
                  pointerEvents: 'none',
                }}
              >
                <Mail size={17} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.45rem',
                  fontSize: '0.9rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-text-main)',
                  outline: 'none',
                  transition: 'border-color var(--transition-fast)',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-blue-primary)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              />
            </div>

            {/* Password Field */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-secondary)',
                  pointerEvents: 'none',
                }}
              >
                <Lock size={17} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 2.5rem 0.75rem 2.45rem',
                  fontSize: '0.9rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-text-main)',
                  outline: 'none',
                  transition: 'border-color var(--transition-fast)',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-blue-primary)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  padding: '2px',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
              }}
            >
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--color-text-main)' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--color-blue-primary)', width: '15px', height: '15px' }}
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => alert('Demo Mode: In this demonstration, any password enters successfully. Use preconfigured personas below.')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-blue-primary)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: 'var(--color-blue-primary)',
                color: '#FFFFFF',
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.95rem',
                fontWeight: 600,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 6px rgba(22, 119, 210, 0.35)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-blue-bright)';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-blue-primary)';
              }}
            >
              <span>{loading ? 'Entering Portal...' : 'Sign in'}</span>
              <ArrowRight size={17} />
            </button>
          </form>

          {/* Demo Experience Banner */}
          <div
            style={{
              backgroundColor: 'var(--color-blue-surface)',
              border: '1px solid var(--color-blue-surface-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
              marginTop: '1.5rem',
              fontSize: '0.78rem',
              color: 'var(--color-navy)',
              lineHeight: 1.45,
            }}
          >
            <Info size={18} style={{ color: 'var(--color-blue-primary)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>
                Demo experience • No real student data.
              </div>
              <div style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Use the provided demo credentials to explore the platform.
              </div>
            </div>
          </div>

          {/* 1-Click Persona Quick Bar */}
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Quick 1-Click Demo Personas:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handle1ClickDemo('admin')}
                style={{
                  padding: '7px 10px',
                  fontSize: '0.76rem',
                  fontWeight: 500,
                  textAlign: 'left',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg-page)',
                  color: 'var(--color-navy)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>🏛️</span>
                <span>Admin (Provost)</span>
              </button>

              <button
                type="button"
                onClick={() => handle1ClickDemo('faculty')}
                style={{
                  padding: '7px 10px',
                  fontSize: '0.76rem',
                  fontWeight: 500,
                  textAlign: 'left',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg-page)',
                  color: 'var(--color-navy)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>👨‍🏫</span>
                <span>Faculty Mentor</span>
              </button>

              <button
                type="button"
                onClick={() => handle1ClickDemo('placement')}
                style={{
                  padding: '7px 10px',
                  fontSize: '0.76rem',
                  fontWeight: 500,
                  textAlign: 'left',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg-page)',
                  color: 'var(--color-navy)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>💼</span>
                <span>Placement Officer</span>
              </button>

              <button
                type="button"
                onClick={() => handle1ClickDemo('student')}
                style={{
                  padding: '7px 10px',
                  fontSize: '0.76rem',
                  fontWeight: 500,
                  textAlign: 'left',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg-page)',
                  color: 'var(--color-navy)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>🎓</span>
                <span>Student (Aarav)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ textAlign: 'center', fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '2rem' }}>
          PRATIBHA Intelligence Platform • KPMG Challenge 4 Prototype
        </div>
      </div>

      {/* =========================================================================
          RIGHT SIDE: CAMPUS PHOTOGRAPH WITH ORGANIC WAVE MASK & FLOATING CARD
          ========================================================================= */}
      <div
        style={{
          flex: '1 1 50%',
          position: 'relative',
          backgroundImage: `url('/assets/images/campus_day_login.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          padding: '3rem',
        }}
        className="login-photo-side"
      >
        {/* SVG Organic Wave Divider on left edge */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: -1,
            height: '100%',
            width: '80px',
            pointerEvents: 'none',
            zIndex: 4,
          }}
          viewBox="0 0 100 1000"
          preserveAspectRatio="none"
        >
          <path
            d="M 0,0 L 40,0 Q 95,250 20,500 T 70,1000 L 0,1000 Z"
            fill="#FFFFFF"
          />
        </svg>

        {/* Floating Intelligence Preview Card — Recreated exactly from Reference Image */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(12px)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(228, 233, 240, 0.85)',
            boxShadow: '0 18px 36px rgba(8, 43, 86, 0.22)',
            padding: '1.5rem 1.75rem',
            width: '340px',
            maxWidth: '100%',
            position: 'relative',
            zIndex: 6,
          }}
        >
          {/* Card Header with Bar Chart Icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--color-blue-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-blue-primary)',
              }}
            >
              <BarChart3 size={18} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-navy)' }}>
              Student Success Intelligence
            </h2>
          </div>

          {/* Three Live Domain Progress Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* 1: Academic Performance */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-main)', fontWeight: 500 }}>Academic Performance</span>
                <span style={{ color: 'var(--color-navy)', fontWeight: 700 }}>78%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-blue-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '78%', height: '100%', backgroundColor: 'var(--color-blue-primary)', borderRadius: '4px' }} />
              </div>
            </div>

            {/* 2: Placement Readiness */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-main)', fontWeight: 500 }}>Placement Readiness</span>
                <span style={{ color: 'var(--color-navy)', fontWeight: 700 }}>64%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-blue-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '64%', height: '100%', backgroundColor: '#8B5CF6', borderRadius: '4px' }} />
              </div>
            </div>

            {/* 3: Engagement & Skills */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-main)', fontWeight: 500 }}>Engagement & Skills</span>
                <span style={{ color: 'var(--color-navy)', fontWeight: 700 }}>72%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-blue-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '72%', height: '100%', backgroundColor: 'var(--color-status-success)', borderRadius: '4px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 960px) {
          .login-container {
            flex-direction: column !important;
          }
          .login-form-wrapper {
            max-width: 100% !important;
            padding: 2rem 1.5rem !important;
          }
          .login-photo-side {
            min-height: 280px !important;
            padding: 1.5rem !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </div>
  );
}
