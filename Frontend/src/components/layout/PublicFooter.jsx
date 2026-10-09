import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../common/BrandLogo';
import { Shield, Sparkles, BookOpen, ExternalLink } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-navy-deep)',
        color: 'rgba(255, 255, 255, 0.75)',
        borderTop: '1px solid rgba(228, 233, 240, 0.1)',
        padding: '3.5rem 1.5rem 2rem',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Column 1: Brand & Identity */}
        <div>
          <BrandLogo variant="dark" showTagline={true} />
          <p
            style={{
              marginTop: '1rem',
              fontSize: '0.88rem',
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.65)',
              maxWidth: '340px',
            }}
          >
            From Student Data to Student Success. Unifying academic, attendance, LMS, skills, and placement indicators into explainable intelligence for higher education institutions.
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '1.25rem',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(22, 119, 210, 0.18)',
              border: '1px solid rgba(37, 139, 250, 0.3)',
              fontSize: '0.72rem',
              color: 'var(--color-blue-bright)',
              fontWeight: 500,
            }}
          >
            <Sparkles size={12} />
            <span>KPMG Challenge 4 Independent Prototype</span>
          </div>
        </div>

        {/* Column 2: Platform Capabilities */}
        <div>
          <h4
            style={{
              color: '#FFFFFF',
              fontSize: '0.95rem',
              fontWeight: 600,
              marginBottom: '1rem',
              letterSpacing: '0.02em',
            }}
          >
            7 Data Domains
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.86rem' }}>
            <li>1. Academic Performance & CGPA</li>
            <li>2. Attendance & Subject Consistency</li>
            <li>3. LMS Engagement & Activity</li>
            <li>4. Co-curricular & Event Participation</li>
            <li>5. Placement Readiness & Coding Tests</li>
            <li>6. Technical & Soft Skills Ledger</li>
            <li>7. Institutional & Faculty Feedback</li>
          </ul>
        </div>

        {/* Column 3: Portals & Access */}
        <div>
          <h4
            style={{
              color: '#FFFFFF',
              fontSize: '0.95rem',
              fontWeight: 600,
              marginBottom: '1rem',
              letterSpacing: '0.02em',
            }}
          >
            Access Portals
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.86rem' }}>
            <li>
              <Link to="/login" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none' }}>
                Institution Portal (Admin & Faculty) →
              </Link>
            </li>
            <li>
              <Link to="/login" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none' }}>
                Training & Placement Officer View →
              </Link>
            </li>
            <li>
              <Link to="/login" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none' }}>
                Student Experience Portal →
              </Link>
            </li>
            <li>
              <Link to="/login" style={{ color: 'var(--color-blue-bright)', textDecoration: 'none' }}>
                1-Click Demo Personas Gateway
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Integrity & Compliance */}
        <div>
          <h4
            style={{
              color: '#FFFFFF',
              fontSize: '0.95rem',
              fontWeight: 600,
              marginBottom: '1rem',
              letterSpacing: '0.02em',
            }}
          >
            Responsible AI & Integrity
          </h4>
          <p style={{ fontSize: '0.82rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.6)' }}>
            PRATIBHA computes explainable readiness scores with dynamic compensation for missing data. It does not output black-box predictions or actuarial probabilities.
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '1rem',
              fontSize: '0.78rem',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            <Shield size={14} />
            <span>Fictional synthetic demo records only.</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.78rem',
          color: 'rgba(255, 255, 255, 0.5)',
        }}
      >
        <div>
          © {new Date().getFullYear()} PRATIBHA Platform. All rights reserved. Built for KPMG Challenge 4.
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span>Privacy Notice (Synthetic Data)</span>
          <span>Explainability Framework</span>
          <span>Terms of Demonstration</span>
        </div>
      </div>
    </footer>
  );
}
