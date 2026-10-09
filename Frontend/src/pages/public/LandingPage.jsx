import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { useAuth } from '../../context/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { loginWithDemo } = useAuth();

  const handleLaunchRole = (roleKey) => {
    loginWithDemo(roleKey);
    navigate(roleKey === 'student' ? '/student/dashboard' : '/institution/dashboard');
  };

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
            {/* Eyebrow */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(255, 255, 255, 0.75)',
                marginBottom: '1.25rem',
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>—</span>
              <span>STUDENT SUCCESS INTELLIGENCE</span>
              <span style={{ color: 'var(--color-blue-bright)' }}>·</span>
              <span>BUILT FOR CAMPUS IMPACT</span>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>—</span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2.75rem, 5.5vw, 4.25rem)',
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: '-0.02em',
                color: '#FFFFFF',
                marginBottom: '1.5rem',
              }}
            >
              Every Student <br />
              Has <span style={{ color: 'var(--color-blue-bright)' }}>Potential.</span>
            </h1>

            {/* Supporting Text */}
            <p
              style={{
                fontSize: 'clamp(1rem, 1.25vw, 1.125rem)',
                lineHeight: 1.65,
                color: 'rgba(255, 255, 255, 0.82)',
                maxWidth: '520px',
                marginBottom: '2.5rem',
                fontWeight: 400,
              }}
            >
              Unify academic performance, attendance, learning activity, engagement, skills, feedback and placement readiness into clear insights that help every student move forward.
            </p>

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
                  padding: '0.9rem 1.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
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
                <ArrowRight size={18} />
              </Link>

              <a
                href="#about"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  borderBottom: '1px solid var(--color-blue-bright)',
                  paddingBottom: '2px',
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-blue-bright)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)')}
              >
                <span>About PRATIBHA</span>
                <ArrowRight size={15} style={{ color: 'var(--color-blue-bright)' }} />
              </a>
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
            {/* Architectural Building Inscription Badge */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: '1rem',
                backgroundColor: 'rgba(6, 26, 51, 0.75)',
                border: '1px solid rgba(228, 233, 240, 0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px',
                fontSize: '0.68rem',
                letterSpacing: '0.12em',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.75)',
                textTransform: 'uppercase',
                backdropFilter: 'blur(6px)',
                zIndex: 5,
              }}
            >
              LEARN • GROW • INNOVATE • BELONG
            </div>

            {/* Interactive 7-Domain Constellation */}
            <DomainConstellation />

            {/* Interactive hint */}
            <div
              style={{
                marginTop: '1rem',
                textAlign: 'center',
                fontSize: '0.78rem',
                color: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              Hover over any domain node to explore its indicators and weight contribution
            </div>
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
              PRATIBHA is an explainable intelligence ecosystem engineered to unify fragmented university data into transparent, actionable signals for timely remediation and career readiness.
            </p>
          </div>

          {/* Core Mission Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
              marginBottom: '3.5rem',
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
                Missing records are never treated as zero failure. The platform features dynamic weight redistribution, explicit factor contributions, and full data completeness transparency.
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

          {/* Persona & Portal Quick Access Strip */}
          <div
            style={{
              backgroundColor: 'rgba(8, 43, 86, 0.55)',
              border: '1px solid rgba(0, 162, 255, 0.3)',
              borderRadius: 'var(--radius-lg)',
              padding: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.76rem', color: 'var(--color-blue-bright)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  READY TO EXPLORE
                </span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF', marginTop: '4px' }}>
                  Access Dedicated Portals or Test Demo Personas
                </h3>
              </div>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--color-blue-primary)',
                  color: '#FFFFFF',
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(22, 119, 210, 0.4)',
                }}
              >
                <span>Go to Login / Sign In</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
              }}
            >
              {[
                { title: 'Admin (Provost)', role: 'admin', icon: '🏛️', desc: 'Campus KPI dashboard & department radar' },
                { title: 'Faculty Mentor', role: 'faculty', icon: '👨‍🏫', desc: 'Student directory & intervention logging' },
                { title: 'Placement Officer', role: 'placement', icon: '💼', desc: '2x2 Matrix & placement benchmarks' },
                { title: 'Student (Aarav)', role: 'student', icon: '🎓', desc: 'Personal 360° cockpit & roadmaps' },
              ].map((p) => (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => handleLaunchRole(p.role)}
                  style={{
                    backgroundColor: 'rgba(6, 26, 51, 0.65)',
                    border: '1px solid rgba(228, 233, 240, 0.15)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-blue-bright)';
                    e.currentTarget.style.backgroundColor = 'rgba(0, 162, 255, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(228, 233, 240, 0.15)';
                    e.currentTarget.style.backgroundColor = 'rgba(6, 26, 51, 0.65)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.1rem' }}>{p.icon}</span>
                    <strong style={{ fontSize: '0.92rem' }}>{p.title}</strong>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.65)' }}>{p.desc}</span>
                </button>
              ))}
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
