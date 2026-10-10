import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Award,
  BookOpen,
  CheckCircle,
  ArrowLeft,
  LogOut,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import BrandLogo from '../../components/common/BrandLogo';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const { currentUser, logout, loginWithDemo } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-page)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Demo Bar */}
      <div
        style={{
          backgroundColor: 'var(--color-navy)',
          color: '#FFFFFF',
          padding: '8px 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.82rem',
          borderBottom: '1px solid rgba(228, 233, 240, 0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--color-status-success)', fontWeight: 600 }}>
            STUDENT PORTAL DEMO
          </span>
          <span>Logged in as: <strong>{currentUser?.name || 'Aarav Sharma'}</strong> (Roll ID: STU-2024-042)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => {
              loginWithDemo('admin');
              navigate('/institution/dashboard');
            }}
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#FFFFFF',
              borderRadius: '4px',
              padding: '3px 8px',
              cursor: 'pointer',
              fontSize: '0.76rem',
            }}
          >
            Switch to Institution View ↗
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.8)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              fontSize: '0.78rem',
            }}
          >
            <LogOut size={13} />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* Main Student Header */}
      <header
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--color-border)',
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <BrandLogo variant="light" size="small" />
          <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--color-border)' }} />
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-navy)', lineHeight: 1.2 }}>
              My Academic & Career Dashboard
            </h1>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
              Semester 6 • B.Tech Computer Science & Engineering
            </span>
          </div>
        </div>

        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--color-blue-primary)',
            fontSize: '0.88rem',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Landing Page</span>
        </Link>
      </header>

      {/* Student Content */}
      <main style={{ maxWidth: '1280px', width: '100%', margin: '2rem auto', padding: '0 1.5rem', flex: 1 }}>
        {/* Metric Cards Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          {/* Card 1: Success Score */}
          <div className="card" style={{ padding: '1.5rem', borderTop: '4px solid var(--color-blue-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', fontSize: '0.82rem', marginBottom: '8px' }}>
              <span>Personal Success Score</span>
              <Award size={18} style={{ color: 'var(--color-blue-primary)' }} />
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--color-navy)' }}>
              76 <span style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', fontWeight: 400 }}>/ 100</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-status-success)', marginTop: '4px', fontWeight: 600 }}>
              Good Standing • High Readiness
            </div>
          </div>

          {/* Card 2: CGPA */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', fontSize: '0.82rem', marginBottom: '8px' }}>
              <span>Cumulative GPA</span>
              <GraduationCap size={18} style={{ color: 'var(--color-navy)' }} />
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--color-navy)' }}>
              8.42
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              0 Active Backlogs • Top 15%
            </div>
          </div>

          {/* Card 3: Attendance */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', fontSize: '0.82rem', marginBottom: '8px' }}>
              <span>Attendance Consistency</span>
              <CheckCircle size={18} style={{ color: 'var(--color-status-success)' }} />
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--color-status-success)' }}>
              88.5%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Statutory 75% Requirement Met
            </div>
          </div>

          {/* Card 4: Placement Readiness */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', fontSize: '0.82rem', marginBottom: '8px' }}>
              <span>Placement Readiness</span>
              <Sparkles size={18} style={{ color: '#8B5CF6' }} />
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#8B5CF6' }}>
              64%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-status-warning)', marginTop: '4px', fontWeight: 500 }}>
              Prep Needed in Quantitative Aptitude
            </div>
          </div>
        </div>

        {/* Informational Message */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(13, 148, 136, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-status-success)',
              margin: '0 auto 1rem',
            }}
          >
            <CheckCircle size={24} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '0.5rem' }}>
            Student Experience Portal Connected
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '640px', margin: '0 auto 1.5rem', fontSize: '0.92rem', lineHeight: 1.6 }}>
            Explore your academic scores, attendance records, skill development path, and personalized mentor recommendations.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/"
              style={{
                backgroundColor: 'var(--color-blue-primary)',
                color: '#FFFFFF',
                padding: '0.65rem 1.25rem',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.88rem',
              }}
            >
              Return to Landing Page
            </Link>
            <Link
              to="/login"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-border)',
                color: 'var(--color-navy)',
                padding: '0.65rem 1.25rem',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.88rem',
              }}
            >
              Switch Demo Persona
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
