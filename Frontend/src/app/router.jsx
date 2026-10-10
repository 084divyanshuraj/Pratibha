import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/public/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';

// Layout Shell
import AppLayout from '../components/layout/AppLayout';

// Enterprise Platform Pages (Option A Overhaul)
import OverviewPage from '../pages/institution/OverviewPage';
import StudentDirectoryPage from '../pages/institution/StudentDirectoryPage';
import RiskRadarPage from '../pages/institution/RiskRadarPage';
import SegmentsPage from '../pages/institution/SegmentsPage';
import SandboxPage from '../pages/institution/SandboxPage';
import IngestionPage from '../pages/institution/IngestionPage';
import FeedbackPage from '../pages/institution/FeedbackPage';
import AuditPage from '../pages/institution/AuditPage';

// Student Self-Service Portal
import StudentPortalPage from '../pages/student/StudentPortalPage';

// Shared User Profile & Account Settings
import ProfilePage from '../pages/shared/ProfilePage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* 1. Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* 2. Institutional Intelligence Routes (Wrapped in AppLayout) */}
      <Route
        path="/institution/overview"
        element={
          <AppLayout>
            <OverviewPage />
          </AppLayout>
        }
      />
      <Route
        path="/institution/students"
        element={
          <AppLayout>
            <StudentDirectoryPage />
          </AppLayout>
        }
      />
      <Route
        path="/institution/risk-radar"
        element={
          <AppLayout>
            <RiskRadarPage />
          </AppLayout>
        }
      />
      <Route
        path="/institution/segments"
        element={
          <AppLayout>
            <SegmentsPage />
          </AppLayout>
        }
      />
      <Route
        path="/institution/sandbox"
        element={
          <AppLayout>
            <SandboxPage />
          </AppLayout>
        }
      />
      <Route
        path="/institution/ingestion"
        element={
          <AppLayout>
            <IngestionPage />
          </AppLayout>
        }
      />
      <Route
        path="/institution/feedback"
        element={
          <AppLayout>
            <FeedbackPage />
          </AppLayout>
        }
      />
      <Route
        path="/institution/audit"
        element={
          <AppLayout>
            <AuditPage />
          </AppLayout>
        }
      />
      <Route
        path="/institution/profile"
        element={
          <AppLayout>
            <ProfilePage />
          </AppLayout>
        }
      />

      {/* Backward Compatibility Redirects */}
      <Route path="/institution/dashboard" element={<Navigate to="/institution/overview" replace />} />
      <Route path="/institution" element={<Navigate to="/institution/overview" replace />} />

      {/* 3. Student Self-Portal Routes (Wrapped in AppLayout) */}
      <Route
        path="/student/portal"
        element={
          <AppLayout>
            <StudentPortalPage />
          </AppLayout>
        }
      />
      <Route
        path="/student/profile"
        element={
          <AppLayout>
            <ProfilePage />
          </AppLayout>
        }
      />
      <Route path="/student/dashboard" element={<Navigate to="/student/portal" replace />} />
      <Route path="/student" element={<Navigate to="/student/portal" replace />} />

      {/* 4. Common Profile Route */}
      <Route
        path="/profile"
        element={
          <AppLayout>
            <ProfilePage />
          </AppLayout>
        }
      />

      {/* 4. Catch-All 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
