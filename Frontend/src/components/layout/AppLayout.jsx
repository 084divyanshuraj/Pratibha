import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  MoreHorizontal,
  Settings,
  Send,
  BrainCircuit,
  Share2,
  SlidersHorizontal,
  Check,
  ArrowUp,
  Lightbulb,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import CopilotDrawer from '../copilot/CopilotDrawer';

const INSTITUTION_NAV_SECTIONS = [
  {
    title: 'Intelligence Modules',
    items: [
      { path: '/institution/overview', label: 'Executive Overview', icon: BarChart3, badge: null },
      { path: '/institution/students', label: 'Student 360° Directory', icon: Users, badge: '1,420' },
      { path: '/institution/risk-radar', label: 'Decoupled Risk Radar', icon: Target, badge: 'ML' },
    ],
  },
  {
    title: 'Simulations & Tools',
    items: [
      { path: '/institution/sandbox', label: 'Intervention Sandbox', icon: FlaskConical, badge: 'Simulator' },
      { path: '/institution/segments', label: 'Student Archetypes', icon: Layers, badge: '5' },
      { path: '/institution/ingestion', label: 'Data Integration Studio', icon: UploadCloud, badge: '8 Pillars' },
    ],
  },
  {
    title: 'Governance & Audits',
    items: [
      { path: '/institution/feedback', label: 'Campus Feedback', icon: MessageSquareHeart, badge: null },
      { path: '/institution/audit', label: 'Security & Audit Trail', icon: ShieldCheck, badge: 'Admin' },
      { path: '/institution/profile', label: 'My Profile & Details', icon: User, badge: null },
    ],
  },
];

const STUDENT_NAV_SECTIONS = [
  {
    title: 'Academic Intelligence',
    items: [
      { path: '/student/portal', label: 'My Academic Dashboard', icon: GraduationCap, badge: 'Live', tab: 'overview' },
      { path: '/student/portal?tab=academic', label: 'Attendance & Courses', icon: BookOpen, badge: '88%', tab: 'academic' },
      { path: '/student/portal?tab=placement', label: 'Placement Readiness', icon: Award, badge: 'Tier-1', tab: 'placement' },
    ],
  },
  {
    title: 'Support & Guidance',
    items: [
      { path: '/student/portal?tab=interventions', label: 'My Support Programs', icon: Sparkles, badge: 'Active', tab: 'interventions' },
      { path: '/student/portal?tab=feedback', label: 'Feedback & Suggestions', icon: MessageSquareHeart, badge: null, tab: 'feedback' },
      { path: '/student/profile', label: 'My Profile & Details', icon: User, badge: null },
    ],
  },
];

export default function AppLayout({ children }) {
  const { currentUser, logout, loginWithDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isCopilotHovered, setIsCopilotHovered] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [backendLive, setBackendLive] = useState(false);

  const profileMenuRef = useRef(null);

  const isStudent = currentUser?.portal === 'student' || currentUser?.role === 'student' || location.pathname.startsWith('/student');

  useEffect(() => {
    // Check live connectivity to backend Express service
    api
      .checkHealth()
      .then((res) => {
        setBackendLive(res?.status === 'ok');
      })
      .catch(() => {
        setBackendLive(false);
      });
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    logout();
    navigate('/');
  };

  const handleRoleSwitch = async (roleKey) => {
    setIsProfileMenuOpen(false);
    await loginWithDemo(roleKey);
    if (roleKey === 'student') {
      navigate('/student/portal');
    } else {
      navigate('/institution/overview');
    }
  };



  // Resolve user display name & initials
  const displayName = currentUser?.name || (isStudent ? 'Aarav Sharma' : 'Demo Administrator');
  const userInitials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'DA';

  // Navigation sections based on role
  const getNavSections = () => {
    if (isStudent) return STUDENT_NAV_SECTIONS;

    if (currentUser?.role === 'faculty_mentor') {
      return [
        {
          title: 'Department Overview',
          items: [
            { path: '/institution/overview', label: 'Faculty Overview', icon: BarChart3, badge: 'CSE' },
            { path: '/institution/students', label: 'CSE Mentees Directory', icon: Users, badge: '28' },
            { path: '/institution/risk-radar', label: 'Academic Risk Radar', icon: Target, badge: 'Attendance' },
          ],
        },
        {
          title: 'Tutoring & Support',
          items: [
            { path: '/institution/segments', label: 'Student Support Archetypes', icon: Layers, badge: null },
            { path: '/institution/sandbox', label: 'Support & Tutoring Planner', icon: FlaskConical, badge: 'Tutoring' },
            { path: '/institution/feedback', label: 'Campus Feedback', icon: MessageSquareHeart, badge: 'New' },
            { path: '/institution/profile', label: 'My Faculty Profile', icon: User, badge: null },
          ],
        },
      ];
    }

    if (currentUser?.role === 'placement_officer') {
      return [
        {
          title: 'Placement Matrix',
          items: [
            { path: '/institution/overview', label: 'Placement Overview', icon: BarChart3, badge: 'TPO' },
            { path: '/institution/segments', label: 'Placement Readiness Matrix', icon: Layers, badge: 'Tier-1' },
            { path: '/institution/students', label: 'Eligible Candidates Roster', icon: Users, badge: 'Eligible' },
          ],
        },
        {
          title: 'Recruitment & Prep',
          items: [
            { path: '/institution/risk-radar', label: 'Placement Risk Radar', icon: Target, badge: 'Mock Prep' },
            { path: '/institution/sandbox', label: 'Interview & Training Planner', icon: FlaskConical, badge: 'Bootcamp' },
            { path: '/institution/feedback', label: 'Corporate Feedback', icon: MessageSquareHeart, badge: null },
            { path: '/institution/profile', label: 'My TPO Profile', icon: User, badge: null },
          ],
        },
      ];
    }

    return INSTITUTION_NAV_SECTIONS;
  };

  const navSections = getNavSections();

  // Find active page title for minimal top bar
  const findActiveTitle = () => {
    for (const section of navSections) {
      for (const item of section.items) {
        if (location.pathname === item.path || (item.path.includes('?') && (location.pathname + location.search) === item.path)) {
          return item.label;
        }
      }
    }
    return 'Intelligence Workspace';
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: '#F8FAFC',
        color: '#0F172A',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* =========================================================================
          1. CHATGPT ARCHITECTURE WITH PRATIBHA DEEP BRAND NAVY SIDEBAR (#082B56)
          ========================================================================= */}
      <aside
        style={{
          width: isSidebarCollapsed ? '0px' : '260px',
          minWidth: isSidebarCollapsed ? '0px' : '260px',
          transition: 'width 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), min-width 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)',
          height: '100vh',
          backgroundColor: '#082B56',
          borderRight: isSidebarCollapsed ? 'none' : '1px solid #061F3E',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
          zIndex: 40,
          position: 'relative',
          boxShadow: '2px 0 12px rgba(8, 43, 86, 0.12)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 76px)', overflow: 'hidden' }}>
          {/* TOP SIDEBAR HEADER */}
          <div style={{ padding: '14px 14px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link
              to={isStudent ? '/student/portal' : '/institution/overview'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
              title="PRATIBHA Dashboard Home"
            >
              <img
                src="/assets/images/pratibha_logo.png"
                alt="PRATIBHA"
                style={{
                  height: '32px',
                  width: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />
            </Link>

            {/* Sidebar Collapse Button */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(true)}
              title="Close sidebar"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.75)',
                cursor: 'pointer',
                padding: '5px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <PanelLeftClose size={18} />
            </button>
          </div>

          {/* SCROLLABLE NAVIGATION SECTIONS */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '8px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {navSections.map((section, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div
                  style={{
                    padding: '4px 10px 4px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: 'rgba(255, 255, 255, 0.45)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {section.title}
                </div>

                {section.items.map((item) => {
                  const Icon = item.icon;
                  const fullCurrentPath = location.pathname + location.search;
                  const isActive =
                    fullCurrentPath === item.path ||
                    (location.pathname === item.path && !location.search && !item.path.includes('?'));

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.72)',
                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                        border: isActive ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                        fontSize: '0.84rem',
                        fontWeight: isActive ? 600 : 500,
                        boxShadow: isActive ? '0 2px 6px rgba(0, 0, 0, 0.18)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.color = '#FFFFFF';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.72)';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon size={17} color={isActive ? '#38BDF8' : 'rgba(255, 255, 255, 0.65)'} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            padding: '2px 7px',
                            borderRadius: '999px',
                            backgroundColor: isActive ? 'rgba(56, 189, 248, 0.22)' : 'rgba(255, 255, 255, 0.10)',
                            color: isActive ? '#BAE6FD' : 'rgba(255, 255, 255, 0.85)',
                            fontWeight: 600,
                            border: isActive ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid rgba(255, 255, 255, 0.15)',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            PROFILE SECTION AT SIDEBAR BOTTOM (SEAMLESSLY DOCKED IN NAVY FOOTER)
            ========================================================================= */}
        <div
          ref={profileMenuRef}
          style={{
            padding: '10px 12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.10)',
            position: 'relative',
          }}
        >
          {/* Profile Dropdown Popover (Clean White Container) */}
          {isProfileMenuOpen && (
            <div
              style={{
                position: 'absolute',
                bottom: '68px',
                left: '10px',
                right: '10px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '8px',
                boxShadow: '0 16px 36px rgba(15, 23, 42, 0.18)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                zIndex: 100,
              }}
            >
              {/* User Email & Role Info */}
              <div style={{ padding: '8px 10px', borderBottom: '1px solid #F1F5F9', marginBottom: '4px' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>{displayName}</div>
                <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
                  {currentUser?.email || (isStudent ? 'student@example.edu' : 'admin@example.edu')}
                </div>
                <div style={{ fontSize: '0.70rem', color: '#059669', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                  <span>{backendLive ? 'API Service Connected (port 5000)' : 'Synthetic Mode Active'}</span>
                </div>
              </div>

              {/* View Profile */}
              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  navigate(isStudent ? '/student/profile' : '/institution/profile');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#334155',
                  fontSize: '0.80rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <User size={14} color="#64748B" />
                <span>My Profile & Details</span>
              </button>

              {/* Persona Switching Header */}
              <div style={{ padding: '6px 10px 2px', fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Switch Persona
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => handleRoleSwitch('admin')}
                  style={{
                    padding: '5px 8px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: currentUser?.role === 'institution_admin' ? '#EBF3FE' : '#F8FAFC',
                    color: currentUser?.role === 'institution_admin' ? '#1677D2' : '#334155',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSwitch('faculty')}
                  style={{
                    padding: '5px 8px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: currentUser?.role === 'faculty_mentor' ? '#EBF3FE' : '#F8FAFC',
                    color: currentUser?.role === 'faculty_mentor' ? '#1677D2' : '#334155',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Faculty
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSwitch('placement')}
                  style={{
                    padding: '5px 8px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: currentUser?.role === 'placement_officer' ? '#EBF3FE' : '#F8FAFC',
                    color: currentUser?.role === 'placement_officer' ? '#1677D2' : '#334155',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Placement
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSwitch('student')}
                  style={{
                    padding: '5px 8px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: isStudent ? '#EBF3FE' : '#F8FAFC',
                    color: isStudent ? '#1677D2' : '#334155',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Student
                </button>
              </div>

              {/* Log out option */}
              <div style={{ borderTop: '1px solid #F1F5F9', marginTop: '4px', paddingTop: '4px' }}>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#EF4444',
                    fontSize: '0.80rem',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEF2F2')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <LogOut size={14} color="#EF4444" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}

          {/* Profile Bar Button at Sidebar Bottom */}
          <div
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            style={{
              padding: '8px 10px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              backgroundColor: isProfileMenuOpen ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isProfileMenuOpen) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
            }}
            onMouseLeave={(e) => {
              if (!isProfileMenuOpen) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            }}
            title="Account & Settings"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              {/* Circle Avatar */}
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(56, 189, 248, 0.22)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  flexShrink: 0,
                  border: '1.5px solid rgba(56, 189, 248, 0.55)',
                }}
              >
                {userInitials}
              </div>

              {/* Name & Plan Tag */}
              <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {displayName}
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: 'rgba(255, 255, 255, 0.75)',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {currentUser?.roleLabel || (isStudent ? 'Student' : 'Institution Admin')} • Pro
                </span>
              </div>
            </div>

            <MoreHorizontal size={16} color="rgba(255, 255, 255, 0.75)" />
          </div>
        </div>
      </aside>

      {/* =========================================================================
          2. MIDDLE SECTION & MAIN WORKSPACE CANVAS (SYMMETRIC & BALANCED)
          ========================================================================= */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: '#F8FAFC',
          position: 'relative',
        }}
      >
        {/* BALANCED SYMMETRIC TOP HEADER */}
        <header
          style={{
            height: '54px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.75rem',
            flexShrink: 0,
            zIndex: 30,
          }}
        >
          {/* Left: Sidebar Toggle (when collapsed) + Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isSidebarCollapsed && (
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(false)}
                title="Open sidebar"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: '5px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#0F172A';
                  e.currentTarget.style.backgroundColor = '#F1F5F9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#64748B';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <PanelLeftOpen size={18} />
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem' }}>
              <span style={{ fontWeight: 800, color: '#082B56', letterSpacing: '-0.2px' }}>PRATIBHA</span>
              <span style={{ color: '#CBD5E1' }}>/</span>
              <span style={{ color: '#334155', fontWeight: 600 }}>{findActiveTitle()}</span>
            </div>

            <span
              style={{
                fontSize: '0.70rem',
                color: '#64748B',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              AY 2025–26 • Sem 6
            </span>
          </div>

          {/* Right: Status Pill & Persona Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.72rem',
                color: backendLive ? '#059669' : '#D97706',
                backgroundColor: backendLive ? '#ECFDF5' : '#FFFBEB',
                border: `1px solid ${backendLive ? '#A7F3D0' : '#FDE68A'}`,
                padding: '3px 9px',
                borderRadius: '999px',
                fontWeight: 600,
              }}
              title={backendLive ? 'Backend Express API is connected and responding' : 'Operating with deterministic synthetic intelligence records'}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: backendLive ? '#10B981' : '#F59E0B',
                }}
              />
              <span>{backendLive ? 'Live API (Port 5000)' : 'Synthetic Mode'}</span>
            </div>

            {/* Current Role Badge */}
            <span
              style={{
                fontSize: '0.74rem',
                padding: '3px 10px',
                borderRadius: '999px',
                backgroundColor: '#F1F5F9',
                border: '1px solid #CBD5E1',
                color: '#1E293B',
                fontWeight: 600,
              }}
            >
              {currentUser?.roleLabel || 'Administrator'}
            </span>
          </div>
        </header>

        {/* SCROLLABLE MAIN CONTENT AREA (WITH AMPLE BOTTOM CLEARANCE FOR MASCOT) */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.75rem 2rem 5.5rem',
            maxWidth: '1440px',
            width: '100%',
            margin: '0 auto',
            color: '#0F172A',
          }}
        >
          {children}
        </main>
      </div>

      {/* FLOATING COPILOT TRIGGER BUTTON (EXPANDABLE CIRCLE WITH CUTE ANIMAL MASCOT) */}
      <button
        type="button"
        onClick={() => setIsCopilotOpen(true)}
        onMouseEnter={() => setIsCopilotHovered(true)}
        onMouseLeave={() => setIsCopilotHovered(false)}
        aria-label={isStudent ? 'Ask Student Copilot' : 'Ask Campus Copilot'}
        title={isStudent ? 'Ask Student Copilot' : 'Ask Campus Copilot'}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '28px',
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          border: isCopilotHovered ? '1.5px solid rgba(56, 189, 248, 0.65)' : '1.5px solid rgba(56, 189, 248, 0.35)',
          borderRadius: '999px',
          height: '56px',
          minWidth: '56px',
          maxWidth: isCopilotHovered ? '320px' : '56px',
          padding: isCopilotHovered ? '8px 18px 8px 9px' : '8px',
          display: 'flex',
          alignItems: 'center',
          gap: isCopilotHovered ? '10px' : '0px',
          cursor: 'pointer',
          boxShadow: isCopilotHovered
            ? '0 12px 32px rgba(15, 23, 42, 0.6), 0 0 24px rgba(56, 189, 248, 0.4)'
            : '0 8px 24px rgba(15, 23, 42, 0.45), 0 0 16px rgba(56, 189, 248, 0.25)',
          transition: 'all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
          zIndex: 80,
          overflow: 'hidden',
        }}
      >
        <CuteCopilotAvatar size={38} isHovered={isCopilotHovered} />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            maxWidth: isCopilotHovered ? '240px' : '0px',
            opacity: isCopilotHovered ? 1 : 0,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            transition: 'max-width 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.22s ease',
            pointerEvents: isCopilotHovered ? 'auto' : 'none',
          }}
        >
          <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#F8FAFC' }}>
            {isStudent ? 'Ask Student Copilot' : 'Ask Campus Copilot'}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'rgba(56, 189, 248, 0.16)',
              color: '#38BDF8',
              padding: '3px 8px',
              borderRadius: '999px',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
            }}
          >
            <Mic size={10} /> Voice AI
          </span>
        </div>
      </button>

      {/* PRATIBHA COPILOT DRAWER */}
      <CopilotDrawer isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
    </div>
  );
}

/**
 * CuteCopilotAvatar — Friendly, adorable animal mascot (Panda with academic cap)
 * Shows a sweet animated expression, sparkling eyes, rosy cheeks, and live status dot.
 */
function CuteCopilotAvatar({ size = 38, isHovered = false }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transform: isHovered ? 'scale(1.08)' : 'scale(1)',
        transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          overflow: 'visible',
        }}
      >
        {/* Left Ear */}
        <circle cx="8.5" cy="8.5" r="5" fill="#1E293B" stroke="#38BDF8" strokeWidth="1" />
        <circle cx="8.5" cy="8.5" r="2.6" fill="#F472B6" />

        {/* Right Ear */}
        <circle cx="27.5" cy="8.5" r="5" fill="#1E293B" stroke="#38BDF8" strokeWidth="1" />
        <circle cx="27.5" cy="8.5" r="2.6" fill="#F472B6" />

        {/* Head */}
        <circle cx="18" cy="19" r="13.2" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="1.1" />

        {/* Panda Eye Patches */}
        <ellipse cx="12.8" cy="18" rx="3.6" ry="4.2" transform="rotate(-15 12.8 18)" fill="#1E293B" />
        <ellipse cx="23.2" cy="18" rx="3.6" ry="4.2" transform="rotate(15 23.2 18)" fill="#1E293B" />

        {/* Sparkly Pupils with Highlights */}
        <circle cx="13" cy="17.2" r="1.5" fill="#FFFFFF" />
        <circle cx="14.2" cy="18.8" r="0.7" fill="#38BDF8" />
        <circle cx="23" cy="17.2" r="1.5" fill="#FFFFFF" />
        <circle cx="24.2" cy="18.8" r="0.7" fill="#38BDF8" />

        {/* Rosy Blush Cheeks */}
        <ellipse cx="8.5" cy="22.2" rx="2.3" ry="1.3" fill="#FB7185" opacity="0.85" />
        <ellipse cx="27.5" cy="22.2" rx="2.3" ry="1.3" fill="#FB7185" opacity="0.85" />

        {/* Cute Little Nose */}
        <ellipse cx="18" cy="20.5" rx="1.5" ry="1" fill="#0F172A" />

        {/* Sweet Smile */}
        <path
          d="M16.5 22.3 Q18 23.7 19.5 22.3"
          stroke="#0F172A"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Cute Graduation Mortarboard Cap */}
        <polygon points="18,3 25,6.6 18,10.2 11,6.6" fill="#0284C7" stroke="#38BDF8" strokeWidth="0.8" />
        <polygon points="15.5,9.2 20.5,9.2 19.5,11.8 16.5,11.8" fill="#0369A1" />
        <path d="M18 6.6 Q22 7.6 23.8 10.6" stroke="#FBBF24" strokeWidth="0.9" strokeLinecap="round" fill="none" />
        <circle cx="23.8" cy="11.2" r="0.7" fill="#FBBF24" />
      </svg>

      {/* Live Online Pulse Dot */}
      <span
        style={{
          position: 'absolute',
          bottom: '0px',
          right: '0px',
          width: '9px',
          height: '9px',
          borderRadius: '50%',
          backgroundColor: '#10B981',
          border: '2px solid #0F172A',
          boxShadow: '0 0 6px #10B981',
        }}
      />
    </div>
  );
}
