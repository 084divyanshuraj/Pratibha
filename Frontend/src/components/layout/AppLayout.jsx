import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Users,
  Target,
  Layers,
  FlaskConical,
  UploadCloud,
  MessageSquareHeart,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  LogOut,
  ChevronRight,
  Wifi,
  WifiOff,
  UserCheck,
  Mic,
  BookOpen,
  Award,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import CopilotDrawer from '../copilot/CopilotDrawer';

const INSTITUTION_NAV_ITEMS = [
  { path: '/institution/overview', label: 'Executive Overview', icon: BarChart3, badge: null },
  { path: '/institution/students', label: 'Student 360° Directory', icon: Users, badge: '1,420' },
  { path: '/institution/risk-radar', label: 'Decoupled Risk Radar', icon: Target, badge: 'ML' },
  { path: '/institution/segments', label: 'Student Archetypes', icon: Layers, badge: '5' },
  { path: '/institution/sandbox', label: 'Intervention Sandbox', icon: FlaskConical, badge: 'Simulator' },
  { path: '/institution/ingestion', label: 'Data Integration Studio', icon: UploadCloud, badge: '8 Pillars' },
  { path: '/institution/feedback', label: 'Campus Feedback', icon: MessageSquareHeart, badge: null },
  { path: '/institution/audit', label: 'Security & Audit Trail', icon: ShieldCheck, badge: 'Admin' },
  { path: '/institution/profile', label: 'My Profile & Details', icon: User, badge: null },
];

const STUDENT_NAV_ITEMS = [
  { path: '/student/portal', label: 'My Academic Dashboard', icon: GraduationCap, badge: 'Live', tab: 'overview' },
  { path: '/student/portal?tab=academic', label: 'Attendance & Courses', icon: BookOpen, badge: '88%', tab: 'academic' },
  { path: '/student/portal?tab=placement', label: 'Placement Readiness', icon: Award, badge: 'Tier-1', tab: 'placement' },
  { path: '/student/portal?tab=interventions', label: 'My Support Programs', icon: Sparkles, badge: 'Active', tab: 'interventions' },
  { path: '/student/portal?tab=feedback', label: 'Feedback & Suggestions', icon: MessageSquareHeart, badge: null, tab: 'feedback' },
  { path: '/student/profile', label: 'My Profile & Details', icon: User, badge: null },
];

export default function AppLayout({ children }) {
  const { currentUser, logout, loginWithDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [backendLive, setBackendLive] = useState(false);

  const isStudent = currentUser?.portal === 'student' || currentUser?.role === 'student' || location.pathname.startsWith('/student');

  useEffect(() => {
    // Check live connectivity to backend Express service
    api.checkHealth().then((res) => {
      setBackendLive(res?.status === 'ok');
    });
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handlePersonaChange = async (selectedKey) => {
    await loginWithDemo(selectedKey);
    if (selectedKey === 'student') {
      navigate('/student/portal');
    } else {
      if (isStudent || location.pathname.startsWith('/student')) {
        navigate('/institution/overview');
      }
    }
  };

  const getNavItems = () => {
    if (isStudent) return STUDENT_NAV_ITEMS;

    if (currentUser?.role === 'faculty_mentor') {
      return [
        { path: '/institution/overview', label: 'Faculty Overview', icon: BarChart3, badge: 'CSE' },
        { path: '/institution/students', label: 'CSE Mentees Directory', icon: Users, badge: '28' },
        { path: '/institution/risk-radar', label: 'Academic Risk Radar', icon: Target, badge: 'Attendance' },
        { path: '/institution/segments', label: 'Student Support Archetypes', icon: Layers, badge: null },
        { path: '/institution/sandbox', label: 'Support & Tutoring Planner', icon: FlaskConical, badge: 'Tutoring' },
        { path: '/institution/feedback', label: 'Campus Feedback', icon: MessageSquareHeart, badge: 'New' },
        { path: '/institution/profile', label: 'My Faculty Profile', icon: User, badge: null },
      ];
    }

    if (currentUser?.role === 'placement_officer') {
      return [
        { path: '/institution/overview', label: 'Placement Overview', icon: BarChart3, badge: 'TPO' },
        { path: '/institution/segments', label: 'Placement Readiness Matrix', icon: Layers, badge: 'Tier-1' },
        { path: '/institution/students', label: 'Eligible Candidates Roster', icon: Users, badge: 'Eligible' },
        { path: '/institution/risk-radar', label: 'Placement Risk Radar', icon: Target, badge: 'Mock Prep' },
        { path: '/institution/sandbox', label: 'Interview & Training Planner', icon: FlaskConical, badge: 'Bootcamp' },
        { path: '/institution/feedback', label: 'Corporate Feedback', icon: MessageSquareHeart, badge: null },
        { path: '/institution/profile', label: 'My TPO Profile', icon: User, badge: null },
      ];
    }

    return INSTITUTION_NAV_ITEMS;
  };

  const navItems = getNavItems();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* 1. TOP ENTERPRISE DEMO BAR */}
      <header
        style={{
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '0 1.5rem',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #1E293B',
          fontSize: '0.82rem',
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                backgroundColor: isStudent ? '#0284C7' : '#1A73E8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: '#FFFFFF',
              }}
            >
              P
            </div>
            <strong style={{ fontSize: '0.95rem', letterSpacing: '-0.2px' }}>PRATIBHA</strong>
            <span style={{ fontSize: '0.72rem', color: '#94A3B8', paddingLeft: '4px', borderLeft: '1px solid #334155' }}>
              {isStudent ? 'Student Self-Service Intelligence' : 'Student Success Intelligence Platform'}
            </span>
          </div>

          {/* Backend Live Indicator */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 8px',
              borderRadius: '999px',
              backgroundColor: backendLive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              border: `1px solid ${backendLive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              fontSize: '0.72rem',
              color: backendLive ? '#10B981' : '#F59E0B',
              fontWeight: 500,
            }}
          >
            {backendLive ? <Wifi size={12} /> : <WifiOff size={12} />}
            <span>{backendLive ? 'Live API (port 5000)' : 'Synthetic Mode'}</span>
          </div>
        </div>

        {/* Interactive Persona Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: 600 }}>Persona:</span>
            <select
              value={
                isStudent
                  ? 'student'
                  : currentUser?.role === 'faculty_mentor'
                  ? 'faculty'
                  : currentUser?.role === 'placement_officer'
                  ? 'placement'
                  : 'admin'
              }
              onChange={(e) => handlePersonaChange(e.target.value)}
              style={{
                backgroundColor: '#1E293B',
                color: '#38BDF8',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
              }}
              title="Switch demo persona to test role-specific workflows"
            >
              <option value="admin">🏛️ Dr. Sunita Rao · Admin (Dean & Provost)</option>
              <option value="faculty">👨‍🏫 Prof. Rajesh Kumar · Faculty Mentor (CSE)</option>
              <option value="placement">💼 Vikram Malhotra · Placement Officer (TPO)</option>
              <option value="student">🎓 Aarav Sharma · Student Portal</option>
            </select>
          </div>

          {/* Current Persona Badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '999px',
              backgroundColor: isStudent
                ? 'rgba(56, 189, 248, 0.15)'
                : currentUser?.role === 'faculty_mentor'
                ? 'rgba(34, 197, 94, 0.15)'
                : currentUser?.role === 'placement_officer'
                ? 'rgba(59, 130, 246, 0.15)'
                : 'rgba(245, 158, 11, 0.15)',
              border: `1px solid ${
                isStudent
                  ? 'rgba(56, 189, 248, 0.3)'
                  : currentUser?.role === 'faculty_mentor'
                  ? 'rgba(34, 197, 94, 0.3)'
                  : currentUser?.role === 'placement_officer'
                  ? 'rgba(59, 130, 246, 0.3)'
                  : 'rgba(245, 158, 11, 0.3)'
              }`,
              fontSize: '0.72rem',
              color: isStudent
                ? '#38BDF8'
                : currentUser?.role === 'faculty_mentor'
                ? '#4ADE80'
                : currentUser?.role === 'placement_officer'
                ? '#60A5FA'
                : '#FBBF24',
              fontWeight: 600,
            }}
          >
            <span>{currentUser?.name}</span>
            <span style={{ color: '#475569' }}>•</span>
            <span style={{ color: '#E2E8F0', fontWeight: 500 }}>{currentUser?.roleLabel}</span>
          </span>

          {/* Quick Profile Navigation Button */}
          <button
            onClick={() => navigate(isStudent ? '/student/profile' : '/institution/profile')}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              color: '#F8FAFC',
              borderRadius: '6px',
              padding: '4px 11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              fontWeight: 500,
              transition: 'all 0.2s ease',
            }}
            title="View & Edit My Profile"
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt="Avatar"
                style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <User size={13} color="#38BDF8" />
            )}
            <span>My Profile</span>
          </button>

          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: '1px solid #334155',
              color: '#CBD5E1',
              borderRadius: '6px',
              padding: '4px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
            }}
            title="Log out"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN APPLICATION WORKSPACE */}
      <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 50px)' }}>
        {/* SIDEBAR NAVIGATION */}
        <aside
          className="app-sidebar"
          style={{
            width: '260px',
            backgroundColor: '#1A73E8',
            borderRight: '1px solid #1669D6',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '1.25rem 0.75rem',
            flexShrink: 0,
            boxShadow: '2px 0 10px rgba(26, 115, 232, 0.15)',
          }}
        >
          <div>
            <div style={{ padding: '0 0.5rem 0.75rem', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.78)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {isStudent ? 'Student Self-Service' : 'Intelligence Modules'}
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const fullCurrentPath = location.pathname + location.search;
                const isActive = fullCurrentPath === item.path || (location.pathname === item.path && !location.search && !item.path.includes('?'));

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`app-sidebar-link ${isActive ? 'active' : ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: isActive ? '#1A73E8' : 'rgba(255, 255, 255, 0.9)',
                      backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.86rem',
                      boxShadow: isActive ? '0 3px 10px rgba(0, 0, 0, 0.14)' : 'none',
                      transition: 'all 150ms ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon size={18} color={isActive ? '#1A73E8' : 'rgba(255, 255, 255, 0.88)'} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          padding: '2px 7px',
                          borderRadius: '999px',
                          backgroundColor: isActive ? '#1A73E8' : 'rgba(255, 255, 255, 0.22)',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          border: isActive ? 'none' : '1px solid rgba(255, 255, 255, 0.3)',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* SIDEBAR FOOTER: USER CARD */}
          <div
            onClick={() => navigate(isStudent ? '/student/profile' : '/institution/profile')}
            className="app-sidebar-user-card"
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            title="Click to view and edit profile"
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  flexShrink: 0,
                  border: '2px solid #FFFFFF',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                }}
              />
            ) : (
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  flexShrink: 0,
                  border: '1.5px solid rgba(255, 255, 255, 0.5)',
                }}
              >
                {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
              </div>
            )}
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {currentUser?.name || (isStudent ? 'Aarav Sharma' : 'Administrator')}
                </span>
                <ChevronRight size={13} color="rgba(255, 255, 255, 0.8)" />
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.78)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {isStudent ? (currentUser?.email || 'B.Tech CSE · Sem 6') : (currentUser?.designation || currentUser?.department || 'Institution Staff')}
              </div>
            </div>
          </div>

          {/* Scoped Sidebar CSS */}
          <style>{`
            .app-sidebar-link:not(.active):hover {
              background-color: rgba(255, 255, 255, 0.16) !important;
              color: #FFFFFF !important;
            }
            .app-sidebar-link:not(.active):hover svg {
              color: #FFFFFF !important;
            }
            .app-sidebar-user-card:hover {
              background-color: rgba(255, 255, 255, 0.2) !important;
              border-color: rgba(255, 255, 255, 0.38) !important;
              transform: translateY(-1px);
            }
          `}</style>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
          {children}
        </main>
      </div>

      {/* 3. FLOATING COPILOT TRIGGER BUTTON */}
      <button
        onClick={() => setIsCopilotOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '28px',
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          border: '1px solid #334155',
          borderRadius: '999px',
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
          transition: 'all 200ms ease',
          zIndex: 80,
        }}
      >
        <Sparkles size={16} color="#38BDF8" />
        <span>{isStudent ? 'Ask Student Copilot' : 'Ask Campus Copilot'}</span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'rgba(56, 189, 248, 0.16)',
            color: '#38BDF8',
            padding: '2px 8px',
            borderRadius: '999px',
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}
        >
          <Mic size={10} /> Voice AI
        </span>
      </button>

      {/* 4. COPILOT SLIDE-OVER DRAWER */}
      <CopilotDrawer isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
    </div>
  );
}
