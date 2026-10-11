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
  const displayName = currentUser?.name || (isStudent ? 'Aarav Sharma' : 'Rajesh Sarraf');
  const userInitials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'RS';

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
        backgroundColor: '#212121',
        color: '#ECECEC',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* =========================================================================
          1. CHATGPT-STYLE LEFT PANEL (FULL-HEIGHT DARK SIDEBAR)
          ========================================================================= */}
      <aside
        style={{
          width: isSidebarCollapsed ? '0px' : '260px',
          minWidth: isSidebarCollapsed ? '0px' : '260px',
          transition: 'width 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), min-width 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)',
          height: '100vh',
          backgroundColor: '#171717',
          borderRight: isSidebarCollapsed ? 'none' : '1px solid #27272a',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
          zIndex: 40,
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 76px)', overflow: 'hidden' }}>
          {/* TOP SIDEBAR HEADER & NEW ANALYSIS BUTTON */}
          <div style={{ padding: '12px 14px 10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Brand Logo & Collapse Icon */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Link
                to={isStudent ? '/student/portal' : '/institution/overview'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  textDecoration: 'none',
                  color: '#FFFFFF',
                }}
              >
                <img
                  src="/assets/images/pratibha_logo.png"
                  alt="PRATIBHA"
                  style={{
                    height: '26px',
                    width: 'auto',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 0 8px rgba(0, 162, 255, 0.4))',
                  }}
                />
                <span style={{ fontSize: '0.98rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#F4F4F5' }}>
                  PRATIBHA
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#A1A1AA',
                    fontWeight: 600,
                  }}
                >
                  AI 4.0
                </span>
              </Link>

              {/* Sidebar Collapse Button */}
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(true)}
                title="Close sidebar"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#A1A1AA',
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
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#A1A1AA';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <PanelLeftClose size={18} />
              </button>
            </div>

            {/* "+ New Analysis / Simulation" (ChatGPT "+ New chat" Button) */}
            <button
              type="button"
              onClick={() => {
                setIsCopilotOpen(true);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                fontSize: '0.86rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={16} color="#FFFFFF" />
                <span>New Analysis / Query</span>
              </div>
              <Sparkles size={14} color="#38BDF8" />
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
                    padding: '4px 10px 6px',
                    fontSize: '0.70rem',
                    fontWeight: 700,
                    color: '#71717A',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
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
                        padding: '8px 10px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: isActive ? '#FFFFFF' : '#A1A1AA',
                        backgroundColor: isActive ? '#27272a' : 'transparent',
                        fontSize: '0.84rem',
                        fontWeight: isActive ? 600 : 400,
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.07)';
                          e.currentTarget.style.color = '#FFFFFF';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#A1A1AA';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon size={17} color={isActive ? '#38BDF8' : '#71717A'} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          style={{
                            fontSize: '0.66rem',
                            padding: '1px 6px',
                            borderRadius: '999px',
                            backgroundColor: isActive ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                            color: isActive ? '#38BDF8' : '#A1A1AA',
                            fontWeight: 600,
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
            CHATGPT-STYLE PROFILE SECTION (BOTTOM OF SIDEBAR)
            ========================================================================= */}
        <div
          ref={profileMenuRef}
          style={{
            padding: '10px 12px',
            borderTop: '1px solid #27272a',
            position: 'relative',
          }}
        >
          {/* Profile Dropdown Popover */}
          {isProfileMenuOpen && (
            <div
              style={{
                position: 'absolute',
                bottom: '68px',
                left: '10px',
                right: '10px',
                backgroundColor: '#262626',
                border: '1px solid #3f3f46',
                borderRadius: '12px',
                padding: '8px',
                boxShadow: '0 16px 36px rgba(0, 0, 0, 0.65)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                zIndex: 100,
              }}
            >
              {/* User Email & Role Info */}
              <div style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '4px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF' }}>{displayName}</div>
                <div style={{ fontSize: '0.72rem', color: '#A1A1AA', marginTop: '2px' }}>
                  {currentUser?.email || (isStudent ? 'student@example.edu' : 'admin@example.edu')}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#10B981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                  color: '#E4E4E7',
                  fontSize: '0.80rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <User size={14} color="#A1A1AA" />
                <span>My Profile & Details</span>
              </button>

              {/* Persona Switching Header */}
              <div style={{ padding: '6px 10px 2px', fontSize: '0.68rem', fontWeight: 700, color: '#71717A', textTransform: 'uppercase' }}>
                Switch Persona
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => handleRoleSwitch('admin')}
                  style={{
                    padding: '5px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backgroundColor: currentUser?.role === 'institution_admin' ? '#3F3F46' : 'transparent',
                    color: '#E4E4E7',
                    fontSize: '0.72rem',
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
                    border: '1px solid rgba(255,255,255,0.08)',
                    backgroundColor: currentUser?.role === 'faculty_mentor' ? '#3F3F46' : 'transparent',
                    color: '#E4E4E7',
                    fontSize: '0.72rem',
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
                    border: '1px solid rgba(255,255,255,0.08)',
                    backgroundColor: currentUser?.role === 'placement_officer' ? '#3F3F46' : 'transparent',
                    color: '#E4E4E7',
                    fontSize: '0.72rem',
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
                    border: '1px solid rgba(255,255,255,0.08)',
                    backgroundColor: isStudent ? '#3F3F46' : 'transparent',
                    color: '#E4E4E7',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                  }}
                >
                  Student
                </button>
              </div>

              {/* Log out option */}
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', marginTop: '4px', paddingTop: '4px' }}>
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
                    color: '#F87171',
                    fontSize: '0.80rem',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <LogOut size={14} color="#F87171" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}

          {/* Profile Bar Button (Avatar + Name + Role like Image 2) */}
          <div
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            style={{
              padding: '6px 8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              backgroundColor: isProfileMenuOpen ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isProfileMenuOpen) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
            }}
            onMouseLeave={(e) => {
              if (!isProfileMenuOpen) e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Account & Settings"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              {/* Circle Avatar (RS initials like Image 2) */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  flexShrink: 0,
                  border: '1.5px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                {userInitials}
              </div>

              {/* Name & Plan Tag */}
              <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: '#F4F4F5',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {displayName}
                </span>
                <span
                  style={{
                    fontSize: '0.70rem',
                    color: '#A1A1AA',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {currentUser?.roleLabel || (isStudent ? 'Student' : 'Institution Admin')} • Go
                </span>
              </div>
            </div>

            <MoreHorizontal size={16} color="#A1A1AA" />
          </div>
        </div>
      </aside>

      {/* =========================================================================
          2. CHATGPT-STYLE MIDDLE SECTION & MAIN WORKSPACE CANVAS
          ========================================================================= */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: '#212121',
          position: 'relative',
        }}
      >
        {/* MINIMAL TOP HEADER (SEAMLESS CHATGPT STYLE) */}
        <header
          style={{
            height: '48px',
            backgroundColor: '#212121',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.25rem',
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
                  color: '#A1A1AA',
                  cursor: 'pointer',
                  padding: '5px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#A1A1AA';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <PanelLeftOpen size={18} />
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
              <span style={{ fontWeight: 600, color: '#FFFFFF' }}>PRATIBHA AI</span>
              <span style={{ color: '#52525B' }}>/</span>
              <span style={{ color: '#A1A1AA', fontWeight: 500 }}>{findActiveTitle()}</span>
            </div>
          </div>

          {/* Right: Live API & Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Live API Indicator Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 10px',
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

            {/* Current Role Badge */}
            <span
              style={{
                fontSize: '0.72rem',
                padding: '3px 9px',
                borderRadius: '999px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#D4D4D8',
                fontWeight: 500,
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
            color: '#ECECEC',
          }}
        >
          {children}
        </main>

        {/* =========================================================================
            CHATGPT-STYLE BOTTOM PROMPT BAR (DOCKED AT BOTTOM OF MIDDLE SECTION)
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
              backgroundColor: '#2f2f2f',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: '26px',
              padding: '6px 12px 6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.55)',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)')}
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
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
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
                color: '#FFFFFF',
                fontSize: '0.92rem',
                fontFamily: 'inherit',
              }}
            />

            {/* "Think" Toggle Button (Exact replica of ChatGPT Image 2) */}
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
                border: isThinkingActive ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: isThinkingActive ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                color: isThinkingActive ? '#38BDF8' : '#D4D4D8',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
            >
              <BrainCircuit size={13} color={isThinkingActive ? '#38BDF8' : '#A1A1AA'} />
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
                color: '#A1A1AA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#38BDF8';
                e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#A1A1AA';
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
                backgroundColor: bottomPrompt.trim() ? '#FFFFFF' : 'rgba(255, 255, 255, 0.2)',
                color: bottomPrompt.trim() ? '#000000' : 'rgba(255, 255, 255, 0.4)',
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
