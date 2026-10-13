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
  Mic,
  BookOpen,
  Award,
  User,
  PanelLeftClose,
  MoreHorizontal,
  Settings,
  Check,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import CopilotDrawer from '../copilot/CopilotDrawer';

// Base navigation structures (badges populated dynamically inside component based on live DB state)

export default function AppLayout({ children }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Responsive device viewport detector: Auto-collapse on tablet/mobile (< 1024px)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isCopilotHovered, setIsCopilotHovered] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [backendLive, setBackendLive] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const profileMenuRef = useRef(null);

  const isStudent = currentUser?.portal === 'student' || currentUser?.role === 'student' || location.pathname.startsWith('/student');

  // Enforce portal isolation: each persona stays strictly within their authenticated portal
  useEffect(() => {
    if (currentUser) {
      const userIsStudent = currentUser.portal === 'student' || currentUser.role === 'student';
      if (userIsStudent && location.pathname.startsWith('/institution')) {
        navigate('/student/portal', { replace: true });
      } else if (!userIsStudent && location.pathname.startsWith('/student')) {
        navigate('/institution/overview', { replace: true });
      }
    }
  }, [currentUser, location.pathname, navigate]);

  // Auto-close Copilot drawer on route transition
  useEffect(() => {
    setIsCopilotOpen(false);
  }, [location.pathname]);

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



  const [liveKpis, setLiveKpis] = useState(null);
  const [studentTelemetry, setStudentTelemetry] = useState(null);

  const fetchLiveTelemetry = () => {
    // 1. Fetch live overview KPIs
    api
      .getOverviewKpis()
      .then((res) => {
        if (res) setLiveKpis(res);
      })
      .catch(() => {});

    // 2. If student persona, query student records
    if (isStudent && currentUser) {
      const sId = currentUser.studentId;
      const sEmail = currentUser.email;
      if (sId || sEmail) {
        api.getStudents({ search: sId || sEmail }).then((res) => {
          const match = res?.students?.find(
            (s) => (sId && s.studentId === sId) || (sEmail && s.email === sEmail)
          );
          if (match) setStudentTelemetry(match);
        }).catch(() => {});
      }
    }
  };

  useEffect(() => {
    fetchLiveTelemetry();
    window.addEventListener('pratibha_data_updated', fetchLiveTelemetry);
    return () => window.removeEventListener('pratibha_data_updated', fetchLiveTelemetry);
  }, [currentUser, isStudent]);

  // Resolve user display name & initials
  const displayName =
    currentUser?.name ||
    currentUser?.displayName ||
    (currentUser?.username ? `@${currentUser.username}` : null) ||
    (currentUser?.email ? currentUser.email.split('@')[0] : (isStudent ? 'Aarav Sharma' : 'Administrator'));

  const userInitials = displayName
    .replace(/^@/, '')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AD';

  // Navigation sections based on role and dynamic DB metrics
  const getNavSections = () => {
    const totalStudents = liveKpis?.totalStudents != null ? liveKpis.totalStudents : null;
    const isDemo = !currentUser || currentUser?.email === 'student@example.edu' || currentUser?.studentId === 'STU_0001';

    if (isStudent) {
      const hasRecords = Boolean(studentTelemetry && (studentTelemetry.cgpa != null || studentTelemetry.attendanceRate != null));
      const attRate = hasRecords ? studentTelemetry.attendanceRate : (isDemo ? 88.5 : null);
      const cgpa = hasRecords ? studentTelemetry.cgpa : (isDemo ? 8.42 : null);

      return [
        {
          title: 'Academic Intelligence',
          items: [
            { path: '/student/portal', label: 'My Academic Dashboard', icon: GraduationCap, badge: 'Live', tab: 'overview' },
            {
              path: '/student/portal?tab=academic',
              label: 'Attendance & Courses',
              icon: BookOpen,
              badge: attRate != null ? `${Math.round(attRate)}%` : 'Pending',
              tab: 'academic',
            },
            {
              path: '/student/portal?tab=placement',
              label: 'Placement Readiness',
              icon: Award,
              badge: cgpa != null ? (cgpa >= 8.0 ? 'Tier-1' : 'Core') : 'Pending',
              tab: 'placement',
            },
          ],
        },
        {
          title: 'Support & Guidance',
          items: [
            { path: '/student/portal?tab=interventions', label: 'My Support Programs', icon: Sparkles, badge: 'Active', tab: 'interventions' },
            { path: '/student/portal?tab=feedback', label: 'Feedback & Suggestions', icon: MessageSquareHeart, badge: null, tab: 'feedback' },
          ],
        },
      ];
    }

    if (currentUser?.role === 'faculty_mentor') {
      const menteesCount = totalStudents != null ? Math.max(1, Math.round(totalStudents / (liveKpis?.departmentCount || 5))) : 25;
      return [
        {
          title: 'Department Overview',
          items: [
            { path: '/institution/overview', label: 'Faculty Overview', icon: BarChart3, badge: currentUser?.department ? currentUser.department.slice(0, 3).toUpperCase() : 'CSE' },
            { path: '/institution/students', label: 'Mentees Directory', icon: Users, badge: `${menteesCount}` },
            { path: '/institution/risk-radar', label: 'Academic Risk Radar', icon: Target, badge: 'Attendance' },
          ],
        },
        {
          title: 'Support & Guidance',
          items: [
            { path: '/institution/segments', label: 'Student Support Matrix', icon: Layers, badge: null },
            { path: '/institution/feedback', label: 'Campus Feedback', icon: MessageSquareHeart, badge: 'New' },
          ],
        },
      ];
    }

    if (currentUser?.role === 'placement_officer') {
      const eligibleCount = totalStudents != null ? Math.round(totalStudents * 0.72) : 88;
      return [
        {
          title: 'Placement Matrix',
          items: [
            { path: '/institution/overview', label: 'Placement Overview', icon: BarChart3, badge: 'TPO' },
            { path: '/institution/segments', label: 'Placement Readiness Matrix', icon: Layers, badge: 'Tier-1' },
            { path: '/institution/students', label: 'Eligible Candidates Roster', icon: Users, badge: `${eligibleCount} Eligible` },
          ],
        },
        {
          title: 'Recruitment & Prep',
          items: [
            { path: '/institution/risk-radar', label: 'Placement Risk Radar', icon: Target, badge: 'Mock Prep' },
            { path: '/institution/feedback', label: 'Corporate Feedback', icon: MessageSquareHeart, badge: null },
          ],
        },
      ];
    }

    return [
      {
        title: 'Campus Intelligence',
        items: [
          { path: '/institution/overview', label: 'Executive Overview', icon: BarChart3, badge: null },
          {
            path: '/institution/students',
            label: 'Student 360° Directory',
            icon: Users,
            badge: totalStudents != null && totalStudents > 0 ? totalStudents.toLocaleString() : null,
          },
          { path: '/institution/risk-radar', label: 'Decoupled Risk Radar', icon: Target, badge: null },
          { path: '/institution/segments', label: '2x2 Segmentation Matrix', icon: Layers, badge: null },
        ],
      },
      {
        title: 'Intervention & Policy',
        items: [
          { path: '/institution/sandbox', label: 'Policy Simulation Sandbox', icon: FlaskConical, badge: 'Simulator' },
        ],
      },
      {
        title: 'Data & Governance',
        items: [
          { path: '/institution/ingestion', label: 'Data Integration Studio', icon: UploadCloud, badge: '7 Domains' },
          { path: '/institution/feedback', label: 'Campus Feedback', icon: MessageSquareHeart, badge: null },
          { path: '/institution/audit', label: 'Governance Audit Trail', icon: ShieldCheck, badge: null },
        ],
      },
    ];
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
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        backgroundColor: '#F8FAFC',
        color: '#0F172A',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Mobile Off-Canvas Backdrop Overlay */}
      {isMobile && !isSidebarCollapsed && (
        <div
          onClick={() => setIsSidebarCollapsed(true)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(8, 43, 86, 0.60)',
            backdropFilter: 'blur(3px)',
            zIndex: 95,
            transition: 'opacity 0.25s ease',
          }}
          aria-hidden="true"
        />
      )}

      {/* =========================================================================
          1. CHATGPT ARCHITECTURE WITH PRATIBHA DEEP BRAND NAVY SIDEBAR (#1F0D17)
          ========================================================================= */}
      <aside
        style={{
          width: isSidebarCollapsed ? '0px' : isMobile ? '280px' : '260px',
          minWidth: isSidebarCollapsed ? '0px' : isMobile ? '280px' : '260px',
          maxWidth: isMobile ? '85vw' : '260px',
          transition: 'width 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), min-width 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s ease',
          height: isMobile ? '100dvh' : '100vh',
          maxHeight: isMobile ? '100dvh' : '100vh',
          backgroundColor: '#1F0D17',
          borderRight: isSidebarCollapsed ? 'none' : '1px solid #2E1222',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
          zIndex: isMobile ? 100 : 40,
          position: isMobile ? 'fixed' : 'relative',
          top: 0,
          bottom: 0,
          left: 0,
          boxShadow: isMobile && !isSidebarCollapsed
            ? '6px 0 32px rgba(0, 0, 0, 0.45)'
            : '2px 0 12px rgba(8, 43, 86, 0.12)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* TOP SIDEBAR HEADER */}
          <div style={{ padding: '14px 14px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
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
            className="sidebar-scrollable-nav"
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
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
                      onClick={() => {
                        if (isMobile) setIsSidebarCollapsed(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.72)',
                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                        border: isActive ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent',
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
                        <Icon size={17} color={isActive ? '#F59E0B' : 'rgba(255, 255, 255, 0.65)'} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            padding: '2px 7px',
                            borderRadius: '4px',
                            backgroundColor: isActive ? 'rgba(245, 158, 11, 0.22)' : 'rgba(255, 255, 255, 0.10)',
                            color: isActive ? '#FDE68A' : 'rgba(255, 255, 255, 0.85)',
                            fontWeight: 600,
                            border: isActive ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(255, 255, 255, 0.15)',
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
            flexShrink: 0,
            padding: '10px 12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.10)',
            position: 'relative',
            backgroundColor: '#1F0D17',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Profile Dropdown Popover (Clean White Container) */}
          {isProfileMenuOpen && (
            <div
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {displayName}
                  </span>
                  <span
                    style={{
                      fontSize: '0.64rem',
                      fontWeight: 600,
                      color: '#1677D2',
                      backgroundColor: '#EAF3FF',
                      border: '1px solid #D0E3F8',
                      padding: '1px 7px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {currentUser?.role === 'institution_admin' ? 'Admin' : currentUser?.role === 'faculty_mentor' ? 'Faculty' : currentUser?.role === 'placement_officer' ? 'Placement' : (isStudent ? 'Student' : 'Admin')}
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '3px' }}>
                  {currentUser?.email || (isStudent ? 'student@example.edu' : 'admin@example.edu')}
                </div>
              </div>

              {/* View Profile */}
              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  if (isMobile) setIsSidebarCollapsed(true);
                  navigate(isStudent ? '/student/profile' : '/institution/profile');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#334155',
                  fontSize: '0.80rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s ease',
                  marginTop: '2px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <User size={14} color="#64748B" />
                <span>My Profile & Details</span>
              </button>

              {/* Log out option */}
              <div style={{ borderTop: '1px solid #F1F5F9', marginTop: '4px', paddingTop: '4px' }}>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#EF4444',
                    fontSize: '0.80rem',
                    fontWeight: 500,
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
                  backgroundColor: 'rgba(245, 158, 11, 0.22)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  flexShrink: 0,
                  border: '1.5px solid rgba(245, 158, 11, 0.55)',
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
          minWidth: 0,
          maxWidth: '100%',
          position: 'relative',
        }}
      >
        {/* BALANCED SYMMETRIC TOP HEADER */}
        <header
          style={{
            height: '56px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '0 1rem' : '0 2rem',
            flexShrink: 0,
            zIndex: 30,
            gap: '12px',
          }}
        >
          {/* Left: Sidebar Toggle + Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px', minWidth: 0 }}>
            {(isSidebarCollapsed || isMobile) && (
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                title="Toggle navigation sidebar"
                aria-label="Toggle navigation sidebar"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#1F0D17',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.15s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F1F5F9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Menu size={20} />
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', minWidth: 0, overflow: 'hidden' }}>
              <span style={{ fontWeight: 800, color: '#1F0D17', letterSpacing: '-0.2px', flexShrink: 0 }}>PRATIBHA</span>
              <span style={{ color: '#CBD5E1', flexShrink: 0 }}>/</span>
              <span style={{ color: '#334155', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {findActiveTitle()}
              </span>
            </div>

            <span
              className="hide-on-mobile"
              style={{
                fontSize: '0.70rem',
                color: '#64748B',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: 500,
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {currentUser?.semester
                ? `AY 2026–27 • ${String(currentUser.semester).includes('Sem') ? currentUser.semester : `Sem ${currentUser.semester}`}`
                : (isStudent ? 'AY 2026–27 • Sem 4' : 'AY 2026–27 • Central Cohort')}
            </span>
          </div>

          
        </header>

        {/* SCROLLABLE MAIN CONTENT AREA (WITH AMPLE BOTTOM CLEARANCE FOR MASCOT) */}
        <main className="main-workspace-canvas">
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
          bottom: isMobile ? '16px' : '24px',
          right: isMobile ? '16px' : '28px',
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          border: isCopilotHovered ? '1.5px solid rgba(245, 158, 11, 0.65)' : '1.5px solid rgba(245, 158, 11, 0.35)',
          borderRadius: '12px',
          height: isMobile ? '50px' : '56px',
          minWidth: isMobile ? '50px' : '56px',
          maxWidth: isCopilotHovered ? (isMobile ? '240px' : '320px') : (isMobile ? '50px' : '56px'),
          padding: isCopilotHovered ? (isMobile ? '6px 14px 6px 7px' : '8px 18px 8px 9px') : '6px',
          display: 'flex',
          alignItems: 'center',
          gap: isCopilotHovered ? '10px' : '0px',
          cursor: 'pointer',
          boxShadow: isCopilotHovered
            ? '0 12px 32px rgba(15, 23, 42, 0.6), 0 0 24px rgba(245, 158, 11, 0.4)'
            : '0 8px 24px rgba(15, 23, 42, 0.45), 0 0 16px rgba(245, 158, 11, 0.25)',
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
              backgroundColor: 'rgba(245, 158, 11, 0.16)',
              color: '#F59E0B',
              padding: '3px 8px',
              borderRadius: '4px',
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
        <circle cx="8.5" cy="8.5" r="5" fill="#1E293B" stroke="#F59E0B" strokeWidth="1" />
        <circle cx="8.5" cy="8.5" r="2.6" fill="#F472B6" />

        {/* Right Ear */}
        <circle cx="27.5" cy="8.5" r="5" fill="#1E293B" stroke="#F59E0B" strokeWidth="1" />
        <circle cx="27.5" cy="8.5" r="2.6" fill="#F472B6" />

        {/* Head */}
        <circle cx="18" cy="19" r="13.2" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1.1" />

        {/* Panda Eye Patches */}
        <ellipse cx="12.8" cy="18" rx="3.6" ry="4.2" transform="rotate(-15 12.8 18)" fill="#1E293B" />
        <ellipse cx="23.2" cy="18" rx="3.6" ry="4.2" transform="rotate(15 23.2 18)" fill="#1E293B" />

        {/* Sparkly Pupils with Highlights */}
        <circle cx="13" cy="17.2" r="1.5" fill="#FFFFFF" />
        <circle cx="14.2" cy="18.8" r="0.7" fill="#F59E0B" />
        <circle cx="23" cy="17.2" r="1.5" fill="#FFFFFF" />
        <circle cx="24.2" cy="18.8" r="0.7" fill="#F59E0B" />

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
        <polygon points="18,3 25,6.6 18,10.2 11,6.6" fill="#0284C7" stroke="#F59E0B" strokeWidth="0.8" />
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
