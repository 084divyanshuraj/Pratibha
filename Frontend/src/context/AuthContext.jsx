import React, { createContext, useContext, useState, useEffect } from 'react';

import { api } from '../services/api';
import { signInWithGoogleFirebase } from '../services/firebase';

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

  // On initial mount: if active JWT token exists, verify with backend /auth/me
  useEffect(() => {
    const token = sessionStorage.getItem('pratibha_token') || localStorage.getItem('pratibha_token');
    if (token) {
      api.getProfile().then((userData) => {
        if (userData) {
          let backendRole = userData.role;
          if (backendRole === 'admin') backendRole = 'institution_admin';
          if (backendRole === 'faculty') backendRole = 'faculty_mentor';
          const isStudent = backendRole === 'student';

          setCurrentUser({
            id: userData.id,
            name: userData.displayName || userData.name,
            username: userData.username,
            email: userData.email,
            role: backendRole,
            portal: isStudent ? 'student' : 'institution',
            roleLabel: userData.designation || (isStudent ? 'Registered Student' : 'Institution Staff'),
            department: userData.department,
            avatar: userData.avatar,
            phone: userData.phone,
            bio: userData.bio,
            studentId: userData.studentId,
            skills: userData.skills,
          });
          setActivePortal(isStudent ? 'student' : 'institution');
        }
      }).catch(() => {});
    }
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

  const loginWithCredentials = async (identifier, password, selectedPortal = 'institution', specificRole = null, rememberMe = true) => {
    const rawTrimmed = identifier.trim();
    const lowerIdentifier = rawTrimmed.toLowerCase();

    // Determine fallback role based on specificRole or identifier pattern
    let resolvedRole = specificRole;
    if (!resolvedRole) {
      if (selectedPortal === 'student' || lowerIdentifier.includes('student')) {
        resolvedRole = 'student';
      } else if (lowerIdentifier.includes('faculty') || lowerIdentifier.includes('mentor') || lowerIdentifier.includes('rajesh')) {
        resolvedRole = 'faculty_mentor';
      } else if (lowerIdentifier.includes('placement') || lowerIdentifier.includes('tpo') || lowerIdentifier.includes('vikram')) {
        resolvedRole = 'placement_officer';
      } else {
        resolvedRole = 'institution_admin';
      }
    }

    let defaultRoleLabel = 'Institution Administrator';
    let defaultDepartment = 'All Departments';
    if (resolvedRole === 'faculty_mentor') {
      defaultRoleLabel = 'Faculty Mentor & HOD';
      defaultDepartment = 'Computer Science & Engineering';
    } else if (resolvedRole === 'placement_officer') {
      defaultRoleLabel = 'Placement Officer (TPO)';
      defaultDepartment = 'Corporate Relations & Training';
    } else if (resolvedRole === 'student') {
      defaultRoleLabel = 'Student (3rd Year B.Tech CSE)';
      defaultDepartment = 'Computer Science & Engineering';
    }

    try {
      const res = await api.login(rawTrimmed, password);
      if (res?.accessToken) {
        sessionStorage.setItem('pratibha_token', res.accessToken);
        if (rememberMe) {
          localStorage.setItem('pratibha_token', res.accessToken);
        }
      }
      const user = res?.user || {};
      let backendRole = user.role;
      if (backendRole === 'admin') backendRole = 'institution_admin';
      if (backendRole === 'faculty') backendRole = 'faculty_mentor';

      const finalRole = specificRole || backendRole || resolvedRole;
      const isStudentPortal = selectedPortal === 'student' || finalRole === 'student';

      const profile = {
        id: user.id || `USR_${Date.now()}`,
        name: user.displayName || user.name || (finalRole === 'faculty_mentor' ? 'Prof. Rajesh Kumar' : finalRole === 'placement_officer' ? 'Vikram Malhotra' : finalRole === 'student' ? 'Aarav Sharma' : 'Dr. Sunita Rao'),
        username: user.username || null,
        role: finalRole,
        portal: isStudentPortal ? 'student' : 'institution',
        roleLabel: user.designation || user.roleLabel || defaultRoleLabel,
        email: user.email || rawTrimmed,
        department: user.department || defaultDepartment,
        avatar: user.avatar || null,
        phone: user.phone || null,
        bio: user.bio || null,
        studentId: user.studentId || null,
        skills: user.skills || [],
      };
      setCurrentUser(profile);
      setActivePortal(profile.portal);
      return profile;
    } catch (err) {
      // Re-throw validation or auth errors so the login UI can display them
      if (err.status && err.status < 500) {
        throw err;
      }

      // Offline mock fallback if network is completely down
      let matched = Object.values(DEMO_PROFILES).find(
        (p) => p.email.toLowerCase() === lowerIdentifier || (p.role === resolvedRole && p.portal === selectedPortal)
      );

      if (!matched) {
        matched = {
          id: `DEMO-USR-${Math.floor(100 + Math.random() * 900)}`,
          name: resolvedRole === 'faculty_mentor' ? 'Prof. Rajesh Kumar' : resolvedRole === 'placement_officer' ? 'Vikram Malhotra' : resolvedRole === 'student' ? 'Aarav Sharma' : 'Dr. Sunita Rao',
          role: resolvedRole,
          portal: selectedPortal,
          roleLabel: defaultRoleLabel,
          email: rawTrimmed,
          department: defaultDepartment,
        };
      }

      setCurrentUser(matched);
      setActivePortal(matched.portal);
      return matched;
    }
  };

  const registerWithCredentials = async (username, email, password, selectedPortal = 'student', specificRole = null) => {
    const assignedRole = selectedPortal === 'student'
      ? 'student'
      : (specificRole || 'institution_admin');

    let defaultRoleLabel = 'Institution Administrator';
    let defaultDepartment = 'Campus Administration';

    if (assignedRole === 'faculty_mentor') {
      defaultRoleLabel = 'Faculty Mentor & HOD';
      defaultDepartment = 'Computer Science & Engineering';
    } else if (assignedRole === 'placement_officer') {
      defaultRoleLabel = 'Placement Officer (TPO)';
      defaultDepartment = 'Corporate Relations & Career Cell';
    } else if (assignedRole === 'student') {
      defaultRoleLabel = 'Registered Student';
      defaultDepartment = 'Computer Science & Engineering';
    }

    try {
      const res = await api.register({
        username: username.trim(),
        email: email.trim(),
        password,
        portal: selectedPortal,
        role: assignedRole,
        displayName: username.trim(),
      });
      if (res?.accessToken) {
        sessionStorage.setItem('pratibha_token', res.accessToken);
        localStorage.setItem('pratibha_token', res.accessToken);
      }
      const user = res?.user || {};
      let backendRole = user.role;
      if (backendRole === 'admin') backendRole = 'institution_admin';
      if (backendRole === 'faculty') backendRole = 'faculty_mentor';

      const finalRole = specificRole || backendRole || assignedRole;
      const isStudentPortal = selectedPortal === 'student' || finalRole === 'student';

      const profile = {
        id: user.id || `USR_${Date.now()}`,
        name: user.displayName || username || email.split('@')[0],
        username: user.username || username,
        role: finalRole,
        portal: isStudentPortal ? 'student' : 'institution',
        roleLabel: user.roleLabel || defaultRoleLabel,
        email: email.trim(),
        department: user.department || defaultDepartment,
        studentId: user.studentId || null,
      };
      setCurrentUser(profile);
      setActivePortal(isStudentPortal ? 'student' : 'institution');
      return profile;
    } catch (err) {
      if (err.status && err.status < 500) {
        throw err;
      }
      const profile = {
        id: `DEMO-REG-${Math.floor(100 + Math.random() * 900)}`,
        name: username || email.split('@')[0],
        username,
        role: assignedRole,
        portal: selectedPortal,
        roleLabel: defaultRoleLabel,
        email: email.trim(),
        department: defaultDepartment,
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

  const updateUserProfile = async (updatedData) => {
    try {
      const serverResponse = await api.updateProfile(updatedData);
      const serverUser = serverResponse?.data || serverResponse || {};
      const merged = {
        ...currentUser,
        ...serverUser,
        ...updatedData,
        name: updatedData.name || updatedData.displayName || currentUser?.name,
        displayName: updatedData.displayName || updatedData.name || currentUser?.displayName,
      };
      setCurrentUser(merged);
      try {
        sessionStorage.setItem('pratibha_demo_user', JSON.stringify(merged));
        localStorage.setItem(`pratibha_profile_${merged.email || merged.id}`, JSON.stringify(merged));
      } catch {}
      return merged;
    } catch {
      const merged = {
        ...currentUser,
        ...updatedData,
        name: updatedData.name || updatedData.displayName || currentUser?.name,
        displayName: updatedData.displayName || updatedData.name || currentUser?.displayName,
      };
      setCurrentUser(merged);
      try {
        sessionStorage.setItem('pratibha_demo_user', JSON.stringify(merged));
        localStorage.setItem(`pratibha_profile_${merged.email || merged.id}`, JSON.stringify(merged));
      } catch {}
      return merged;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('pratibha_demo_user');
    sessionStorage.removeItem('pratibha_token');
    localStorage.removeItem('pratibha_demo_user');
    localStorage.removeItem('pratibha_token');
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
        updateUserProfile,
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
