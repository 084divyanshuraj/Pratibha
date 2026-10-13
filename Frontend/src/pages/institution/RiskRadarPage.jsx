import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Shield,
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

  const totalPop = riskData?.totalStudents ?? riskData?.departmentBreakdown?.reduce((acc, d) => acc + (d.total || 0), 0) ?? 0;
  const divCount = riskData?.divCount ?? riskData?.decoupledDivergence?.count ?? 0;
  const divPct = totalPop > 0 ? +((divCount / totalPop) * 100).toFixed(1) : 0;
  const doubleRiskCount = riskData?.doubleRiskCount ?? 0;
  const doubleRiskPct = totalPop > 0 ? +((doubleRiskCount / totalPop) * 100).toFixed(1) : 0;
  const achieversCount = riskData?.achieversCount ?? 0;
  const achieversPct = totalPop > 0 ? +((achieversCount / totalPop) * 100).toFixed(1) : 0;
  const backlogsOnlyCount = riskData?.backlogsOnlyCount ?? 0;
  const backlogsOnlyPct = totalPop > 0 ? +((backlogsOnlyCount / totalPop) * 100).toFixed(1) : 0;

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
                  borderRadius: '4px',
                  backgroundColor: role === 'faculty_mentor' ? '#DCFCE7' : role === 'placement_officer' ? '#DBEAFE' : '#E2E8F0',
                  color: role === 'faculty_mentor' ? '#15803D' : role === 'placement_officer' ? '#1D4ED8' : '#334155',
                }}
              >
                {role === 'faculty_mentor' ? 'Faculty Mentor View' : role === 'placement_officer' ? 'Placement Officer View' : 'Provost & Leadership View'}
              </span>
              <strong style={{ fontSize: '0.96rem', color: '#0F172A' }}>
                {role === 'faculty_mentor' ? 'Academic Standing & Attendance Health' : role === 'placement_officer' ? 'Placement Readiness & Interview Support' : 'Independent Academic & Placement Evaluation'}
              </strong>
            </div>
            <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '3px', maxWidth: '850px' }}>
              {role === 'faculty_mentor'
                ? `${currentUser?.name || 'Prof. Rajesh Kumar'} · Priority focus on CSE mentees with low attendance (<75%) and pending subject backlogs before semester exams.`
                : role === 'placement_officer'
                ? `${currentUser?.name || 'Vikram Malhotra'} · Priority focus on students with strong CGPA (≥ 7.5) who need mock interview and coding preparation for visiting companies.`
                : `${currentUser?.name || (currentUser?.username ? `@${currentUser.username}` : 'Provost & Leadership')} · Dual AI models evaluate classroom theory and placement readiness separately so no student is overlooked.`}
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
                onClick={() => navigate('/institution/students?risk=academic_high')}
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
                High Academic Risk
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
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '6px', backgroundColor: '#EAF3FF', color: '#1677D2', fontSize: '0.74rem', fontWeight: 600, marginBottom: '6px', border: '1px solid #BFDBFE' }}>
          <Target size={13} />
          <span>Independent Dual-Engine Architecture</span>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#082B56', margin: 0, letterSpacing: '-0.3px' }}>
          Decoupled Risk Intelligence Radar
        </h1>
        <p style={{ margin: '3px 0 0', color: '#64748B', fontSize: '0.84rem' }}>
          Academic theory risk and career placement risk computed as independent decoupled ML vectors.
        </p>
      </div>

      {/* 2x2 Risk Quadrant Matrix (Symmetric White Cards with Color Accents) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#082B56' }}>
            Academic vs Placement Risk Matrix
          </h3>
          <span style={{ fontSize: '0.76rem', color: '#64748B' }}>
            Total Population: <strong>{totalPop.toLocaleString()}</strong> Enrolled Students
          </span>
        </div>

        <div className="responsive-quadrant-grid">
          {/* Quadrant 1: Decoupled Divergence (High CGPA + High Placement Risk) */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderLeft: '4px solid #D97706',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
              minHeight: '210px',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Decoupled Divergence Cluster
                </span>
                <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem' }}>
                  Action Needed
                </span>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#082B56', marginTop: '10px' }}>
                {divCount.toLocaleString()} Students <span style={{ fontSize: '0.86rem', fontWeight: 500, color: '#D97706' }}>({divPct}%)</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '6px', lineHeight: '1.45' }}>
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
                transition: 'background-color 150ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#B45309')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#D97706')}
            >
              <span>Inspect Divergent Cohort ({divCount})</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Quadrant 2: Double Risk (High Academic + High Placement Risk) */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderLeft: '4px solid #DC2626',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
              minHeight: '210px',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Comprehensive Double Risk
                </span>
                <span style={{ backgroundColor: '#FEE2E2', color: '#DC2626', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem' }}>
                  Critical Priority
                </span>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#082B56', marginTop: '10px' }}>
                {doubleRiskCount.toLocaleString()} Students <span style={{ fontSize: '0.86rem', fontWeight: 500, color: '#DC2626' }}>({doubleRiskPct}%)</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '6px', lineHeight: '1.45' }}>
                <strong>High Academic Risk + High Placement Risk.</strong> Requires paired remedial subject coaching and student wellness counseling.
              </div>
            </div>

            <button
              onClick={() => navigate('/institution/students?risk=double_risk')}
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
                transition: 'background-color 150ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#B91C1C')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#DC2626')}
            >
              <span>View Double Risk Students ({doubleRiskCount})</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Quadrant 3: Star Performers (Low Risk on Both) */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderLeft: '4px solid #0D9488',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
              minHeight: '210px',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Career & Academic Achievers
                </span>
                <span style={{ backgroundColor: '#CCFBF1', color: '#0F766E', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem' }}>
                  Secure Cohort
                </span>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#082B56', marginTop: '10px' }}>
                {achieversCount.toLocaleString()} Students <span style={{ fontSize: '0.86rem', fontWeight: 500, color: '#0D9488' }}>({achieversPct}%)</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '6px', lineHeight: '1.45' }}>
                <strong>Low Academic Risk + Low Placement Risk.</strong> Candidates for leadership honours, peer mentoring, and corporate fellowship tracks.
              </div>
            </div>

            <button
              onClick={() => navigate('/institution/students?risk=achievers')}
              style={{
                marginTop: '16px',
                alignSelf: 'flex-start',
                backgroundColor: '#0D9488',
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
                transition: 'background-color 150ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0F766E')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0D9488')}
            >
              <span>View Achievers Roster ({achieversCount})</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Quadrant 4: Academic Shortfall Only */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderLeft: '4px solid #1677D2',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
              minHeight: '210px',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#1677D2', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Academic Backlogs Only
                </span>
                <span style={{ backgroundColor: '#EAF3FF', color: '#1677D2', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem' }}>
                  Theory Remedial
                </span>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#082B56', marginTop: '10px' }}>
                {backlogsOnlyCount.toLocaleString()} Students <span style={{ fontSize: '0.86rem', fontWeight: 500, color: '#1677D2' }}>({backlogsOnlyPct}%)</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '6px', lineHeight: '1.45' }}>
                <strong>High Academic Risk with Good Aptitude.</strong> Students performing well in coding competitions but struggling with formal theory exams.
              </div>
            </div>

            <button
              onClick={() => navigate('/institution/students?risk=academic_only')}
              style={{
                marginTop: '16px',
                alignSelf: 'flex-start',
                backgroundColor: '#1677D2',
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
                transition: 'background-color 150ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1262AF')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1677D2')}
            >
              <span>Inspect Academic Alerts ({backlogsOnlyCount})</span>
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
        <div className="responsive-table-wrapper">
          <table style={{ width: '100%', minWidth: '640px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
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
                { department: 'Computer Science', total: 6, averageSuccessScore: 78.5, academicRisk: { high: 1 }, placementRisk: { high: 0 } },
                { department: 'Information Technology', total: 6, averageSuccessScore: 79.2, academicRisk: { high: 2 }, placementRisk: { high: 2 } },
                { department: 'Data Science', total: 6, averageSuccessScore: 81.1, academicRisk: { high: 2 }, placementRisk: { high: 0 } },
                { department: 'Electronics & Comm.', total: 6, averageSuccessScore: 80.4, academicRisk: { high: 2 }, placementRisk: { high: 2 } },
                { department: 'Mechanical Eng', total: 6, averageSuccessScore: 80.8, academicRisk: { high: 1 }, placementRisk: { high: 1 } },
              ]).map((d, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td 
                    onClick={() => navigate(`/institution/students?dept=${encodeURIComponent(d.department)}`)}
                    style={{ padding: '12px 18px', fontWeight: 600, color: '#0F172A', cursor: 'pointer' }}
                    title={`Filter student directory by ${d.department}`}
                  >
                    {d.department}
                  </td>
                  <td style={{ padding: '12px 16px' }}>{d.total}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1A73E8' }}>{d.averageSuccessScore}</td>
                  <td 
                    onClick={() => navigate(`/institution/students?dept=${encodeURIComponent(d.department)}&risk=academic_high`)}
                    style={{ padding: '12px 16px', color: '#DC2626', fontWeight: 600, cursor: 'pointer' }}
                    title={`View high academic risk students in ${d.department}`}
                  >
                    {d.academicRisk?.high || 0} students
                  </td>
                  <td 
                    onClick={() => navigate(`/institution/students?dept=${encodeURIComponent(d.department)}&risk=placement_high`)}
                    style={{ padding: '12px 16px', color: '#D97706', fontWeight: 600, cursor: 'pointer' }}
                    title={`View high placement risk students in ${d.department}`}
                  >
                    {d.placementRisk?.high || 0} students
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
