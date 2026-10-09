import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Award,
  AlertTriangle,
  Database,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  CheckCircle,
  FlaskConical,
  Target,
  UploadCloud,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { api } from '../../services/api';
import { IMAGES } from '../../assets/images';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  GraduationCap,
  Shield,
  Sparkles,
  FileText,
} from 'lucide-react';

export default function OverviewPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'institution_admin';

  const [kpis, setKpis] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([api.getOverviewKpis(), api.getTrends()])
      .then(([kpiData, trendData]) => {
        setKpis(kpiData);
        setTrends(trendData?.trend || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const distributionChartData = kpis?.scoreDistribution
    ? [
        { name: 'Critical (<60)', count: kpis.scoreDistribution.critical, fill: '#EF4444' },
        { name: 'Moderate (60-75)', count: kpis.scoreDistribution.moderate, fill: '#F59E0B' },
        { name: 'Good (75-85)', count: kpis.scoreDistribution.good, fill: '#1A73E8' },
        { name: 'Excellent (>85)', count: kpis.scoreDistribution.excellent, fill: '#10B981' },
      ]
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 1. PERSONA-SPECIFIC COMMAND CENTER BANNER */}
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
                {role === 'faculty_mentor' ? 'Faculty Mentor Persona' : role === 'placement_officer' ? 'Placement Officer (TPO)' : 'Institution Administrator'}
              </span>
              <strong style={{ fontSize: '0.96rem', color: '#0F172A' }}>
                {currentUser?.name || (role === 'faculty_mentor' ? 'Prof. Rajesh Kumar' : role === 'placement_officer' ? 'Vikram Malhotra' : 'Dr. Sunita Rao')}
              </strong>
            </div>
            <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '3px' }}>
              {role === 'faculty_mentor'
                ? 'Department of Computer Science & Engineering · Mentoring Cohort Focus: Statutory Attendance (<75%) & Remedial Tutoring.'
                : role === 'placement_officer'
                ? 'Corporate Relations & Placement Cell (TPO) · Focus: Company Eligibility Pipeline, Mock Technical Coding & Recruiter Rosters.'
                : 'Campus Provost & Administration · Focus: Cross-Department Performance, Data Pipeline Integrity & Accreditation Reporting.'}
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
                onClick={() => navigate('/institution/risk-radar')}
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
                Attendance Alerts (14)
              </button>
            </>
          ) : role === 'placement_officer' ? (
            <>
              <button
                onClick={() => navigate('/institution/segments')}
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
                Inspect 2x2 Matrix
              </button>
              <button
                onClick={() => navigate('/institution/students?risk=divergent')}
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
                Mock Interview Priority (148)
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/institution/ingestion')}
                style={{
                  padding: '7px 14px',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <UploadCloud size={14} />
                <span>Batch Data Studio</span>
              </button>
              <button
                onClick={() => navigate('/institution/audit')}
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
                <span>Audit Trail</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. PAGE TITLE & ACTIONS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
            {role === 'faculty_mentor'
              ? 'Faculty Mentorship & Academic Command Center'
              : role === 'placement_officer'
              ? 'Corporate Relations & Placement Command Center'
              : 'Executive Campus Intelligence Overview'}
          </h1>
          <p style={{ margin: '6px 0 0', color: '#64748B', fontSize: '0.88rem' }}>
            {role === 'faculty_mentor'
              ? 'Academic retention monitoring, attendance deficit detection, and remedial mentoring workflows.'
              : role === 'placement_officer'
              ? 'Campus recruitment readiness, 2x2 employability segmentation, and company eligibility pipelines.'
              : 'Multi-domain student analytics powered by explainable scoring, decoupled risk predictions, and sandbox interventions.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={loadData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh Analytics</span>
          </button>

          <button
            onClick={() => navigate('/institution/sandbox')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#1A73E8',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#FFFFFF',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <FlaskConical size={15} />
            <span>Open Sandbox Simulator</span>
          </button>
        </div>
      </div>

      {/* 2. EXECUTIVE KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {/* KPI 1: Total Students */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
              Enrolled Students
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#EBF3FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="#1A73E8" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0F172A', marginTop: '10px' }}>
            {kpis?.totalStudents?.toLocaleString() || '1,420'}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Active Across 5 Departments</span>
          </div>
        </div>

        {/* KPI 2: Average Success Score */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
              Average Success Score
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={18} color="#10B981" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0F172A', marginTop: '10px' }}>
            {kpis?.averageSuccessScore || '74.9'}
            <span style={{ fontSize: '1rem', color: '#94A3B8', fontWeight: 400 }}>/100</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
            Formula <strong>sss-v1</strong> (Explainable Readiness)
          </div>
        </div>

        {/* KPI 3: Decoupled Risk Divergence Alert */}
        <div style={{ backgroundColor: '#FFFBEB', padding: '20px', borderRadius: '12px', border: '1px solid #FDE68A', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#B45309', textTransform: 'uppercase' }}>
              Decoupled Divergence Alert
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} color="#D97706" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#92400E', marginTop: '10px' }}>
            {kpis?.decoupledDivergence?.count || '148'}
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#B45309', marginLeft: '6px' }}>
              ({kpis?.decoupledDivergence?.percentage || '10.4'}%)
            </span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#78350F', marginTop: '4px' }}>
            High Academic CGPA but High Placement Risk
          </div>
        </div>

        {/* KPI 4: 7-Category Data Completeness */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
              Data Completeness
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={18} color="#64748B" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0F172A', marginTop: '10px' }}>
            {kpis?.overallCompletenessAverage || '83.1'}%
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
            Across all 7 Institutional Pillars
          </div>
        </div>
      </div>

      {/* 3. CHARTS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* Chart A: Success Score Distribution */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '22px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 600, color: '#0F172A' }}>
                Success Score Cohort Distribution
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#64748B' }}>
                Segmented by explainable Student Success Score bands
              </p>
            </div>
            <span style={{ fontSize: '0.74rem', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '4px 8px', borderRadius: '6px', color: '#64748B' }}>
              N = 1,420
            </span>
          </div>

          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#FFFFFF', border: 'none', fontSize: '0.8rem' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Historical Trends */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '22px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 600, color: '#0F172A' }}>
                Institutional Progress Over Semesters
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#64748B' }}>
                Tracking longitudinal average score vs attendance percentage
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', fontSize: '0.72rem' }}>
              <span style={{ color: '#1A73E8', fontWeight: 600 }}>● Success Score</span>
              <span style={{ color: '#10B981', fontWeight: 600 }}>● Attendance %</span>
            </div>
          </div>

          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#FFFFFF', border: 'none', fontSize: '0.8rem' }}
                />
                <Line type="monotone" dataKey="averageSuccessScore" stroke="#1A73E8" strokeWidth={3} dot={{ r: 4 }} name="Success Score" />
                <Line type="monotone" dataKey="averageAttendance" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} name="Attendance %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. 7-PILLAR DATA COMPLETENESS CARD */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#0F172A' }}>
              Data Health & Completeness Across 7 Categories
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748B' }}>
              Rule: <em>Never Silently Zero Missing Data</em>. Missing observations remain unobserved and weights renormalize dynamically.
            </p>
          </div>
          <button
            onClick={() => navigate('/institution/ingestion')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#1A73E8',
              cursor: 'pointer',
            }}
          >
            <UploadCloud size={14} />
            <span>Import Missing Data</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px' }}>
          {[
            { name: 'Academic', key: 'academic', pct: kpis?.categoryCoverage?.academic || 100 },
            { name: 'Attendance', key: 'attendance', pct: kpis?.categoryCoverage?.attendance || 98.4 },
            { name: 'LMS Activity', key: 'lms', pct: kpis?.categoryCoverage?.lms || 84.2 },
            { name: 'Placement Tests', key: 'placement', pct: kpis?.categoryCoverage?.placement || 76.5 },
            { name: 'Skill Labs', key: 'skills', pct: kpis?.categoryCoverage?.skills || 81.0 },
            { name: 'Engagement', key: 'engagement', pct: kpis?.categoryCoverage?.engagement || 62.4 },
            { name: 'Feedback', key: 'feedback', pct: kpis?.categoryCoverage?.feedback || 78.9 },
          ].map((pillar) => (
            <div key={pillar.key} style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 600, color: '#475569' }}>{pillar.name}</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: '4px 0' }}>
                {pillar.pct}%
              </div>
              <div style={{ width: '100%', height: '5px', backgroundColor: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${pillar.pct}%`, height: '100%', backgroundColor: pillar.pct >= 80 ? '#10B981' : pillar.pct >= 65 ? '#F59E0B' : '#EF4444' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. VISUAL ACTION CARDS WITH REAL PHOTOGRAPHY */}
      <div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>
          Platform Action Hub
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
          {/* Action 1: Sandbox Simulator */}
          <div
            onClick={() => navigate('/institution/sandbox')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 200ms ease',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ height: '140px', overflow: 'hidden', position: 'relative' }}>
              <img
                src={IMAGES.careerPrep}
                alt="Intervention Sandbox"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '4px',
                }}
              >
                KPMG Differentiator
              </span>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 600, color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Intervention Sandbox Simulator</span>
                <ChevronRight size={16} color="#1A73E8" />
              </h4>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', lineHeight: '1.45' }}>
                Simulate targeted remedial and mentoring allocations under strict capacity constraints with human-in-the-loop approval.
              </p>
            </div>
          </div>

          {/* Action 2: Decoupled Risk Radar */}
          <div
            onClick={() => navigate('/institution/risk-radar')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 200ms ease',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ height: '140px', overflow: 'hidden', position: 'relative' }}>
              <img
                src={IMAGES.dataScienceLab}
                alt="Risk Intelligence"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: '#1A73E8',
                  color: '#FFFFFF',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '4px',
                }}
              >
                ML Models
              </span>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 600, color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Decoupled Risk Intelligence Radar</span>
                <ChevronRight size={16} color="#1A73E8" />
              </h4>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', lineHeight: '1.45' }}>
                Inspect independent Academic Risk (LightGBM ~91%) and Placement Risk (LogReg ~69%) divergence clusters.
              </p>
            </div>
          </div>

          {/* Action 3: Student 360 Directory */}
          <div
            onClick={() => navigate('/institution/students')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 200ms ease',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ height: '140px', overflow: 'hidden', position: 'relative' }}>
              <img
                src={IMAGES.libraryStudy}
                alt="Student 360 Directory"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: '#059669',
                  color: '#FFFFFF',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '4px',
                }}
              >
                Directory
              </span>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 600, color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Student 360° Directory</span>
                <ChevronRight size={16} color="#1A73E8" />
              </h4>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', lineHeight: '1.45' }}>
                Browse 1,420 profiles with live multi-criteria search, radar breakdowns, and instant slide-over drawer inspections.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
