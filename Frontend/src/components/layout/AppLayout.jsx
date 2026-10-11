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
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [backendLive, setBackendLive] = useState(false);

  // ChatGPT Bottom Prompt Bar State
  const [bottomPrompt, setBottomPrompt] = useState('');
  const [isThinkingActive, setIsThinkingActive] = useState(false);

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

  const handleBottomPromptSubmit = (e) => {
    if (e) e.preventDefault();
    if (!bottomPrompt.trim()) return;
    setIsCopilotOpen(true);
    setBottomPrompt('');
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
          1. CHATGPT ARCHITECTURE WITH ORIGINAL PRATIBHA BLUE SIDEBAR (#1A73E8)
          ========================================================================= */}
      <aside
        style={{
          width: isSidebarCollapsed ? '0px' : '260px',
          minWidth: isSidebarCollapsed ? '0px' : '260px',
          transition: 'width 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), min-width 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)',
          height: '100vh',
          backgroundColor: '#1A73E8',
          borderRight: isSidebarCollapsed ? 'none' : '1px solid #1669D6',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
          zIndex: 40,
          position: 'relative',
          boxShadow: '2px 0 10px rgba(26, 115, 232, 0.15)',
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
                  filter: 'drop-shadow(0 0 10px rgba(0, 162, 255, 0.45)) drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
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
                color: 'rgba(255, 255, 255, 0.85)',
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
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
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
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div
                  style={{
                    padding: '4px 10px 4px',
                    fontSize: '0.70rem',
                    fontWeight: 700,
                    color: 'rgba(255, 255, 255, 0.78)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
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
                        padding: '9px 12px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: isActive ? '#1A73E8' : 'rgba(255, 255, 255, 0.9)',
                        backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                        fontSize: '0.85rem',
                        fontWeight: isActive ? 700 : 500,
                        boxShadow: isActive ? '0 3px 10px rgba(0, 0, 0, 0.14)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)';
                          e.currentTarget.style.color = '#FFFFFF';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                        }
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
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            PROFILE SECTION AT SIDEBAR BOTTOM (CHATGPT ARCHITECTURE + ORIGINAL COLORS)
            ========================================================================= */}
        <div
          ref={profileMenuRef}
          style={{
            padding: '10px 12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.18)',
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
                    color: currentUser?.role === 'institution_admin' ? '#1A73E8' : '#334155',
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
                    color: currentUser?.role === 'faculty_mentor' ? '#1A73E8' : '#334155',
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
                    color: currentUser?.role === 'placement_officer' ? '#1A73E8' : '#334155',
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
                    color: isStudent ? '#1A73E8' : '#334155',
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
              backgroundColor: isProfileMenuOpen ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isProfileMenuOpen) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.22)';
            }}
            onMouseLeave={(e) => {
              if (!isProfileMenuOpen) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
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
                  backgroundColor: 'rgba(255, 255, 255, 0.28)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  flexShrink: 0,
                  border: '1.5px solid rgba(255, 255, 255, 0.55)',
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
                    color: 'rgba(255, 255, 255, 0.82)',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {currentUser?.roleLabel || (isStudent ? 'Student' : 'Institution Admin')} • Go
                </span>
              </div>
            </div>

            <MoreHorizontal size={16} color="rgba(255, 255, 255, 0.8)" />
          </div>
        </div>
      </aside>

      {/* =========================================================================
          2. MIDDLE SECTION & MAIN WORKSPACE CANVAS (ORIGINAL CLEAN LIGHT PALETTE)
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
        {/* MINIMAL TOP HEADER */}
        <header
          style={{
            height: '50px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
              <span style={{ fontWeight: 700, color: '#0F172A' }}>PRATIBHA AI</span>
              <span style={{ color: '#CBD5E1' }}>/</span>
              <span style={{ color: '#64748B', fontWeight: 500 }}>{findActiveTitle()}</span>
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Current Role Badge */}
            <span
              style={{
                fontSize: '0.72rem',
                padding: '3px 9px',
                borderRadius: '999px',
                backgroundColor: '#F1F5F9',
                border: '1px solid #E2E8F0',
                color: '#334155',
                fontWeight: 600,
              }}
            >
              {currentUser?.roleLabel || 'Administrator'}
            </span>
          </div>
        </header>

        {/* SCROLLABLE MAIN CONTENT AREA */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem 2rem 6.5rem',
            maxWidth: '1440px',
            width: '100%',
            margin: '0 auto',
            color: '#0F172A',
          }}
        >
          {children}
        </main>

        {/* =========================================================================
            CHATGPT-STYLE BOTTOM PROMPT BAR (CLEAN LIGHT PALETTE)
            ========================================================================= */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(820px, calc(100% - 32px))',
            zIndex: 60,
          }}
        >
          <form
            onSubmit={handleBottomPromptSubmit}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '26px',
              padding: '6px 12px 6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.1)',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#1A73E8';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(26, 115, 232, 0.18)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#CBD5E1';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(15, 23, 42, 0.1)';
            }}
          >
            {/* "+" Action / Attachment Button */}
            <button
              type="button"
              onClick={() => setIsCopilotOpen(true)}
              title="Add data or prompt presets"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#F1F5F9',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E2E8F0')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
            >
              <Plus size={16} />
            </button>

            {/* Prompt Input Field */}
            <input
              type="text"
              value={bottomPrompt}
              onChange={(e) => setBottomPrompt(e.target.value)}
              placeholder={isStudent ? 'Ask PRATIBHA Student Copilot or query course stats...' : 'Ask PRATIBHA Copilot or run simulation query...'}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#0F172A',
                fontSize: '0.92rem',
                fontFamily: 'inherit',
              }}
            />

            {/* "Think" Toggle Button */}
            <button
              type="button"
              onClick={() => setIsThinkingActive(!isThinkingActive)}
              title="Deep Cognitive Analysis Mode"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '999px',
                border: isThinkingActive ? '1px solid #1A73E8' : '1px solid #BFDBFE',
                backgroundColor: isThinkingActive ? '#EBF3FE' : '#EFF6FF',
                color: isThinkingActive ? '#1A73E8' : '#1D4ED8',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
            >
              <BrainCircuit size={13} color={isThinkingActive ? '#1A73E8' : '#2563EB'} />
              <span>Think</span>
            </button>

            {/* Voice AI Mic Trigger */}
            <button
              type="button"
              onClick={() => setIsCopilotOpen(true)}
              title="Voice AI Input"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#1A73E8';
                e.currentTarget.style.backgroundColor = '#EBF3FE';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#64748B';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Mic size={17} />
            </button>

            {/* Submit Arrow Button */}
            <button
              type="submit"
              disabled={!bottomPrompt.trim()}
              title="Send Prompt"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: bottomPrompt.trim() ? '#1A73E8' : '#E2E8F0',
                color: bottomPrompt.trim() ? '#FFFFFF' : '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: bottomPrompt.trim() ? 'pointer' : 'default',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
            >
              <ArrowUp size={16} strokeWidth={2.5} />
            </button>
          </form>
        </div>
      </div>

      {/* =========================================================================
          3. PRATIBHA COPILOT DRAWER
          ========================================================================= */}
      <CopilotDrawer isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
    </div>
  );
}
