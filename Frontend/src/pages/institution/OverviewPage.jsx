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
    const handleDataUpdate = () => loadData();
    window.addEventListener('pratibha_data_updated', handleDataUpdate);
    return () => window.removeEventListener('pratibha_data_updated', handleDataUpdate);
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
                  borderRadius: '4px',
                  backgroundColor: role === 'faculty_mentor' ? '#DCFCE7' : role === 'placement_officer' ? '#DBEAFE' : '#E2E8F0',
                  color: role === 'faculty_mentor' ? '#15803D' : role === 'placement_officer' ? '#1D4ED8' : '#334155',
                }}
              >
                {role === 'faculty_mentor' ? 'Faculty Mentor Persona' : role === 'placement_officer' ? 'Placement Officer (TPO)' : 'Institution Administrator'}
              </span>
              <strong style={{ fontSize: '0.96rem', color: '#0F172A' }}>
                {currentUser?.name || currentUser?.displayName || (currentUser?.username ? `@${currentUser.username}` : (role === 'faculty_mentor' ? 'Prof. Rajesh Kumar' : role === 'placement_officer' ? 'Vikram Malhotra' : 'Administrator'))}
              </strong>
            </div>
          </div>
        </div>

        {/* Quick Role Actions */}
        <div className="responsive-toolbar-actions">
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#082B56', margin: 0, letterSpacing: '-0.3px' }}>
            {role === 'faculty_mentor'
              ? 'Faculty Mentorship & Academic Command Center'
              : role === 'placement_officer'
              ? 'Corporate Relations & Placement Command Center'
              : 'Executive Campus Intelligence Overview'}
          </h1>
          <p style={{ margin: '3px 0 0', color: '#64748B', fontSize: '0.84rem' }}>
            {role === 'faculty_mentor'
              ? 'Real-time cohort telemetry, attendance early-warnings, and departmental risk tracking.'
              : role === 'placement_officer'
              ? 'Corporate placement conversion rates, decoupled risk indicators, and training metrics.'
              : 'Holistic campus-wide student success analytics across all academic departments.'}
          </p>
        </div>

        <div className="responsive-toolbar-actions">
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
              transition: 'background-color 0.15s ease',
              height: '38px',
              boxSizing: 'border-box',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
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
              backgroundColor: '#1677D2',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#FFFFFF',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(22, 119, 210, 0.25)',
              transition: 'background-color 0.15s ease',
              height: '38px',
              boxSizing: 'border-box',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1262AF')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1677D2')}
          >
            <FlaskConical size={15} />
            <span>Open Sandbox Simulator</span>
          </button>
        </div>
      </div>

      {/* 2. EXECUTIVE KPI CARDS (SYMMETRIC & EQUAL HEIGHT) */}
      <div className="responsive-stat-grid">
        {/* KPI 1: Total Students */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '142px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Enrolled Students
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#EAF3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={17} color="#1677D2" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#082B56', marginTop: '8px' }}>
            {kpis?.totalStudents != null ? kpis.totalStudents.toLocaleString() : '121'}
          </div>
          <div style={{ fontSize: '0.76rem', color: (kpis?.totalStudents || 0) > 0 ? '#059669' : '#64748B', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>{(kpis?.totalStudents || 0) > 0 ? `Active Across ${kpis?.departmentCount || 1} Department${kpis?.departmentCount === 1 ? '' : 's'}` : 'Awaiting Student Ingestion'}</span>
          </div>
        </div>

        {/* KPI 2: Average Success Score */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '142px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Average Success Score
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={17} color="#10B981" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#082B56', marginTop: '8px' }}>
            {kpis?.averageSuccessScore != null ? kpis.averageSuccessScore : '74.9'}
            <span style={{ fontSize: '1rem', color: '#94A3B8', fontWeight: 400 }}>/100</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '4px' }}>
            Formula <strong>sss-v1</strong> (Explainable Readiness)
          </div>
        </div>

        {/* KPI 3: Decoupled Risk Divergence Alert (Harmonious White with Amber Accent) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid #FDE68A',
            borderLeft: '4px solid #D97706',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '142px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Decoupled Divergence Alert
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={17} color="#D97706" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#082B56', marginTop: '8px' }}>
            {kpis?.decoupledDivergence?.count != null ? kpis.decoupledDivergence.count : '148'}
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#D97706', marginLeft: '6px' }}>
              ({kpis?.decoupledDivergence?.percentage != null ? kpis.decoupledDivergence.percentage : '10.4'}%)
            </span>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#B45309', marginTop: '4px', fontWeight: 500 }}>
            High Academic CGPA but High Placement Risk
          </div>
        </div>

        {/* KPI 4: 7-Category Data Completeness */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '142px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Data Completeness
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={17} color="#64748B" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#082B56', marginTop: '8px' }}>
            {kpis?.overallCompletenessAverage != null ? kpis.overallCompletenessAverage : '83.1'}%
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '4px' }}>
            Across all 7 Institutional Pillars
          </div>
        </div>
      </div>

      {/* 3. CHARTS ROW */}
      <div className="responsive-charts-grid">
        {/* Chart A: Success Score Distribution */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#082B56' }}>
                Success Score Cohort Distribution
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#64748B' }}>
                Segmented by explainable Student Success Score bands
              </p>
            </div>
            <span style={{ fontSize: '0.74rem', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '3px 8px', borderRadius: '6px', color: '#64748B', fontWeight: 600 }}>
              N = {kpis?.totalStudents != null ? kpis.totalStudents.toLocaleString() : '121'}
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
                  contentStyle={{ backgroundColor: '#082B56', borderRadius: '8px', color: '#FFFFFF', border: 'none', fontSize: '0.8rem' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Historical Trends */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#082B56' }}>
                Institutional Progress Over Semesters
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#64748B' }}>
                Tracking longitudinal average score vs attendance percentage
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', fontSize: '0.72rem' }}>
              <span style={{ color: '#1677D2', fontWeight: 600 }}>● Success Score</span>
              <span style={{ color: '#0D9488', fontWeight: 600 }}>● Attendance %</span>
            </div>
          </div>

          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#082B56', borderRadius: '8px', color: '#FFFFFF', border: 'none', fontSize: '0.8rem' }}
                />
                <Line type="monotone" dataKey="averageSuccessScore" stroke="#1677D2" strokeWidth={3} dot={{ r: 4 }} name="Success Score" />
                <Line type="monotone" dataKey="averageAttendance" stroke="#0D9488" strokeWidth={2} dot={{ r: 4 }} name="Attendance %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. 7-PILLAR DATA COMPLETENESS CARD */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                Data Health & Completeness Across 7 Categories
              </h3>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  backgroundColor: '#EFF6FF',
                  color: '#1D4ED8',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid #BFDBFE',
                }}
              >
                Avg {kpis?.overallCompletenessAverage ?? 82.4}%
              </span>
            </div>
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
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '7px 14px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#1A73E8',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <UploadCloud size={15} />
            <span>Import Missing Data</span>
          </button>
        </div>

        <div className="responsive-pillar-grid">
          {[
            { name: 'Academic', key: 'academic', pct: kpis?.categoryCoverage?.academic != null ? kpis.categoryCoverage.academic : 100 },
            { name: 'Attendance', key: 'attendance', pct: kpis?.categoryCoverage?.attendance != null ? kpis.categoryCoverage.attendance : 96.7 },
            { name: 'LMS Activity', key: 'lms', pct: kpis?.categoryCoverage?.lms != null ? kpis.categoryCoverage.lms : 83.3 },
            { name: 'Placement Tests', key: 'placement', pct: kpis?.categoryCoverage?.placement != null ? kpis.categoryCoverage.placement : 75.0 },
            { name: 'Skill Labs', key: 'skills', pct: kpis?.categoryCoverage?.skills != null ? kpis.categoryCoverage.skills : 80.0 },
            { name: 'Engagement', key: 'engagement', pct: kpis?.categoryCoverage?.engagement != null ? kpis.categoryCoverage.engagement : 66.7 },
            { name: 'Feedback', key: 'feedback', pct: kpis?.categoryCoverage?.feedback != null ? kpis.categoryCoverage.feedback : 75.0 },
          ].map((pillar) => {
            const total = kpis?.totalStudents || 120;
            const observed = Math.round((pillar.pct / 100) * total);
            const statusLabel = pillar.pct >= 90 ? 'Optimal' : pillar.pct >= 75 ? 'Adequate' : 'Needs Ingestion';
            const statusBg = pillar.pct >= 90 ? '#ECFDF5' : pillar.pct >= 75 ? '#EFF6FF' : '#FFFBEB';
            const statusColor = pillar.pct >= 90 ? '#059669' : pillar.pct >= 75 ? '#2563EB' : '#D97706';
            const barColor = pillar.pct >= 85 ? '#10B981' : pillar.pct >= 70 ? '#3B82F6' : '#F59E0B';

            return (
              <div
                key={pillar.key}
                onClick={() => navigate('/institution/ingestion')}
                title={`Click to import or view ${pillar.name} dataset in Ingestion Studio`}
                style={{
                  padding: '12px 14px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#93C5FD';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155' }}>{pillar.name}</span>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      backgroundColor: statusBg,
                      color: statusColor,
                      padding: '1px 6px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {statusLabel}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                    {pillar.pct}%
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 500 }}>
                    {observed}/{total} obs.
                  </div>
                </div>

                <div style={{ width: '100%', height: '5px', backgroundColor: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(pillar.pct, 100)}%`, height: '100%', backgroundColor: barColor, borderRadius: '999px' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
