import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Cpu,
  Database,
  Target,
  Users2,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Sparkles,
  Layers,
  Award,
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-navy-deep)' }}>
      {/* Top Navigation */}
      <PublicNavbar />

      {/* =========================================================================
          HERO SECTION — Preserved Exactly as Approved (Image 1)
          ========================================================================= */}
      <section
        style={{
          position: 'relative',
          minHeight: '85vh',
          display: 'flex',
          alignItems: 'center',
          backgroundImage: `linear-gradient(to right, rgba(6, 26, 51, 0.94) 30%, rgba(6, 26, 51, 0.65) 60%, rgba(6, 26, 51, 0.85) 100%), url('/assets/images/campus_night_hero.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
          backgroundRepeat: 'no-repeat',
          padding: '4rem 1.5rem',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(228, 233, 240, 0.1)',
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
            {/* Category / Context Pill */}


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
                  background: 'linear-gradient(90deg, #38BDF8 0%, #60A5FA 50%, #93C5FD 100%)',
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
                color: 'rgba(255, 255, 255, 0.82)',
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
                borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38BDF8', letterSpacing: '-0.02em' }}>7 Domains</div>
                <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.65)', marginTop: '2px' }}>Unified in Real-Time</div>
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#4ADE80', letterSpacing: '-0.02em' }}>Decoupled ML</div>
                <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.65)', marginTop: '2px' }}>Independent Risk Radars</div>
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FBBF24', letterSpacing: '-0.02em' }}>Explainable</div>
                <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.65)', marginTop: '2px' }}>Clear Contributing Drivers</div>
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
                  backgroundColor: 'var(--color-blue-primary)',
                  color: '#FFFFFF',
                  padding: '0.85rem 1.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(22, 119, 210, 0.45)',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-blue-bright)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 139, 250, 0.6)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-blue-primary)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(22, 119, 210, 0.45)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>Explore the Platform</span>
                <ArrowRight size={17} />
              </Link>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('about');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.92rem',
                  fontWeight: 500,
                  borderBottom: '1px solid var(--color-blue-bright)',
                  paddingBottom: '2px',
                  paddingLeft: 0,
                  paddingRight: 0,
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-blue-bright)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)')}
              >
                <span>About PRATIBHA</span>
                <ArrowRight size={15} style={{ color: 'var(--color-blue-bright)' }} />
              </button>
            </div>
          </div>

          {/* Right Column: 7-Domain Constellation & Architectural Badge */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: '440px',
            }}
          >
            {/* Interactive 7-Domain Constellation */}
            <DomainConstellation />


          </div>
        </div>

        {/* Responsive CSS */}
        <style>{`
          @media (max-width: 980px) {
            .hero-grid {
              grid-template-columns: 1fr !important;
              gap: 2.5rem !important;
            }
          }
        `}</style>
      </section>

      {/* =========================================================================
          ONLY PAGE 1: ABOUT SECTION
          Comprehensive institutional overview directly beneath the hero
          ========================================================================= */}
      <section
        id="about"
        style={{
          padding: '5.5rem 1.5rem',
          backgroundColor: 'var(--color-navy)',
          color: '#FFFFFF',
          borderBottom: '1px solid rgba(228, 233, 240, 0.1)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3.5rem' }}>
            <span
              style={{
                fontSize: '0.78rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--color-blue-bright)',
                fontWeight: 700,
              }}
            >
              KPMG CHALLENGE 4 · STUDENT SUCCESS INTELLIGENCE
            </span>
            <h2
              style={{
                fontSize: 'clamp(2rem, 3.2vw, 2.75rem)',
                fontWeight: 700,
                marginTop: '0.6rem',
                marginBottom: '1rem',
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
              }}
            >
              About PRATIBHA
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.05rem', lineHeight: 1.65 }}>
              PRATIBHA is an intelligent student success platform that brings together academic performance, attendance, skills, and placement preparation to provide clear, actionable guidance for students, faculty, and college leadership.
            </p>
          </div>

          {/* Core Mission Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
              marginBottom: 0,
            }}
          >
            {/* Card 1: 7-Domain Unification */}
            <div
              style={{
                backgroundColor: 'rgba(6, 26, 51, 0.7)',
                border: '1px solid rgba(228, 233, 240, 0.12)',
                borderRadius: 'var(--radius-lg)',
                padding: '2.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(37, 139, 250, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-blue-bright)',
                }}
              >
                <Database size={22} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF' }}>
                7-Domain Holistic Diagnostic
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.72)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                Eliminates information silos between ERP grades, biometric attendance, LMS activity, coding platform benchmarks, and placement cells. Every student is evaluated with full context.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 'auto 0 0', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem', color: 'rgba(255,255,255,0.85)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--color-blue-bright)' }} />
                  <span>Academics, Attendance & LMS engagement</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--color-blue-bright)' }} />
                  <span>Placement tests, Technical skills & Feedback</span>
                </li>
              </ul>
            </div>

            {/* Card 2: Decoupled Risk Engines */}
            <div
              style={{
                backgroundColor: 'rgba(6, 26, 51, 0.7)',
                border: '1px solid rgba(228, 233, 240, 0.12)',
                borderRadius: 'var(--radius-lg)',
                padding: '2.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10B981',
                }}
              >
                <Cpu size={22} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF' }}>
                Decoupled Risk Engines
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.72)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                Academic Risk and Placement Risk require distinct institutional actions. PRATIBHA analyzes them independently to ensure accurate, targeted faculty mentorship and placement bootcamps.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 'auto 0 0', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem', color: 'rgba(255,255,255,0.85)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} style={{ color: '#10B981' }} />
                  <span>Curriculum & attendance early warnings</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} style={{ color: '#10B981' }} />
                  <span>Aptitude, DSA & interview readiness benchmarks</span>
                </li>
              </ul>
            </div>

            {/* Card 3: Explainable & Ethical AI */}
            <div
              style={{
                backgroundColor: 'rgba(6, 26, 51, 0.7)',
                border: '1px solid rgba(228, 233, 240, 0.12)',
                borderRadius: 'var(--radius-lg)',
                padding: '2.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F59E0B',
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF' }}>
                Ethical & Explainable Metrics
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.72)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                Missing records are never counted as zero or failure. The platform highlights what data is missing, explains contributing factors clearly, and gives an honest picture of student readiness.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 'auto 0 0', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem', color: 'rgba(255,255,255,0.85)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} style={{ color: '#F59E0B' }} />
                  <span>Non-zero missing data invariant</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} style={{ color: '#F59E0B' }} />
                  <span>Human-in-the-loop intervention logging</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          ONLY PAGE 2: PUBLIC FOOTER
          Preserved clean footer directly after the About Section
          ========================================================================= */}
      <PublicFooter />
    </div>
  );
}
