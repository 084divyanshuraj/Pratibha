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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import CopilotDrawer from '../copilot/CopilotDrawer';

const NAV_ITEMS = [
  { path: '/institution/overview', label: 'Executive Overview', icon: BarChart3, badge: null },
  { path: '/institution/students', label: 'Student 360° Directory', icon: Users, badge: '1,420' },
  { path: '/institution/risk-radar', label: 'Decoupled Risk Radar', icon: Target, badge: 'ML' },
  { path: '/institution/segments', label: 'Student Archetypes', icon: Layers, badge: '5' },
  { path: '/institution/sandbox', label: 'Intervention Sandbox', icon: FlaskConical, badge: 'Simulator' },
  { path: '/institution/ingestion', label: 'Batch Data Studio', icon: UploadCloud, badge: '8 Pillars' },
  { path: '/institution/feedback', label: 'Campus Feedback', icon: MessageSquareHeart, badge: null },
  { path: '/institution/audit', label: 'Security & Audit Trail', icon: ShieldCheck, badge: 'Admin' },
  { path: '/student/portal', label: 'Student Self-Portal', icon: GraduationCap, badge: 'Demo' },
];

export default function AppLayout({ children }) {
  const { currentUser, logout, loginWithDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [backendLive, setBackendLive] = useState(false);

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
                backgroundColor: '#1A73E8',
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
              Student Success Intelligence Platform
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
            <span>{backendLive ? 'Live API (port 5000)' : 'Synthetic Fixtures Mode'}</span>
          </div>
        </div>

        {/* Role Switcher & Persona Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Switch Persona:</span>
            <select
              value={currentUser?.role === 'student' ? 'student' : currentUser?.role === 'faculty_mentor' ? 'faculty' : currentUser?.role === 'placement_officer' ? 'placement' : 'admin'}
              onChange={(e) => {
                loginWithDemo(e.target.value);
                if (e.target.value === 'student') navigate('/student/portal');
                else navigate('/institution/overview');
              }}
              style={{
                backgroundColor: '#1E293B',
                color: '#F8FAFC',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.78rem',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="admin">Administrator (Dr. Sunita Rao)</option>
              <option value="faculty">Faculty Mentor (Prof. Rajesh Kumar)</option>
              <option value="placement">Placement Officer (Vikram Malhotra)</option>
              <option value="student">Student (Aarav Sharma - CSE)</option>
            </select>
          </div>

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
          style={{
            width: '260px',
            backgroundColor: '#FFFFFF',
            borderRight: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '1.25rem 0.75rem',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ padding: '0 0.5rem 0.75rem', fontSize: '0.72rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Intelligence Modules
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

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
                      color: isActive ? '#1A73E8' : '#475569',
                      backgroundColor: isActive ? '#EBF3FE' : 'transparent',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.86rem',
                      transition: 'all 150ms ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon size={18} color={isActive ? '#1A73E8' : '#64748B'} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          padding: '2px 6px',
                          borderRadius: '999px',
                          backgroundColor: isActive ? '#1A73E8' : '#F1F5F9',
                          color: isActive ? '#FFFFFF' : '#64748B',
                          fontWeight: 600,
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
            style={{
              padding: '12px',
              borderRadius: '10px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#1E293B',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '0.85rem',
                flexShrink: 0,
              }}
            >
              {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {currentUser?.name || 'Administrator'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {currentUser?.department || 'Institution Provost'}
              </div>
            </div>
          </div>
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
        <span>Ask Campus Copilot</span>
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
