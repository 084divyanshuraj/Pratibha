import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const DEMO_PROFILES = {
  admin: {
    id: 'DEMO-ADM-01',
    name: 'Dr. Sunita Rao',
    role: 'institution_admin',
    portal: 'institution',
    roleLabel: 'Institution Administrator',
    email: 'admin@pratibha.edu',
    department: 'All Departments',
  },
  faculty: {
    id: 'DEMO-FAC-02',
    name: 'Prof. Rajesh Kumar',
    role: 'faculty_mentor',
    portal: 'institution',
    roleLabel: 'Faculty Mentor',
    email: 'mentor@pratibha.edu',
    department: 'Computer Science & Engineering',
  },
  placement: {
    id: 'DEMO-TPO-03',
    name: 'Vikram Malhotra',
    role: 'placement_officer',
    portal: 'institution',
    roleLabel: 'Placement Officer',
    email: 'tpo@pratibha.edu',
    department: 'Corporate Relations & Training',
  },
  student: {
    id: 'STU-2024-042',
    name: 'Aarav Sharma',
    role: 'student',
    portal: 'student',
    roleLabel: 'Student (3rd Year B.Tech CSE)',
    email: 'aarav.sharma@pratibha.edu',
    department: 'Computer Science & Engineering',
  },
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('pratibha_demo_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [activePortal, setActivePortal] = useState('institution');

  useEffect(() => {
    if (currentUser) {
      try {
        sessionStorage.setItem('pratibha_demo_user', JSON.stringify(currentUser));
      } catch {
        // sessionStorage unavailable
      }
    } else {
      sessionStorage.removeItem('pratibha_demo_user');
    }
  }, [currentUser]);

  const loginWithDemo = (profileKey) => {
    const profile = DEMO_PROFILES[profileKey] || DEMO_PROFILES.admin;
    setCurrentUser(profile);
    setActivePortal(profile.portal);
    return profile;
  };

  const loginWithCredentials = (email, password, selectedPortal = 'institution') => {
    // In mock demo mode, resolve matching persona or construct demo profile
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
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('pratibha_demo_user');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activePortal,
        setActivePortal,
        loginWithDemo,
        loginWithCredentials,
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
