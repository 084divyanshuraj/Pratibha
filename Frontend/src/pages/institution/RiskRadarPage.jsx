import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  AlertTriangle,
  Award,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  GraduationCap,
  Briefcase,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function RiskRadarPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'institution_admin';

  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadRiskData = () => {
    setLoading(true);
    api.getRiskSummary()
      .then((data) => setRiskData(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRiskData();
    const handleUpdate = () => loadRiskData();
    window.addEventListener('pratibha_data_updated', handleUpdate);
    return () => window.removeEventListener('pratibha_data_updated', handleUpdate);
  }, []);

  const totalPop = riskData?.totalStudents || riskData?.departmentBreakdown?.reduce((acc, d) => acc + (d.total || 0), 0) || 1420;
  const divCount = riskData?.decoupledDivergence?.count ?? Math.round(totalPop * 0.104);
  const divPct = riskData?.decoupledDivergence?.percentage ?? +((divCount / totalPop) * 100).toFixed(1);
  const doubleRiskCount = riskData?.doubleRiskCount ?? Math.round(totalPop * 0.058);
  const doubleRiskPct = +((doubleRiskCount / totalPop) * 100).toFixed(1);
  const achieversCount = riskData?.achieversCount ?? Math.round(totalPop * 0.507);
  const achieversPct = +((achieversCount / totalPop) * 100).toFixed(1);
  const backlogsOnlyCount = Math.max(0, totalPop - divCount - doubleRiskCount - achieversCount);
  const backlogsOnlyPct = +((backlogsOnlyCount / totalPop) * 100).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 1. PERSONA FOCUS BANNER */}
      <div
        style={{
          backgroundColor: role === 'faculty_mentor' ? '#F0FDF4' : role === 'placement_officer' ? '#EFF6FF' : '#F8FAFC',
          border: `1px solid ${role === 'faculty_mentor' ? '#BBF7D0' : role === 'placement_officer' ? '#BFDBFE' : '#E2E8F0'}`,
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              backgroundColor: role === 'faculty_mentor' ? '#16A34A' : role === 'placement_officer' ? '#2563EB' : '#0F172A',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {role === 'faculty_mentor' ? <GraduationCap size={24} /> : role === 'placement_officer' ? <Briefcase size={24} /> : <Shield size={24} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  backgroundColor: role === 'faculty_mentor' ? '#DCFCE7' : role === 'placement_officer' ? '#DBEAFE' : '#E2E8F0',
                  color: role === 'faculty_mentor' ? '#15803D' : role === 'placement_officer' ? '#1D4ED8' : '#334155',
                }}
              >
                {role === 'faculty_mentor' ? 'Faculty Mentorship Lens' : role === 'placement_officer' ? 'Corporate Placement Lens' : 'Dean & Provost Governance'}
              </span>
              <strong style={{ fontSize: '0.96rem', color: '#0F172A' }}>
                {role === 'faculty_mentor' ? 'Academic Risk & Statutory Mentee Health' : role === 'placement_officer' ? 'Decoupled Divergence & Drive Readiness' : 'Dual-Engine Decoupled Architecture'}
              </strong>
            </div>
            <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '3px', maxWidth: '850px' }}>
              {role === 'faculty_mentor'
                ? 'Prof. Rajesh Kumar · Priority focus on CSE mentees with Statutory Attendance (<75%) and subject backlogs before semester evaluation.'
                : role === 'placement_officer'
                ? 'Vikram Malhotra · Priority focus on 148 Decoupled Divergent students (High CGPA ≥ 7.5) with mock interview & technical coding deficits.'
                : 'Dr. Sunita Rao · Dual ML models decouple academic theory performance from placement readiness to avoid misclassification.'}
            </div>
          </div>
        </div>

        {/* Quick Role Actions */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {role === 'faculty_mentor' ? (
            <>
              <button
                onClick={() => navigate('/institution/students?dept=Computer+Science')}
                style={{
                  padding: '7px 14px',
                  backgroundColor: '#16A34A',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                My CSE Mentees (28)
              </button>
              <button
                onClick={() => navigate('/institution/sandbox')}
                style={{
                  padding: '7px 14px',
                  backgroundColor: '#FFFFFF',
                  color: '#15803D',
                  borderRadius: '6px',
                  border: '1px solid #BBF7D0',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Remedial Sandbox
              </button>
            </>
          ) : role === 'placement_officer' ? (
            <>
              <button
                onClick={() => navigate('/institution/students?risk=divergent')}
                style={{
                  padding: '7px 14px',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Divergent Cohort (148)
              </button>
              <button
                onClick={() => navigate('/institution/students?personaChip=tier1_eligible')}
                style={{
                  padding: '7px 14px',
                  backgroundColor: '#FFFFFF',
                  color: '#1D4ED8',
                  borderRadius: '6px',
                  border: '1px solid #BFDBFE',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Tier-1 Corporate Ready
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/institution/students')}
                style={{
                  padding: '7px 14px',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Full Student 360°
              </button>
              <button
                onClick={() => navigate('/institution/ingestion')}
                style={{
                  padding: '7px 14px',
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Data Studio
              </button>
            </>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '999px', backgroundColor: '#EEF2FF', color: '#6366F1', fontSize: '0.74rem', fontWeight: 600, marginBottom: '6px' }}>
          <Target size={13} />
          <span>Independent Dual-Engine Architecture</span>
        </div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
          Decoupled Risk Intelligence Radar
        </h1>
        <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.86rem' }}>
          Academic performance and corporate placement readiness are distinct dimensions governed by decoupled ML models.
        </p>
      </div>

      {/* 2x2 Risk Quadrant Matrix */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
            Academic vs Placement Risk Matrix
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
            Total Population: <strong>{totalPop.toLocaleString()}</strong> Enrolled Students
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
          {/* Quadrant 1: Decoupled Divergence (High CGPA + High Placement Risk) */}
          <div
            style={{
              backgroundColor: '#FFFBEB',
              border: '2px solid #F59E0B',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 4px rgba(245, 158, 11, 0.08)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Decoupled Divergence Cluster
                </span>
                <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', fontSize: '0.74rem' }}>
                  Action Needed
                </span>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#92400E', marginTop: '10px' }}>
                {divCount.toLocaleString()} Students <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>({divPct}%)</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#78350F', marginTop: '6px', lineHeight: '1.45' }}>
                <strong>CGPA ≥ 7.5 but High Placement Risk.</strong> Students with strong academic records experiencing aptitude, communication, or mock interview hurdles.
              </div>
            </div>

            <button
              onClick={() => navigate('/institution/students?risk=divergent')}
              style={{
                marginTop: '16px',
                alignSelf: 'flex-start',
                backgroundColor: '#D97706',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Inspect Divergent Cohort (148)</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Quadrant 2: Double Risk (High Academic + High Placement Risk) */}
          <div
            style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase' }}>
                  Comprehensive Double Risk
                </span>
                <span style={{ backgroundColor: '#FEE2E2', color: '#DC2626', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', fontSize: '0.74rem' }}>
                  Critical Priority
                </span>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#991B1B', marginTop: '10px' }}>
                {doubleRiskCount.toLocaleString()} Students <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>({doubleRiskPct}%)</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#7F1D1D', marginTop: '6px', lineHeight: '1.45' }}>
                <strong>High Academic Risk + High Placement Risk.</strong> Requires paired remedial subject coaching and student wellness counseling.
              </div>
            </div>

            <button
              onClick={() => navigate('/institution/sandbox')}
              style={{
                marginTop: '16px',
                alignSelf: 'flex-start',
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Enroll in Remedial Sandbox</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Quadrant 3: Star Performers (Low Risk on Both) */}
          <div
            style={{
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#16A34A', textTransform: 'uppercase' }}>
                  Career & Academic Achievers
                </span>
                <span style={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', fontSize: '0.74rem' }}>
                  Secure
                </span>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#14532D', marginTop: '10px' }}>
                {achieversCount.toLocaleString()} Students <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>({achieversPct}%)</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#166534', marginTop: '6px', lineHeight: '1.45' }}>
                <strong>Low Academic Risk + Low Placement Risk.</strong> Candidates for leadership honours, peer mentoring, and corporate fellowship tracks.
              </div>
            </div>

            <button
              onClick={() => navigate('/institution/students?personaChip=tier1_eligible')}
              style={{
                marginTop: '16px',
                alignSelf: 'flex-start',
                backgroundColor: '#16A34A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>View Tier-1 Ready Roster</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Quadrant 4: Academic Shortfall Only */}
          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Academic Backlogs Only
                </span>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1E293B', marginTop: '10px' }}>
                {backlogsOnlyCount.toLocaleString()} Students <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>({backlogsOnlyPct}%)</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '6px', lineHeight: '1.45' }}>
                <strong>High Academic Risk with Good Aptitude.</strong> Students performing well in coding competitions but struggling with formal theory exams.
              </div>
            </div>

            <button
              onClick={() => navigate('/institution/students?risk=high')}
              style={{
                marginTop: '16px',
                alignSelf: 'flex-start',
                backgroundColor: '#475569',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Review Theory Backlog Mentees</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontWeight: 600, color: '#0F172A', fontSize: '0.92rem' }}>
          Departmental Risk Distribution Overview
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
              <th style={{ padding: '12px 18px' }}>Department</th>
              <th style={{ padding: '12px 16px' }}>Enrolled</th>
              <th style={{ padding: '12px 16px' }}>Avg Success Score</th>
              <th style={{ padding: '12px 16px' }}>High Academic Risk</th>
              <th style={{ padding: '12px 16px' }}>High Placement Risk</th>
            </tr>
          </thead>
          <tbody>
            {(riskData?.departmentBreakdown || [
              { department: 'Computer Science', total: 420, averageSuccessScore: 77.4, academicRisk: { high: 32 }, placementRisk: { high: 88 } },
              { department: 'Information Technology', total: 380, averageSuccessScore: 73.8, academicRisk: { high: 45 }, placementRisk: { high: 72 } },
              { department: 'Data Science', total: 290, averageSuccessScore: 76.1, academicRisk: { high: 28 }, placementRisk: { high: 54 } },
              { department: 'Electronics & Comm.', total: 330, averageSuccessScore: 71.5, academicRisk: { high: 75 }, placementRisk: { high: 76 } },
            ]).map((d, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '12px 18px', fontWeight: 600, color: '#0F172A' }}>{d.department}</td>
                <td style={{ padding: '12px 16px' }}>{d.total}</td>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1A73E8' }}>{d.averageSuccessScore}</td>
                <td style={{ padding: '12px 16px', color: '#DC2626', fontWeight: 600 }}>{d.academicRisk?.high || 0} students</td>
                <td style={{ padding: '12px 16px', color: '#D97706', fontWeight: 600 }}>{d.placementRisk?.high || 0} students</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
