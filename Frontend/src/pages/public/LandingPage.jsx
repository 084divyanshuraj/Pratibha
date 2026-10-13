import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Cpu,
  Database,
  CheckCircle2,
  Sparkles,
  Users,
  Award,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';
import DomainConstellation from '../../components/landing/DomainConstellation';

export default function LandingPage() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/about' || window.location.hash.includes('about')) {
      const el = document.getElementById('about');
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      }
    }
  }, [location]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#251D23' }}>
      {/* Top Navigation */}
      <PublicNavbar />

      {/* =========================================================================
          HERO SECTION — Softened Obsidian & Warm Bronze (Royal Academic Theme)
          ========================================================================= */}
      <section
        style={{
          position: 'relative',
          minHeight: '85vh',
          display: 'flex',
          alignItems: 'center',
          backgroundImage: `linear-gradient(to right, rgba(37, 29, 35, 0.94) 32%, rgba(37, 29, 35, 0.72) 65%, rgba(37, 29, 35, 0.90) 100%), url('/assets/images/campus_crimson_hero.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
          backgroundRepeat: 'no-repeat',
          padding: '4.5rem 1.5rem',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(217, 119, 6, 0.22)',
        }}
      >
        <div
          style={{
            maxWidth: '1320px',
            margin: '0 auto',
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1.05fr 1.15fr',
            gap: '3rem',
            alignItems: 'center',
            position: 'relative',
            zIndex: 2,
          }}
          className="hero-grid"
        >
          {/* Left Column: Hero Copy & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            {/* Context Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 14px',
                borderRadius: '999px',
                backgroundColor: 'rgba(217, 119, 6, 0.18)',
                border: '1px solid rgba(245, 158, 11, 0.45)',
                color: '#FDE68A',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                marginBottom: '1.25rem',
                textTransform: 'uppercase',
              }}
            >
              <Sparkles size={14} color="#F59E0B" />
              <span>Student Success Intelligence · KPMG Challenge 4</span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(2.5rem, 4.8vw, 3.85rem)',
                fontWeight: 800,
                lineHeight: 1.12,
                letterSpacing: '-0.03em',
                color: '#FFFFFF',
                marginBottom: '1.25rem',
              }}
            >
              Spot Academic Risk Early. <br />
              <span
                style={{
                  background: 'linear-gradient(90deg, #FDE68A 0%, #F59E0B 45%, #FDA4AF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Guide Every Student Forward.
              </span>
            </h1>

            {/* Supporting Text */}
            <p
              style={{
                fontSize: 'clamp(0.95rem, 1.15vw, 1.05rem)',
                lineHeight: 1.65,
                color: 'rgba(255, 255, 255, 0.85)',
                maxWidth: '520px',
                marginBottom: '1.75rem',
                fontWeight: 400,
              }}
            >
              Connect fragmented attendance logs, LMS engagement, and exam grades into a transparent readiness rating. Helping faculty mentors intervene with personalized support before students fall behind.
            </p>

            {/* Human-Crafted Value Signals */}
            <div
              style={{
                display: 'flex',
                gap: '1.75rem',
                marginBottom: '2.25rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(217, 119, 6, 0.20)',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F59E0B', letterSpacing: '-0.02em' }}>7 Domains</div>
                <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.70)', marginTop: '2px' }}>Unified in Real-Time</div>
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10B981', letterSpacing: '-0.02em' }}>Decoupled ML</div>
                <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.70)', marginTop: '2px' }}>Independent Risk Radars</div>
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FDA4AF', letterSpacing: '-0.02em' }}>Explainable</div>
                <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.70)', marginTop: '2px' }}>Clear Contributing Drivers</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: '#9F1239',
                  color: '#FFFFFF',
                  padding: '0.85rem 1.85rem',
                  borderRadius: '8px',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  textDecoration: 'none',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  boxShadow: '0 4px 18px rgba(159, 18, 57, 0.55)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#881337';
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(245, 158, 11, 0.45)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#9F1239';
                  e.currentTarget.style.boxShadow = '0 4px 18px rgba(159, 18, 57, 0.55)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>Explore the Platform</span>
                <ArrowRight size={17} />
              </Link>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('impact');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'rgba(255, 255, 255, 0.92)',
                  fontSize: '0.92rem',
                  fontWeight: 500,
                  borderBottom: '1px solid #F59E0B',
                  paddingBottom: '2px',
                  paddingLeft: 0,
                  paddingRight: 0,
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#F59E0B')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.92)')}
              >
                <span>Campus & Student Impact</span>
                <ArrowRight size={15} style={{ color: '#F59E0B' }} />
              </button>
            </div>
          </div>

          {/* Right Column: 7-Domain Constellation */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: '440px',
            }}
          >
            <DomainConstellation />
          </div>
        </div>
      </section>

      {/* =========================================================================
          REAL CAMPUS & STUDENT IMPACT GALLERY (REAL HIGH-RESOLUTION PHOTOGRAPHY)
          Demonstrating authentic student collaboration, faculty mentorship, and placement
          ========================================================================= */}
      <section
        id="impact"
        style={{
          padding: '5.5rem 1.5rem',
          backgroundColor: '#2A2027',
          borderBottom: '1px solid rgba(217, 119, 6, 0.20)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 3.75rem' }}>
            <span
              style={{
                fontSize: '0.78rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#F59E0B',
                fontWeight: 700,
              }}
            >
              AUTHENTIC CAMPUS INTELLIGENCE · PROVEN STUDENT RESULTS
            </span>
            <h2
              style={{
                fontSize: 'clamp(2rem, 3.2vw, 2.75rem)',
                fontWeight: 800,
                marginTop: '0.6rem',
                marginBottom: '1rem',
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
              }}
            >
              Real Students. Verified Intelligence. Tangible Impact.
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.82)', fontSize: '1.05rem', lineHeight: 1.65 }}>
              From hands-on software labs to dedicated faculty mentorship and career placement milestones, PRATIBHA unifies fragmented departmental records into clear, human guidance.
            </p>
          </div>

          {/* 3-Column Real Photo Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
              gap: '2.25rem',
            }}
          >
            {/* Photo Card 1: Coding & Data Science Lab */}
            <div
              style={{
                backgroundColor: 'rgba(48, 36, 45, 0.95)',
                borderRadius: '16px',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                overflow: 'hidden',
                boxShadow: '0 16px 36px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.25s ease, border-color 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.25)';
              }}
            >
              <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
                <img
                  src="/assets/images/students_lab_collaboration.jpg"
                  alt="Indian engineering students collaborating in computer science lab"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(35, 27, 33, 0.88)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(245, 158, 11, 0.45)',
                    color: '#FDE68A',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                  }}
                >
                  💻 Collaborative Tech Lab
                </span>
              </div>
              <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 8px 0' }}>
                  Laboratory Telemetry & Code Velocity
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.74)', fontSize: '0.90rem', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
                  Real-time telemetry captures problem-solving cadence, Git commits, and biometric lab attendance, detecting learning obstacles weeks before semester registers close.
                </p>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.80rem', color: '#10B981', fontWeight: 600 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                  <span>Verified 8-Pillar Biometric & LMS Sync</span>
                </div>
              </div>
            </div>

            {/* Photo Card 2: Faculty Mentorship */}
            <div
              style={{
                backgroundColor: 'rgba(48, 36, 45, 0.95)',
                borderRadius: '16px',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                overflow: 'hidden',
                boxShadow: '0 16px 36px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.25s ease, border-color 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.25)';
              }}
            >
              <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
                <img
                  src="/assets/images/faculty_mentorship.jpg"
                  alt="Faculty professor advisor mentoring attentive college student"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(35, 27, 33, 0.88)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(245, 158, 11, 0.45)',
                    color: '#FDE68A',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                  }}
                >
                  🤝 Dedicated Faculty Advisory
                </span>
              </div>
              <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 8px 0' }}>
                  Human-in-the-Loop Mentorship
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.74)', fontSize: '0.90rem', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
                  Mentors receive plain-English explanations behind risk warnings, turning cold data into empathetic, actionable 1-on-1 tutoring and remedial clinic sessions.
                </p>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.80rem', color: '#F59E0B', fontWeight: 600 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                  <span>3.2 Weeks Early Warning Window</span>
                </div>
              </div>
            </div>

            {/* Photo Card 3: Placement Convocation */}
            <div
              style={{
                backgroundColor: 'rgba(48, 36, 45, 0.95)',
                borderRadius: '16px',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                overflow: 'hidden',
                boxShadow: '0 16px 36px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.25s ease, border-color 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.25)';
              }}
            >
              <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
                <img
                  src="/assets/images/placement_success.jpg"
                  alt="Student graduate proudly holding degree and corporate placement offer"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(35, 27, 33, 0.88)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(245, 158, 11, 0.45)',
                    color: '#FDE68A',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                  }}
                >
                  🎓 Placement & Convocation
                </span>
              </div>
              <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 8px 0' }}>
                  TPO Corporate Placement Index
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.74)', fontSize: '0.90rem', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
                  Decoupled placement engines benchmark coding aptitude, mock technical interviews, and ATS resume match to secure premier industry offers across tech and core branches.
                </p>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.80rem', color: '#FDA4AF', fontWeight: 600 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FDA4AF' }} />
                  <span>94.2% Tier-1 Qualification Rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          ABOUT SECTION — Comprehensive Institutional Overview
          ========================================================================= */}
      <section
        id="about"
        style={{
          padding: '6rem 1.5rem',
          backgroundColor: '#251D23',
          backgroundImage: 'radial-gradient(ellipse at 50% 12%, rgba(225, 29, 72, 0.08) 0%, rgba(37, 29, 35, 0) 70%)',
          color: '#FFFFFF',
          borderBottom: '1px solid rgba(217, 119, 6, 0.20)',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* Section Header */}
          <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 2.75rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                color: '#F59E0B',
                fontSize: '0.76rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              <Sparkles size={13} />
              <span>KPMG Challenge 4 · Student Success Intelligence</span>
            </div>
            <h2
              style={{
                fontSize: 'clamp(2.1rem, 3.4vw, 2.85rem)',
                fontWeight: 800,
                margin: '0 0 1rem 0',
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}
            >
              About <span style={{ color: '#F59E0B' }}>PRATIBHA</span>
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.82)', fontSize: '1.06rem', lineHeight: 1.68, margin: 0 }}>
              PRATIBHA is an intelligent student success platform that brings together academic performance, attendance, skills, and placement preparation to provide clear, actionable guidance for students, faculty mentors, and college leadership.
            </p>
          </div>

          {/* Institutional Architecture Highlights Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
              gap: '1.25rem',
              marginBottom: '3.5rem',
              padding: '1.25rem',
              borderRadius: '16px',
              backgroundColor: 'rgba(48, 36, 45, 0.65)',
              border: '1px solid rgba(245, 158, 11, 0.22)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0.5rem 0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F59E0B',
                  flexShrink: 0,
                }}
              >
                <Database size={18} />
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>7 Data Domains</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.65)' }}>ERP, LMS, Biometrics, Coding, TPO</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0.5rem 0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10B981',
                  flexShrink: 0,
                }}
              >
                <Cpu size={18} />
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>2 Decoupled Engines</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.65)' }}>Independent Academic vs Placement</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0.5rem 0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FDA4AF',
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={18} />
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>100% Explainable</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.65)' }}>Human-in-the-loop audit factor trees</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0.5rem 0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(251, 191, 36, 0.15)',
                  border: '1px solid rgba(251, 191, 36, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FDE68A',
                  flexShrink: 0,
                }}
              >
                <Award size={18} />
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>0% Default Penalties</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.65)' }}>Missing data is flagged, never zeroed</div>
              </div>
            </div>
          </div>

          {/* Core Mission Cards */}
          <div
            className="landing-about-cards"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: '2rem',
              marginBottom: 0,
            }}
          >
            {/* Card 1: 7-Domain Holistic Diagnostic */}
            <div
              style={{
                backgroundColor: 'rgba(48, 36, 45, 0.92)',
                border: '1px solid rgba(245, 158, 11, 0.30)',
                borderRadius: '18px',
                padding: '2.25rem',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 16px 36px rgba(0, 0, 0, 0.45)',
                transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.65)';
                e.currentTarget.style.boxShadow = '0 24px 48px rgba(0, 0, 0, 0.6), 0 0 25px rgba(245, 158, 11, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.30)';
                e.currentTarget.style.boxShadow = '0 16px 36px rgba(0, 0, 0, 0.45)';
              }}
            >
              {/* Card Header & Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(245, 158, 11, 0.18)',
                    border: '1px solid rgba(245, 158, 11, 0.40)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#F59E0B',
                  }}
                >
                  <Database size={24} />
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#FDE68A',
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.30)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                  }}
                >
                  01 · Data Fusion
                </span>
              </div>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.75rem' }}>
                7-Domain Holistic Diagnostic
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.76)', fontSize: '0.93rem', lineHeight: 1.62, marginBottom: '1.5rem' }}>
                Eliminates information silos between ERP grades, biometric attendance, LMS activity, coding platform benchmarks, and placement cells. Every student is evaluated with full context.
              </p>

              {/* Interactive Telemetry Box */}
              <div
                style={{
                  backgroundColor: 'rgba(35, 27, 33, 0.85)',
                  border: '1px solid rgba(245, 158, 11, 0.20)',
                  borderRadius: '12px',
                  padding: '1.1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#F59E0B', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Unified Intelligence Stack
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {[
                    'Academics (CGPA)',
                    'Biometric Attendance',
                    'LMS Coursework',
                    'DSA / LeetCode',
                    'Placement Tests',
                    'Soft Skills',
                    'Faculty Mentorship',
                  ].map((dom, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(245, 158, 11, 0.10)',
                        border: '1px solid rgba(245, 158, 11, 0.22)',
                        color: 'rgba(255, 255, 255, 0.90)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                      {dom}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bullet Features */}
              <ul style={{ listStyle: 'none', padding: 0, margin: 'auto 0 0', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem', color: 'rgba(255,255,255,0.90)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <CheckCircle2 size={16} style={{ color: '#F59E0B', flexShrink: 0 }} />
                  <span>Academics, Attendance & LMS engagement sync</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <CheckCircle2 size={16} style={{ color: '#F59E0B', flexShrink: 0 }} />
                  <span>Placement tests, Technical skills & Peer feedback</span>
                </li>
              </ul>
            </div>

            {/* Card 2: Decoupled Risk Engines */}
            <div
              style={{
                backgroundColor: 'rgba(48, 36, 45, 0.92)',
                border: '1px solid rgba(16, 185, 129, 0.30)',
                borderRadius: '18px',
                padding: '2.25rem',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 16px 36px rgba(0, 0, 0, 0.45)',
                transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.65)';
                e.currentTarget.style.boxShadow = '0 24px 48px rgba(0, 0, 0, 0.6), 0 0 25px rgba(16, 185, 129, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.30)';
                e.currentTarget.style.boxShadow = '0 16px 36px rgba(0, 0, 0, 0.45)';
              }}
            >
              {/* Card Header & Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(16, 185, 129, 0.18)',
                    border: '1px solid rgba(16, 185, 129, 0.40)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10B981',
                  }}
                >
                  <Cpu size={24} />
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#6EE7B7',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.30)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                  }}
                >
                  02 · Dual Engine
                </span>
              </div>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.75rem' }}>
                Decoupled Risk Engines
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.76)', fontSize: '0.93rem', lineHeight: 1.62, marginBottom: '1.5rem' }}>
                Academic Risk and Placement Risk require distinct institutional actions. PRATIBHA analyzes them independently to ensure accurate, targeted faculty mentorship and placement bootcamps.
              </p>

              {/* Interactive Telemetry Box */}
              <div
                style={{
                  backgroundColor: 'rgba(35, 27, 33, 0.85)',
                  border: '1px solid rgba(16, 185, 129, 0.20)',
                  borderRadius: '12px',
                  padding: '1.1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#10B981', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Independent Diagnostic Pipelines
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.10)', padding: '8px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#34D399' }}>Academic Risk</div>
                    <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.70)', marginTop: '2px' }}>CGPA, attendance, labs → Faculty Advising</div>
                  </div>
                  <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.10)', padding: '8px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#F59E0B' }}>Placement Risk</div>
                    <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.70)', marginTop: '2px' }}>DSA, interviews, ATS → TPO Bootcamps</div>
                  </div>
                </div>
              </div>

              {/* Bullet Features */}
              <ul style={{ listStyle: 'none', padding: 0, margin: 'auto 0 0', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem', color: 'rgba(255,255,255,0.90)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <CheckCircle2 size={16} style={{ color: '#10B981', flexShrink: 0 }} />
                  <span>Curriculum & attendance early warnings</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <CheckCircle2 size={16} style={{ color: '#10B981', flexShrink: 0 }} />
                  <span>Aptitude, DSA & interview readiness benchmarks</span>
                </li>
              </ul>
            </div>

            {/* Card 3: Ethical & Explainable AI */}
            <div
              style={{
                backgroundColor: 'rgba(48, 36, 45, 0.92)',
                border: '1px solid rgba(244, 63, 94, 0.30)',
                borderRadius: '18px',
                padding: '2.25rem',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 16px 36px rgba(0, 0, 0, 0.45)',
                transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.65)';
                e.currentTarget.style.boxShadow = '0 24px 48px rgba(0, 0, 0, 0.6), 0 0 25px rgba(244, 63, 94, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.30)';
                e.currentTarget.style.boxShadow = '0 16px 36px rgba(0, 0, 0, 0.45)';
              }}
            >
              {/* Card Header & Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(244, 63, 94, 0.18)',
                    border: '1px solid rgba(244, 63, 94, 0.40)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FDA4AF',
                  }}
                >
                  <ShieldCheck size={24} />
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#FDA4AF',
                    backgroundColor: 'rgba(244, 63, 94, 0.12)',
                    border: '1px solid rgba(244, 63, 94, 0.30)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                  }}
                >
                  03 · Ethical Trust
                </span>
              </div>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.75rem' }}>
                Ethical & Explainable Metrics
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.76)', fontSize: '0.93rem', lineHeight: 1.62, marginBottom: '1.5rem' }}>
                Missing records are never counted as zero or failure. The platform highlights what data is missing, explains contributing factors clearly, and gives an honest picture of student readiness.
              </p>

              {/* Interactive Telemetry Box */}
              <div
                style={{
                  backgroundColor: 'rgba(35, 27, 33, 0.85)',
                  border: '1px solid rgba(244, 63, 94, 0.20)',
                  borderRadius: '12px',
                  padding: '1.1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#FDA4AF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Auditable Factor Attribution
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: 'rgba(255,255,255,0.85)' }}>
                    <span>Non-Zero Missing Invariant</span>
                    <span style={{ color: '#34D399', fontWeight: 700 }}>Strict Guarantee</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: 'rgba(255,255,255,0.85)' }}>
                    <span>Plain English Explanations</span>
                    <span style={{ color: '#FDE68A', fontWeight: 700 }}>Human-in-Loop</span>
                  </div>
                </div>
              </div>

              {/* Bullet Features */}
              <ul style={{ listStyle: 'none', padding: 0, margin: 'auto 0 0', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem', color: 'rgba(255,255,255,0.90)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <CheckCircle2 size={16} style={{ color: '#FDA4AF', flexShrink: 0 }} />
                  <span>Non-zero missing data invariant</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <CheckCircle2 size={16} style={{ color: '#FDA4AF', flexShrink: 0 }} />
                  <span>Human-in-the-loop intervention logging</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Public Footer */}
      <PublicFooter />

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 980px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
        }
        @media (max-width: 640px) {
          .landing-about-cards {
            gap: 1.25rem !important;
          }
          .landing-about-cards > div {
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
