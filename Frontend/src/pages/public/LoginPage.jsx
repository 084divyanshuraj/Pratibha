import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Info,
  Building2,
  GraduationCap,
  BarChart3,
  HelpCircle,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import BrandLogo from '../../components/common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginWithCredentials, loginWithDemo, registerWithCredentials } = useAuth();

  // Mode: 'login' | 'register' (preserving login-register (2).html behavior)
  const [mode, setMode] = useState('login');
  const [transitionDirection, setTransitionDirection] = useState('right'); // 'right' | 'left'

  // Portal selector: 'institution' | 'student'
  const [portal, setPortal] = useState('institution');

  // Form Fields - Login
  const [identifier, setIdentifier] = useState('admin@pratibha.edu');
  const [loginPassword, setLoginPassword] = useState('DemoUser123!');
  const [rememberMe, setRememberMe] = useState(true);

  // Form Fields - Register (Preserving all fields from login-register (2).html)
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // State & Feedback
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Modals
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Switch between Sign In and Sign Up with animated transition
  const handleSwitchMode = (targetMode) => {
    setError('');
    setSuccessMsg('');
    setShowPassword(false);
    setTransitionDirection(targetMode === 'register' ? 'right' : 'left');
    setMode(targetMode);
  };

  // Switch portal and populate sensible defaults
  const handlePortalSwitch = (newPortal) => {
    setPortal(newPortal);
    setError('');
    if (mode === 'login') {
      if (newPortal === 'student') {
        setIdentifier('student@example.edu');
        setLoginPassword('DemoUser123!');
      } else {
        setIdentifier('admin@pratibha.edu');
        setLoginPassword('DemoUser123!');
      }
    }
  };

  // Quick 1-Click Demo Persona
  const handle1ClickDemo = async (profileKey) => {
    setError('');
    setLoading(true);
    try {
      const user = await loginWithDemo(profileKey);
      setPortal(user.portal || 'institution');
      navigate(user.portal === 'student' ? '/student/portal' : '/institution/overview');
    } catch {
      setError('Failed to initiate demo session.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier) {
      setError('Please enter your institutional email or username.');
      return;
    }

    if (!loginPassword) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const loggedInUser = await loginWithCredentials(trimmedIdentifier, loginPassword, portal);
      const targetRoute = loggedInUser.portal === 'student' ? '/student/portal' : '/institution/overview';
      navigate(targetRoute);
    } catch (err) {
      setError(err?.message || 'Invalid credentials. Please verify your login details.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Registration (from login-register (2).html)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedUsername = regUsername.trim();
    const trimmedEmail = regEmail.trim();

    if (!trimmedUsername) {
      setError('Please choose a username.');
      return;
    }

    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const newUser = await registerWithCredentials(trimmedUsername, trimmedEmail, regPassword, portal);
      setSuccessMsg('Account registered successfully! Redirecting to your dashboard...');
      setTimeout(() => {
        const targetRoute = newUser.portal === 'student' ? '/student/portal' : '/institution/overview';
        navigate(targetRoute);
      }, 700);
    } catch (err) {
      setError(err?.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  // Forgot password demo submit
  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSent(true);
  };

  return (
    <div className="pratibha-auth-container">
      {/* =========================================================================
          LEFT PANEL: AUTHENTICATION FORM, BRANDING & DEMO CONTROLS (45% DESKTOP)
          ========================================================================= */}
      <div className="pratibha-auth-left">
        {/* Top Header: Brand Logo + Nav links */}
        <div className="pratibha-auth-header">
          <BrandLogo variant="light" size="default" />

          <nav className="pratibha-auth-header-nav" aria-label="Authentication navigation">
            <Link to="/" className="pratibha-auth-nav-link" id="authNavHome">
              Home
            </Link>
            <button
              type="button"
              className="pratibha-auth-nav-link"
              onClick={() => setShowHelpModal(true)}
              id="authNavHelp"
              aria-label="Open help and documentation"
            >
              <HelpCircle size={15} />
              <span>Help</span>
            </button>
          </nav>
        </div>

        {/* Center Main Form Content */}
        <div className="pratibha-auth-content">
          {/* Eyebrow & Titles */}
          <div className="pratibha-auth-eyebrow">
            {mode === 'login' ? 'WELCOME BACK' : 'CREATE AN ACCOUNT'}
          </div>

          <h1 className="pratibha-auth-title">
            {mode === 'login' ? (
              <>
                Welcome to PRATIBHA<span className="pratibha-auth-dot">.</span>
              </>
            ) : (
              <>
                Join PRATIBHA<span className="pratibha-auth-dot">.</span>
              </>
            )}
          </h1>

          <p className="pratibha-auth-subtitle">
            {mode === 'login'
              ? 'Your student success journey starts here.'
              : 'Register to access your institutional intelligence workspace.'}
          </p>

          {/* Institution Portal / Student Portal Selector */}
          <div className="pratibha-portal-tabs" role="tablist" aria-label="Select target portal">
            <button
              type="button"
              role="tab"
              aria-selected={portal === 'institution'}
              className={`pratibha-portal-tab-btn ${portal === 'institution' ? 'active' : ''}`}
              onClick={() => handlePortalSwitch('institution')}
              id="tabInstitutionPortal"
            >
              <Building2 size={16} />
              <span>Institution Portal</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={portal === 'student'}
              className={`pratibha-portal-tab-btn ${portal === 'student' ? 'active' : ''}`}
              onClick={() => handlePortalSwitch('student')}
              id="tabStudentPortal"
            >
              <GraduationCap size={16} />
              <span>Student Portal</span>
            </button>
          </div>

          {/* Feedback & Error Messages */}
          {error && (
            <div
              style={{
                backgroundColor: 'rgba(220, 38, 38, 0.08)',
                border: '1px solid rgba(220, 38, 38, 0.25)',
                color: 'var(--color-status-danger, #dc2626)',
                padding: '0.7rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.84rem',
                marginBottom: '1.15rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              role="alert"
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                backgroundColor: 'rgba(13, 148, 136, 0.08)',
                border: '1px solid rgba(13, 148, 136, 0.28)',
                color: 'var(--color-status-success, #0d9488)',
                padding: '0.7rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.84rem',
                marginBottom: '1.15rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              role="status"
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Viewport for Animated Form Transitions */}
          <div className="pratibha-form-viewport">
            {mode === 'login' ? (
              /* =======================================================
                 SIGN IN FORM (Preserving autocomplete, validation)
                 ======================================================= */
              <div
                key="login-slide"
                className={`pratibha-form-slide ${
                  transitionDirection === 'left' ? 'entering-from-left' : 'entering-from-right'
                }`}
              >
                <form onSubmit={handleLoginSubmit} id="loginForm" noValidate={false}>
                  {/* Email / Username Field */}
                  <div className="pratibha-input-group">
                    <label htmlFor="loginIdentifier" className="visually-hidden" style={{ display: 'none' }}>
                      Email or Username
                    </label>
                    <div className="pratibha-input-icon">
                      <Mail size={17} />
                    </div>
                    <input
                      type="text"
                      id="loginIdentifier"
                      name="username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="admin@pratibha.edu"
                      required
                      autoComplete="username"
                      className="pratibha-input"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="pratibha-input-group">
                    <label htmlFor="loginPassword" className="visually-hidden" style={{ display: 'none' }}>
                      Password
                    </label>
                    <div className="pratibha-input-icon">
                      <Lock size={17} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="loginPassword"
                      name="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="pratibha-input with-toggle"
                    />
                    <button
                      type="button"
                      className="pratibha-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={0}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>

                  {/* Remember Me & Forgot Password Row */}
                  <div className="pratibha-form-row">
                    <label className="pratibha-checkbox-label">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        id="rememberMeCheckbox"
                      />
                      <span>Remember me</span>
                    </label>

                    <button
                      type="button"
                      className="pratibha-forgot-btn"
                      onClick={() => {
                        setForgotSent(false);
                        setForgotEmail(identifier || '');
                        setShowForgotModal(true);
                      }}
                      id="btnForgotPassword"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Primary Submit Button */}
                  <button
                    type="submit"
                    className="pratibha-submit-btn"
                    disabled={loading}
                    id="btnSignInSubmit"
                  >
                    <span>{loading ? 'Entering Portal...' : 'Sign in'}</span>
                    <ArrowRight size={17} />
                  </button>
                </form>

                {/* Demo Notice Box */}
                <div className="pratibha-demo-notice">
                  <Info size={18} className="pratibha-demo-notice-icon" />
                  <div>
                    <div className="pratibha-demo-notice-title">
                      Demo experience • No real student data.
                    </div>
                    <div className="pratibha-demo-notice-desc">
                      Use the provided demo credentials to explore the platform.
                    </div>
                  </div>
                </div>

                {/* 1-Click Demo Personas */}
                <div className="pratibha-demo-personas">
                  <div className="pratibha-personas-title">QUICK 1-CLICK DEMO PERSONAS:</div>
                  <div className="pratibha-personas-grid">
                    <button
                      type="button"
                      className="pratibha-persona-btn"
                      onClick={() => handle1ClickDemo('admin')}
                      id="btnDemoAdmin"
                    >
                      <span aria-hidden="true">🏛️</span>
                      <span>Admin (Provost)</span>
                    </button>

                    <button
                      type="button"
                      className="pratibha-persona-btn"
                      onClick={() => handle1ClickDemo('faculty')}
                      id="btnDemoFaculty"
                    >
                      <span aria-hidden="true">👨‍🏫</span>
                      <span>Faculty Mentor</span>
                    </button>

                    <button
                      type="button"
                      className="pratibha-persona-btn"
                      onClick={() => handle1ClickDemo('placement')}
                      id="btnDemoPlacement"
                    >
                      <span aria-hidden="true">💼</span>
                      <span>Placement Officer</span>
                    </button>

                    <button
                      type="button"
                      className="pratibha-persona-btn"
                      onClick={() => handle1ClickDemo('student')}
                      id="btnDemoStudent"
                    >
                      <span aria-hidden="true">🎓</span>
                      <span>Student (Aarav)</span>
                    </button>
                  </div>
                </div>

                {/* Switch to Register link (Preserved from login-register (2).html) */}
                <div className="pratibha-switch-wrap">
                  <span>Don't have an account?</span>
                  <button
                    type="button"
                    className="pratibha-switch-btn"
                    onClick={() => handleSwitchMode('register')}
                    id="btnSwitchToRegister"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            ) : (
              /* =======================================================
                 SIGN UP FORM (Preserving username, email, password min 6)
                 ======================================================= */
              <div
                key="register-slide"
                className={`pratibha-form-slide ${
                  transitionDirection === 'right' ? 'entering-from-right' : 'entering-from-left'
                }`}
              >
                <form onSubmit={handleRegisterSubmit} id="registerForm" noValidate={false}>
                  {/* Username Field */}
                  <div className="pratibha-input-group">
                    <label htmlFor="regUsername" className="visually-hidden" style={{ display: 'none' }}>
                      Username
                    </label>
                    <div className="pratibha-input-icon">
                      <User size={17} />
                    </div>
                    <input
                      type="text"
                      id="regUsername"
                      name="username"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="Username (e.g. jdoe)"
                      required
                      autoComplete="username"
                      className="pratibha-input"
                    />
                  </div>

                  {/* Email Field */}
                  <div className="pratibha-input-group">
                    <label htmlFor="regEmail" className="visually-hidden" style={{ display: 'none' }}>
                      Email Address
                    </label>
                    <div className="pratibha-input-icon">
                      <Mail size={17} />
                    </div>
                    <input
                      type="email"
                      id="regEmail"
                      name="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="Email (e.g. name@university.edu)"
                      required
                      autoComplete="email"
                      className="pratibha-input"
                    />
                  </div>

                  {/* Password Field (minlength 6 per reference HTML) */}
                  <div className="pratibha-input-group">
                    <label htmlFor="regPassword" className="visually-hidden" style={{ display: 'none' }}>
                      Password (min 6 characters)
                    </label>
                    <div className="pratibha-input-icon">
                      <Lock size={17} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="regPassword"
                      name="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Password (minimum 6 characters)"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="pratibha-input with-toggle"
                    />
                    <button
                      type="button"
                      className="pratibha-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={0}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>

                  {/* Primary Submit Button */}
                  <button
                    type="submit"
                    className="pratibha-submit-btn"
                    disabled={loading}
                    id="btnRegisterSubmit"
                  >
                    <span>{loading ? 'Creating Profile...' : 'Create Account'}</span>
                    <ArrowRight size={17} />
                  </button>
                </form>

                {/* Switch to Login link (Preserved from login-register (2).html) */}
                <div className="pratibha-switch-wrap">
                  <span>Already have an account?</span>
                  <button
                    type="button"
                    className="pratibha-switch-btn"
                    onClick={() => handleSwitchMode('login')}
                    id="btnSwitchToLogin"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <footer className="pratibha-auth-footer">
          PRATIBHA Intelligence Platform • KPMG Challenge 4 Prototype
        </footer>
      </div>

      {/* =========================================================================
          RIGHT PANEL: CAMPUS PHOTOGRAPH + ORGANIC S-CURVE + INTELLIGENCE CARD
          ========================================================================= */}
      <div
        className="pratibha-auth-right"
        style={{
          backgroundImage: `url('./assets/images/campus_day_login.jpg')`,
        }}
        aria-hidden="true"
      >
        {/* Organic S-Curve Wave SVG Divider connecting white panel and photograph */}
        <svg
          className="pratibha-organic-wave"
          viewBox="0 0 100 1000"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M 0,0 L 22,0 C 95,140 105,290 42,470 C -12,620 58,790 44,1000 L 0,1000 Z"
            fill="#FFFFFF"
          />
        </svg>

        {/* Floating Student Success Intelligence Preview Card */}
        <div className="pratibha-intelligence-card">
          {/* Card Header */}
          <div className="pratibha-card-header">
            <div className="pratibha-card-icon-box">
              <BarChart3 size={18} />
            </div>
            <h2 className="pratibha-card-title">Student Success Intelligence</h2>
          </div>

          {/* Indicators matching target screenshot */}
          <div className="pratibha-card-metrics">
            {/* Academic Performance */}
            <div>
              <div className="pratibha-metric-row">
                <span className="pratibha-metric-label">Academic Performance</span>
                <span className="pratibha-metric-value">78%</span>
              </div>
              <div className="pratibha-progress-track">
                <div className="pratibha-progress-fill-academic" />
              </div>
            </div>

            {/* Placement Readiness */}
            <div>
              <div className="pratibha-metric-row">
                <span className="pratibha-metric-label">Placement Readiness</span>
                <span className="pratibha-metric-value">64%</span>
              </div>
              <div className="pratibha-progress-track">
                <div className="pratibha-progress-fill-placement" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ACCESSIBLE MODALS: HELP DIALOG & FORGOT PASSWORD
          ========================================================================= */}
      {showHelpModal && (
        <div
          className="pratibha-modal-backdrop"
          onClick={() => setShowHelpModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="helpModalTitle"
        >
          <div className="pratibha-modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 id="helpModalTitle" style={{ margin: 0, color: 'var(--color-navy, #082b56)', fontSize: '1.2rem', fontWeight: 700 }}>
                Platform Authentication Guide
              </h3>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, marginBottom: '1rem' }}>
              Welcome to the <strong>PRATIBHA Student Success Intelligence Platform</strong> prototype.
            </p>

            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem', marginBottom: '1.25rem', fontSize: '0.84rem' }}>
              <div style={{ fontWeight: 600, color: '#082b56', marginBottom: '4px' }}>Demo Quick Personas:</div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#475569', lineHeight: 1.5 }}>
                <li><strong>Admin (Provost):</strong> Full institutional overview, radar, cohort segments, and ingestion studio.</li>
                <li><strong>Faculty Mentor:</strong> Department-level cohorts, risk identification, and student drawers.</li>
                <li><strong>Placement Officer:</strong> Decoupled divergence radar and career bootcamp simulations.</li>
                <li><strong>Student:</strong> Personalized 360° self-service portal (Aarav Sharma).</li>
              </ul>
            </div>

            <button
              type="button"
              className="pratibha-submit-btn"
              onClick={() => setShowHelpModal(false)}
              style={{ width: '100%', padding: '0.75rem' }}
            >
              Got it, close
            </button>
          </div>
        </div>
      )}

      {showForgotModal && (
        <div
          className="pratibha-modal-backdrop"
          onClick={() => setShowForgotModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgotModalTitle"
        >
          <div className="pratibha-modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 id="forgotModalTitle" style={{ margin: 0, color: 'var(--color-navy, #082b56)', fontSize: '1.2rem', fontWeight: 700 }}>
                Reset Account Password
              </h3>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            {forgotSent ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-status-success, #0d9488)', fontWeight: 600, marginBottom: '0.5rem' }}>
                  <CheckCircle2 size={18} />
                  <span>Password Reset Instructions Dispatched</span>
                </div>
                <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  If an active institutional profile matches <strong>{forgotEmail}</strong>, a secure reset token has been dispatched. In this demonstration, you can also sign in instantly using any 1-click persona.
                </p>
                <button
                  type="button"
                  className="pratibha-submit-btn"
                  onClick={() => setShowForgotModal(false)}
                  style={{ width: '100%', padding: '0.75rem' }}
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit}>
                <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, marginBottom: '1rem' }}>
                  Enter your registered institutional email address to receive password recovery instructions.
                </p>
                <div className="pratibha-input-group" style={{ marginBottom: '1.25rem' }}>
                  <div className="pratibha-input-icon">
                    <Mail size={17} />
                  </div>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@pratibha.edu"
                    required
                    className="pratibha-input"
                  />
                </div>
                <button
                  type="submit"
                  className="pratibha-submit-btn"
                  style={{ width: '100%', padding: '0.75rem' }}
                >
                  Send Recovery Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
