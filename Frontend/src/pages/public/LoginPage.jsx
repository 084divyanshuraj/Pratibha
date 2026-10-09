import React, { useState, useRef } from 'react';
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
  HelpCircle,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import BrandLogo from '../../components/common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { saveFirebaseConfig } from '../../services/firebase';
import './LoginPage.css';

const INSTITUTION_ROLES = [
  {
    key: 'institution_admin',
    label: 'Admin (Provost)',
    tag: 'Dean & Provost Office',
    icon: '🏛️',
    defaultEmail: 'admin@example.edu',
    desc: 'Full institutional telemetry, multi-department analytics, batch data ETL pipeline.',
  },
  {
    key: 'faculty_mentor',
    label: 'Faculty Mentor',
    tag: 'CSE Department',
    icon: '👨‍🏫',
    defaultEmail: 'faculty@example.edu',
    desc: 'CSE mentees radar, statutory attendance (<75%), remedial tutoring interventions.',
  },
  {
    key: 'placement_officer',
    label: 'Placement Officer',
    tag: 'Corporate & Career Cell',
    icon: '💼',
    defaultEmail: 'placement@example.edu',
    desc: '2x2 placement readiness matrix, Tier-1 corporate drives, mock interview sprints.',
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginWithCredentials, registerWithCredentials, loginWithGoogle } = useAuth();

  // Mode: active = register mode, inactive = login mode
  const [isRegisterActive, setIsRegisterActive] = useState(false);
  const [animClass, setAnimClass] = useState(''); // 'to-register' | 'to-login' | ''

  // Portal selector: 'institution' | 'student'
  const [portal, setPortal] = useState('institution');

  // Selected Institution Post / Role: 'institution_admin' | 'faculty_mentor' | 'placement_officer'
  const [institutionRole, setInstitutionRole] = useState('institution_admin');

  // Google SSO state
  const [googleLoading, setGoogleLoading] = useState(false);

  // Form Fields - Login
  const [loginIdentifier, setLoginIdentifier] = useState('admin@example.edu');
  const [loginPassword, setLoginPassword] = useState('DemoUser123!');
  const [rememberMe, setRememberMe] = useState(true);

  // Form Fields - Register
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Password visibility
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Status & Feedback
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Modals
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Firebase Google Authentication Modal
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);
  const [fbMode, setFbMode] = useState('direct'); // 'direct' | 'config'
  const [personalGmail, setPersonalGmail] = useState('');
  const [personalName, setPersonalName] = useState('');
  const [fbApiKey, setFbApiKey] = useState('');
  const [fbAuthDomain, setFbAuthDomain] = useState('');
  const [fbProjectId, setFbProjectId] = useState('');
  const [fbAppId, setFbAppId] = useState('');

  const containerRef = useRef(null);

  // Switch to Register with exact diagonal sweep animation
  const handleGoToRegister = (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');
    setAnimClass('to-register');
    setIsRegisterActive(true);
  };

  // Switch back to Login with reverse sweep animation
  const handleGoToLogin = (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');
    setAnimClass('to-login');
    setIsRegisterActive(false);
  };

  // Switch portal and populate sensible defaults
  const handlePortalSwitch = (newPortal) => {
    setPortal(newPortal);
    setError('');
    if (!isRegisterActive) {
      if (newPortal === 'student') {
        setLoginIdentifier('student@example.edu');
        setLoginPassword('DemoUser123!');
      } else {
        const selected = INSTITUTION_ROLES.find((r) => r.key === institutionRole) || INSTITUTION_ROLES[0];
        setLoginIdentifier(selected.defaultEmail);
        setLoginPassword('DemoUser123!');
      }
    }
  };

  // Switch institutional post / role persona
  const handleInstitutionRoleSelect = (roleKey) => {
    setInstitutionRole(roleKey);
    setError('');
    const selected = INSTITUTION_ROLES.find((r) => r.key === roleKey);
    if (selected && !isRegisterActive) {
      setLoginIdentifier(selected.defaultEmail);
      setLoginPassword('DemoUser123!');
    }
  };

  // 1-Click Demo Persona
  const handle1ClickDemo = async (profileKey) => {
    setError('');
    setLoading(true);
    try {
      if (profileKey === 'admin') setInstitutionRole('institution_admin');
      if (profileKey === 'faculty') setInstitutionRole('faculty_mentor');
      if (profileKey === 'placement') setInstitutionRole('placement_officer');
      const user = await loginWithDemo(profileKey);
      setPortal(user.portal || 'institution');
      navigate(user.portal === 'student' ? '/student/portal' : '/institution/overview');
    } catch {
      setError('Failed to initiate demo session.');
    } finally {
      setLoading(false);
    }
  };

  // Google Single Sign-On (SSO) with Firebase Handler (Only for Student Portal)
  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const user = await loginWithGoogle('student');
      navigate('/student/portal');
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      if (err?.message === 'FIREBASE_CONFIG_REQUIRED') {
        setShowFirebaseModal(true);
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in popup was closed before completing authentication.');
      } else if (err?.code === 'auth/cancelled-popup-request') {
        // Ignored or replaced
      } else if (err?.code === 'auth/configuration-not-found') {
        setError('Firebase Authentication setup baki hai: Firebase Console me "Build > Authentication" par jakar "Get started" click karein aur "Google" provider ko Enable karein.');
      } else if (err?.code === 'auth/operation-not-allowed') {
        setError('Google Provider enable nahi hai: Firebase Console > Authentication > Sign-in method me jaakar "Google" ko Enable karein.');
      } else if (err?.code === 'auth/unauthorized-domain') {
        setError('Domain not authorized: Firebase Console > Authentication > Settings > Authorized domains me "localhost" add karein.');
      } else if (err?.code === 'auth/popup-blocked') {
        setError('Popup block ho gaya: Browser me localhost ke liye popups allow karein.');
      } else {
        setError(err?.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Direct Personal Gmail Login Handler (Student Portal)
  const handlePersonalGmailLogin = async (e) => {
    e.preventDefault();
    const trimmed = personalGmail.trim();
    if (!trimmed) {
      setError('Please enter your personal Gmail address.');
      return;
    }
    setError('');
    setGoogleLoading(true);
    try {
      const user = await loginWithGoogle('student', {
        email: trimmed,
        name: personalName.trim() || trimmed.split('@')[0],
      });
      setShowFirebaseModal(false);
      navigate('/student/portal');
    } catch (err) {
      setError(err?.message || 'Login with Gmail failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Save Custom Firebase Credentials and retry live sign-in
  const handleSaveFirebaseConfig = async (e) => {
    e.preventDefault();
    if (!fbApiKey.trim() || !fbAuthDomain.trim()) {
      setError('Firebase API Key and Auth Domain are required.');
      return;
    }
    saveFirebaseConfig({
      apiKey: fbApiKey.trim(),
      authDomain: fbAuthDomain.trim(),
      projectId: fbProjectId.trim(),
      appId: fbAppId.trim(),
    });
    setError('');
    setShowFirebaseModal(false);
    await handleGoogleSignIn();
  };

  // Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmed = loginIdentifier.trim();
    if (!trimmed) {
      setError('Please enter your username or email.');
      return;
    }
    if (!loginPassword) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const loggedInUser = await loginWithCredentials(
        trimmed,
        loginPassword,
        portal,
        portal === 'institution' ? institutionRole : 'student'
      );
      const targetRoute = loggedInUser.portal === 'student' ? '/student/portal' : '/institution/overview';
      navigate(targetRoute);
    } catch (err) {
      setError(err?.message || 'Invalid credentials. Please verify your login details.');
    } finally {
      setLoading(false);
    }
  };

  // Register Submit
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

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const newUser = await registerWithCredentials(
        trimmedUsername,
        trimmedEmail,
        regPassword,
        portal,
        portal === 'institution' ? institutionRole : 'student'
      );
      setSuccessMsg('Registration successful! Redirecting to dashboard...');
      setTimeout(() => {
        const targetRoute = newUser.portal === 'student' ? '/student/portal' : '/institution/overview';
        navigate(targetRoute);
      }, 700);
    } catch (err) {
      setError(err?.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="pratibha-cyber-page">
      {/* Background Ambient Glow */}
      <div className="pratibha-ambient-glow" />

      {/* Top Header Navigation */}
      <header className="pratibha-cyber-header">
        <BrandLogo variant="dark" size="default" />

        <nav className="pratibha-cyber-nav" aria-label="Authentication navigation">
          <Link to="/" className="pratibha-cyber-nav-link" id="authNavHome">
            Home
          </Link>
          <button
            type="button"
            className="pratibha-cyber-nav-link"
            onClick={() => setShowHelpModal(true)}
            id="authNavHelp"
            aria-label="Open platform help guide"
          >
            <HelpCircle size={15} />
            <span>Help</span>
          </button>
        </nav>
      </header>

      {/* =========================================================================
          MAIN CYBER CARD WITH DIAGONAL SWEEP (EXACT MATCH FOR IMAGES 1, 2, 3)
          ========================================================================= */}
      <div
        ref={containerRef}
        className={`cyber-card-container ${isRegisterActive ? 'active' : ''} ${animClass}`}
      >
        {/* Diagonal Gradient Sweep Panel */}
        <div className="cyber-diagonal-panel" />

        {/* =======================================================
            LOGIN SIDE: FORM BOX (LEFT)
            ======================================================= */}
        <div className="cyber-form-box login">
          <h2 className="cyber-form-title anim-slide">Login</h2>

          {/* Portal Switcher Tabs */}
          <div className="cyber-portal-tabs anim-slide" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={portal === 'institution'}
              className={`cyber-portal-tab ${portal === 'institution' ? 'active' : ''}`}
              onClick={() => handlePortalSwitch('institution')}
            >
              <Building2 size={13} />
              <span>Institution Portal</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={portal === 'student'}
              className={`cyber-portal-tab ${portal === 'student' ? 'active' : ''}`}
              onClick={() => handlePortalSwitch('student')}
            >
              <GraduationCap size={13} />
              <span>Student Portal</span>
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="cyber-alert error anim-slide" role="alert">
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} id="loginForm">
            {/* Institution Post / Persona Selector */}
            {portal === 'institution' && (
              <div className="cyber-role-selector-wrap anim-slide">
                <div className="cyber-role-selector-label">
                  <span>Institutional Post / Persona:</span>
                  <span className="cyber-role-current-tag">
                    {INSTITUTION_ROLES.find((r) => r.key === institutionRole)?.tag}
                  </span>
                </div>
                <div className="cyber-role-selector-grid" role="radiogroup" aria-label="Select institutional role">
                  {INSTITUTION_ROLES.map((r) => {
                    const isSelected = institutionRole === r.key;
                    return (
                      <button
                        key={r.key}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        className={`cyber-role-card ${isSelected ? 'active' : ''}`}
                        onClick={() => handleInstitutionRoleSelect(r.key)}
                        title={r.desc}
                      >
                        <span className="cyber-role-card-icon" aria-hidden="true">{r.icon}</span>
                        <span className="cyber-role-card-text">{r.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="cyber-role-desc-banner">
                  <Info size={12} style={{ flexShrink: 0, color: '#38bdf8' }} />
                  <span>{INSTITUTION_ROLES.find((r) => r.key === institutionRole)?.desc}</span>
                </div>
              </div>
            )}

            {/* Username / Email with floating label & icon */}
            <div className="cyber-input-box anim-slide">
              <input
                type="text"
                id="loginUsername"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                required
                autoComplete="username"
                placeholder=" "
              />
              <label htmlFor="loginUsername">Username / Email</label>
              <div className="cyber-input-icon">
                <User size={16} />
              </div>
            </div>

            {/* Password with floating label & icon */}
            <div className="cyber-input-box anim-slide">
              <input
                type={showLoginPassword ? 'text' : 'password'}
                id="loginPassword"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder=" "
              />
              <label htmlFor="loginPassword">Password</label>
              <button
                type="button"
                className="cyber-pw-toggle"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
              >
                {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="cyber-form-row anim-slide">
              <label className="cyber-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="cyber-forgot-link"
                onClick={() => {
                  setForgotSent(false);
                  setForgotEmail(loginIdentifier || '');
                  setShowForgotModal(true);
                }}
              >
                Forgot password?
              </button>
            </div>

            {/* Pill Button: Login */}
            <button
              type="submit"
              className="cyber-btn anim-slide"
              disabled={loading || googleLoading}
              id="btnLoginSubmit"
            >
              <span>{loading ? 'Entering...' : 'Login'}</span>
            </button>

            {/* Google Authentication Button (Only for Student Portal) */}
            {portal === 'student' && (
              <>
                <div className="cyber-divider anim-slide">
                  <span>or continue with</span>
                </div>
                <button
                  type="button"
                  className="cyber-google-btn anim-slide"
                  onClick={handleGoogleSignIn}
                  disabled={loading || googleLoading}
                  id="btnGoogleLogin"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{googleLoading ? 'Connecting to Google...' : 'Sign in with Google'}</span>
                </button>
              </>
            )}

            {/* Switch to Sign Up */}
            <div className="cyber-switch-link anim-slide">
              <span>Don't have an account?</span>
              <button
                type="button"
                className="cyber-switch-btn"
                onClick={handleGoToRegister}
                id="btnSwitchToRegister"
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>

        {/* =======================================================
            LOGIN SIDE: WELCOME BACK INFO (RIGHT DIAGONAL PANEL)
            ======================================================= */}
        <div className="cyber-info-box login">
          <h2 className="anim-slide">
            WELCOME<br />BACK!
          </h2>
        </div>

        {/* =======================================================
            REGISTER SIDE: WELCOME INFO (LEFT DIAGONAL PANEL)
            ======================================================= */}
        <div className="cyber-info-box register">
          <h2 className="anim-slide">WELCOME!</h2>
        </div>

        {/* =======================================================
            REGISTER SIDE: FORM BOX (RIGHT)
            ======================================================= */}
        <div className="cyber-form-box register">
          <h2 className="cyber-form-title anim-slide">Register</h2>

          {/* Portal Switcher Tabs */}
          <div className="cyber-portal-tabs anim-slide" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={portal === 'institution'}
              className={`cyber-portal-tab ${portal === 'institution' ? 'active' : ''}`}
              onClick={() => handlePortalSwitch('institution')}
            >
              <Building2 size={13} />
              <span>Institution Portal</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={portal === 'student'}
              className={`cyber-portal-tab ${portal === 'student' ? 'active' : ''}`}
              onClick={() => handlePortalSwitch('student')}
            >
              <GraduationCap size={13} />
              <span>Student Portal</span>
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="cyber-alert error anim-slide" role="alert">
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="cyber-alert success anim-slide" role="status">
              <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} id="registerForm">
            {/* Institution Post / Persona Selector for Registration */}
            {portal === 'institution' && (
              <div className="cyber-role-selector-wrap anim-slide">
                <div className="cyber-role-selector-label">
                  <span>Assign Institutional Post:</span>
                  <span className="cyber-role-current-tag">
                    {INSTITUTION_ROLES.find((r) => r.key === institutionRole)?.tag}
                  </span>
                </div>
                <div className="cyber-role-selector-grid" role="radiogroup" aria-label="Select institutional role for registration">
                  {INSTITUTION_ROLES.map((r) => {
                    const isSelected = institutionRole === r.key;
                    return (
                      <button
                        key={r.key}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        className={`cyber-role-card ${isSelected ? 'active' : ''}`}
                        onClick={() => setInstitutionRole(r.key)}
                        title={r.desc}
                      >
                        <span className="cyber-role-card-icon" aria-hidden="true">{r.icon}</span>
                        <span className="cyber-role-card-text">{r.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="cyber-role-desc-banner">
                  <Info size={12} style={{ flexShrink: 0, color: '#38bdf8' }} />
                  <span>{INSTITUTION_ROLES.find((r) => r.key === institutionRole)?.desc}</span>
                </div>
              </div>
            )}
            {/* Username */}
            <div className="cyber-input-box anim-slide">
              <input
                type="text"
                id="regUsername"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder=" "
              />
              <label htmlFor="regUsername">Username</label>
              <div className="cyber-input-icon">
                <User size={16} />
              </div>
            </div>

            {/* Email */}
            <div className="cyber-input-box anim-slide">
              <input
                type="email"
                id="regEmail"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder=" "
              />
              <label htmlFor="regEmail">Email</label>
              <div className="cyber-input-icon">
                <Mail size={16} />
              </div>
            </div>

            {/* Password */}
            <div className="cyber-input-box anim-slide">
              <input
                type={showRegPassword ? 'text' : 'password'}
                id="regPassword"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder=" "
              />
              <label htmlFor="regPassword">Password</label>
              <button
                type="button"
                className="cyber-pw-toggle"
                onClick={() => setShowRegPassword(!showRegPassword)}
                aria-label={showRegPassword ? 'Hide password' : 'Show password'}
              >
                {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="cyber-input-box anim-slide">
              <input
                type={showRegPassword ? 'text' : 'password'}
                id="regConfirmPassword"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder=" "
              />
              <label htmlFor="regConfirmPassword">Confirm Password</label>
              <div className="cyber-input-icon">
                <ShieldCheck size={16} />
              </div>
            </div>

            {/* Pill Button: Register */}
            <button
              type="submit"
              className="cyber-btn anim-slide"
              disabled={loading || googleLoading}
              id="btnRegisterSubmit"
            >
              <span>{loading ? 'Registering...' : 'Register'}</span>
            </button>

            {/* Google Authentication Button (Only for Student Portal) */}
            {portal === 'student' && (
              <>
                <div className="cyber-divider anim-slide">
                  <span>or continue with</span>
                </div>
                <button
                  type="button"
                  className="cyber-google-btn anim-slide"
                  onClick={handleGoogleSignIn}
                  disabled={loading || googleLoading}
                  id="btnGoogleRegister"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{googleLoading ? 'Connecting to Google...' : 'Sign up with Google'}</span>
                </button>
              </>
            )}

            {/* Switch to Sign In */}
            <div className="cyber-switch-link anim-slide">
              <span>Already have an account?</span>
              <button
                type="button"
                className="cyber-switch-btn"
                onClick={handleGoToLogin}
                id="btnSwitchToLogin"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* =========================================================================
          HELP MODAL DIALOG
          ========================================================================= */}
      {showHelpModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 12, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
          onClick={() => setShowHelpModal(false)}
        >
          <div
            style={{
              background: '#0d1527',
              border: '2px solid #00a2ff',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 0 25px rgba(0, 162, 255, 0.5)',
              color: '#ffffff',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#00d4ff' }}>Authentication Guide</h3>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '12px' }}>
              Welcome to <strong>PRATIBHA Student Success Intelligence Platform</strong>.
            </p>
            <div style={{ background: 'rgba(0, 162, 255, 0.08)', border: '1px solid rgba(0, 162, 255, 0.25)', borderRadius: '8px', padding: '12px', fontSize: '0.8rem', lineHeight: 1.5, color: '#e2e8f0', marginBottom: '16px' }}>
              <div><strong>1-Click Demo Personas:</strong></div>
              <div>• <strong>Admin (Provost):</strong> Institutional overview, radar & simulations.</div>
              <div>• <strong>Faculty:</strong> Cohort risk & student directory.</div>
              <div>• <strong>Placement Officer:</strong> Placement readiness radar & mock bootcamp.</div>
              <div>• <strong>Student:</strong> Personalized 360° portal.</div>
            </div>
            <button
              type="button"
              className="cyber-btn"
              onClick={() => setShowHelpModal(false)}
              style={{ width: '100%', height: '38px', margin: 0 }}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          FORGOT PASSWORD MODAL
          ========================================================================= */}
      {showForgotModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 12, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
          onClick={() => setShowForgotModal(false)}
        >
          <div
            style={{
              background: '#0d1527',
              border: '2px solid #00a2ff',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 0 25px rgba(0, 162, 255, 0.5)',
              color: '#ffffff',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#00d4ff' }}>Password Recovery</h3>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            {forgotSent ? (
              <div>
                <p style={{ fontSize: '0.85rem', color: '#5eead4', lineHeight: 1.5, marginBottom: '16px' }}>
                  Reset instructions dispatched to <strong>{forgotEmail}</strong>. In demo mode, you can sign in directly using any 1-click persona.
                </p>
                <button
                  type="button"
                  className="cyber-btn"
                  onClick={() => setShowForgotModal(false)}
                  style={{ width: '100%', height: '38px', margin: 0 }}
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setForgotSent(true);
                }}
              >
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '12px' }}>
                  Enter your email address to receive password reset instructions.
                </p>
                <div className="cyber-input-box" style={{ marginBottom: '16px' }}>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    placeholder=" "
                  />
                  <label>Email Address</label>
                  <div className="cyber-input-icon">
                    <Mail size={16} />
                  </div>
                </div>
                <button
                  type="submit"
                  className="cyber-btn"
                  style={{ width: '100%', height: '38px', margin: 0 }}
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          FIREBASE GOOGLE AUTHENTICATION MODAL
          ========================================================================= */}
      {showFirebaseModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 12, 0.82)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 110,
            padding: '20px',
          }}
          onClick={() => setShowFirebaseModal(false)}
        >
          <div
            style={{
              background: '#0a1324',
              border: '2px solid #00a2ff',
              borderRadius: '14px',
              padding: '24px 26px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 0 35px rgba(0, 162, 255, 0.55)',
              color: '#ffffff',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#00d4ff', fontWeight: 700 }}>
                  Google Sign-In with Firebase
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFirebaseModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Portal Context Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#93c5fd', marginBottom: '14px', background: 'rgba(0, 162, 255, 0.08)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(0, 162, 255, 0.2)' }}>
              <span>Target:</span>
              <strong style={{ color: '#ffffff', textTransform: 'capitalize' }}>
                {portal === 'student' ? '🎓 Student Portal' : '🏛️ Institution Portal'}
              </strong>
            </div>

            {/* Mode Switch Tabs */}
            <div style={{ display: 'flex', background: 'rgba(13, 21, 39, 0.75)', border: '1px solid rgba(0, 162, 255, 0.35)', borderRadius: '24px', padding: '3px', gap: '4px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setFbMode('direct')}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: fbMode === 'direct' ? 'linear-gradient(90deg, #0c3a6b, #0088cc)' : 'transparent',
                  color: fbMode === 'direct' ? '#ffffff' : '#94a3b8',
                  boxShadow: fbMode === 'direct' ? '0 0 10px rgba(0, 162, 255, 0.5)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                Personal Gmail Login
              </button>
              <button
                type="button"
                onClick={() => setFbMode('config')}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: fbMode === 'config' ? 'linear-gradient(90deg, #0c3a6b, #0088cc)' : 'transparent',
                  color: fbMode === 'config' ? '#ffffff' : '#94a3b8',
                  boxShadow: fbMode === 'config' ? '0 0 10px rgba(0, 162, 255, 0.5)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                Firebase Web App Keys
              </button>
            </div>

            {/* TAB 1: Direct Personal Gmail Login */}
            {fbMode === 'direct' ? (
              <form onSubmit={handlePersonalGmailLogin}>
                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '12px' }}>
                  Apna personal Gmail address enter karein taaki aap apne Gmail account se direct PRATIBHA platform par log in kar sakein:
                </p>

                <div className="cyber-input-box" style={{ marginBottom: '12px' }}>
                  <input
                    type="email"
                    id="personalGmailInput"
                    value={personalGmail}
                    onChange={(e) => setPersonalGmail(e.target.value)}
                    required
                    placeholder=" "
                    autoFocus
                  />
                  <label htmlFor="personalGmailInput">Personal Gmail Address (e.g. name@gmail.com)</label>
                  <div className="cyber-input-icon">
                    <Mail size={16} />
                  </div>
                </div>

                <div className="cyber-input-box" style={{ marginBottom: '18px' }}>
                  <input
                    type="text"
                    id="personalNameInput"
                    value={personalName}
                    onChange={(e) => setPersonalName(e.target.value)}
                    placeholder=" "
                  />
                  <label htmlFor="personalNameInput">Your Display Name (Optional)</label>
                  <div className="cyber-input-icon">
                    <User size={16} />
                  </div>
                </div>

                <button
                  type="submit"
                  className="cyber-btn"
                  disabled={googleLoading}
                  style={{ width: '100%', height: '40px', margin: 0 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{googleLoading ? 'Logging In...' : 'Log In with this Gmail'}</span>
                </button>
              </form>
            ) : (
              /* TAB 2: Connect Custom Firebase Web App Keys */
              <form onSubmit={handleSaveFirebaseConfig}>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '10px' }}>
                  Firebase Console (<strong>Authentication &gt; Sign-in method &gt; Google</strong>) ke Web App credentials enter karein:
                </p>

                <div className="cyber-input-box" style={{ marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={fbApiKey}
                    onChange={(e) => setFbApiKey(e.target.value)}
                    required
                    placeholder=" "
                  />
                  <label>Firebase API Key</label>
                </div>

                <div className="cyber-input-box" style={{ marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={fbAuthDomain}
                    onChange={(e) => setFbAuthDomain(e.target.value)}
                    required
                    placeholder=" "
                  />
                  <label>Auth Domain (e.g. project-id.firebaseapp.com)</label>
                </div>

                <div className="cyber-input-box" style={{ marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={fbProjectId}
                    onChange={(e) => setFbProjectId(e.target.value)}
                    placeholder=" "
                  />
                  <label>Project ID (Optional)</label>
                </div>

                <div className="cyber-input-box" style={{ marginBottom: '16px' }}>
                  <input
                    type="text"
                    value={fbAppId}
                    onChange={(e) => setFbAppId(e.target.value)}
                    placeholder=" "
                  />
                  <label>App ID (Optional)</label>
                </div>

                <button
                  type="submit"
                  className="cyber-btn"
                  disabled={googleLoading}
                  style={{ width: '100%', height: '40px', margin: 0 }}
                >
                  <span>Save &amp; Open Google Popup</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
