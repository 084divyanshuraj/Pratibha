import React, { createContext, useContext, useState, useEffect } from 'react';

import { api } from '../services/api';

const AuthContext = createContext(null);

const DEMO_CREDENTIALS = {
  admin: { email: 'admin@example.edu', password: 'DemoUser123!' },
  faculty: { email: 'faculty@example.edu', password: 'DemoUser123!' },
  placement: { email: 'placement@example.edu', password: 'DemoUser123!' },
  student: { email: 'student@example.edu', password: 'DemoUser123!' },
};

export const DEMO_PROFILES = {
  admin: {
    id: 'DEMO-ADM-01',
    name: 'Dr. Sunita Rao',
    role: 'institution_admin',
    portal: 'institution',
    roleLabel: 'Institution Administrator',
    email: 'admin@example.edu',
    department: 'All Departments',
  },
  faculty: {
    id: 'DEMO-FAC-02',
    name: 'Prof. Rajesh Kumar',
    role: 'faculty_mentor',
    portal: 'institution',
    roleLabel: 'Faculty Mentor',
    email: 'faculty@example.edu',
    department: 'Computer Science & Engineering',
  },
  placement: {
    id: 'DEMO-TPO-03',
    name: 'Vikram Malhotra',
    role: 'placement_officer',
    portal: 'institution',
    roleLabel: 'Placement Officer',
    email: 'placement@example.edu',
    department: 'Corporate Relations & Training',
  },
  student: {
    id: 'STU_0001',
    name: 'Aarav Sharma',
    role: 'student',
    portal: 'student',
    roleLabel: 'Student (3rd Year B.Tech CSE)',
    email: 'student@example.edu',
    department: 'Computer Science & Engineering',
  },
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('pratibha_demo_user');
      return stored ? JSON.parse(stored) : DEMO_PROFILES.admin;
    } catch {
      return DEMO_PROFILES.admin;
    }
  });

  const [activePortal, setActivePortal] = useState('institution');

  // Automatically authenticate with backend on initial mount
  useEffect(() => {
    const cred = DEMO_CREDENTIALS.admin;
    api.login(cred.email, cred.password).catch(() => {});
  }, []);

  useEffect(() => {
    if (currentUser) {
      try {
        sessionStorage.setItem('pratibha_demo_user', JSON.stringify(currentUser));
      } catch {
        // sessionStorage unavailable
      }
    } else {
      sessionStorage.removeItem('pratibha_demo_user');
      sessionStorage.removeItem('pratibha_token');
    }
  }, [currentUser]);

  const loginWithDemo = async (profileKey) => {
    const profile = DEMO_PROFILES[profileKey] || DEMO_PROFILES.admin;
    const cred = DEMO_CREDENTIALS[profileKey] || DEMO_CREDENTIALS.admin;
    setCurrentUser(profile);
    setActivePortal(profile.portal);

    try {
      const res = await api.login(cred.email, cred.password);
      if (res?.accessToken) {
        sessionStorage.setItem('pratibha_token', res.accessToken);
      }
    } catch (err) {
      console.warn('Backend login fallback active:', err);
    }

    return profile;
  };

  const loginWithCredentials = async (email, password, selectedPortal = 'institution') => {
    try {
      const res = await api.login(email, password);
      const user = res?.user || {};
      const profile = {
        id: user.id || `USR_${Date.now()}`,
        name: user.displayName || email.split('@')[0],
        role: user.role || (selectedPortal === 'student' ? 'student' : 'institution_admin'),
        portal: selectedPortal,
        roleLabel: user.role === 'admin' ? 'Institution Administrator' : selectedPortal === 'student' ? 'Student' : 'Campus Faculty',
        email: email.trim(),
        department: 'General Engineering',
      };
      setCurrentUser(profile);
      setActivePortal(selectedPortal);
      return profile;
    } catch {
      // In mock fallback mode, resolve matching persona or construct profile
      let matched = Object.values(DEMO_PROFILES).find(
        (p) => p.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (!matched) {
        matched = {
          id: `DEMO-USR-${Math.floor(100 + Math.random() * 900)}`,
          name: email.split('@')[0],
          role: selectedPortal === 'student' ? 'student' : 'institution_admin',
          portal: selectedPortal,
          roleLabel: selectedPortal === 'student' ? 'Demo Student' : 'Demo Institution User',
          email: email.trim(),
          department: 'General Engineering',
        };
      }

      setCurrentUser(matched);
      setActivePortal(matched.portal);
      return matched;
    }
  };

  const registerWithCredentials = async (username, email, password, selectedPortal = 'student') => {
    try {
      const res = await api.register({ username, email, password, portal: selectedPortal });
      const user = res?.user || {};
      const profile = {
        id: user.id || `USR_${Date.now()}`,
        name: user.displayName || username || email.split('@')[0],
        role: user.role || (selectedPortal === 'student' ? 'student' : 'faculty_mentor'),
        portal: selectedPortal,
        roleLabel: selectedPortal === 'student' ? 'Student' : 'Faculty Mentor',
        email: email.trim(),
        department: 'General Engineering',
      };
      setCurrentUser(profile);
      setActivePortal(selectedPortal);
      return profile;
    } catch {
      const profile = {
        id: `DEMO-REG-${Math.floor(100 + Math.random() * 900)}`,
        name: username || email.split('@')[0],
        role: selectedPortal === 'student' ? 'student' : 'faculty_mentor',
        portal: selectedPortal,
        roleLabel: selectedPortal === 'student' ? 'Registered Student' : 'Registered Faculty',
        email: email.trim(),
        department: 'General Engineering',
      };
      setCurrentUser(profile);
      setActivePortal(selectedPortal);
      return profile;
    }
  };

  const loginWithGoogle = async (selectedPortal = 'student', customAccount = null) => {
    let googleUser = customAccount;

    if (!googleUser) {
      googleUser = await signInWithGoogleFirebase();
    }

    const isStudent = selectedPortal === 'student';
    const profile = {
      id: googleUser.id || `GOOGLE_${Date.now()}`,
      name: googleUser.name || (isStudent ? 'Aarav Sharma' : 'Dr. Sunita Rao'),
      email: googleUser.email || (isStudent ? 'aarav.sharma@campus.edu' : 'sunita.rao@campus.edu'),
      role: isStudent ? 'student' : 'institution_admin',
      portal: selectedPortal,
      roleLabel: isStudent ? 'Student (Google SSO)' : 'Administrator (Google SSO)',
      avatar: googleUser.avatar || 'https://lh3.googleusercontent.com/a/default-user=s96-c',
      authProvider: 'firebase_google',
      department: isStudent ? 'Computer Science & Engineering' : 'Campus Administration',
    };

    setCurrentUser(profile);
    setActivePortal(selectedPortal);
    return profile;
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('pratibha_demo_user');
    sessionStorage.removeItem('pratibha_token');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activePortal,
        setActivePortal,
        loginWithDemo,
        loginWithCredentials,
        registerWithCredentials,
        loginWithGoogle,
        logout,
        DEMO_PROFILES,
        isAuthenticated: !!currentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
