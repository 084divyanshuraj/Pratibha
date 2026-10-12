import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  GraduationCap,
  Award,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  BookOpen,
  TrendingUp,
  Clock,
  Sparkles,
  Target,
  Send,
  Star,
  Shield,
  ShieldAlert,
  Layers,
  ChevronRight,
  Download,
  Printer,
  Check,
  PlusCircle,
  Briefcase,
  Code2,
  Sliders,
  HelpCircle,
  Zap,
  Info,
  User,
  Mail,
  Building,
  RefreshCw,
  Database,
  FileSpreadsheet,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { STUDENT_AVATARS } from '../../assets/images';

export default function StudentPortalPage() {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab routing
  const tabFromUrl = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    const currentTabParam = searchParams.get('tab') || 'overview';
    setActiveTab(currentTabParam);
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams(newTab === 'overview' ? {} : { tab: newTab });
  };

  // Detect whether this is the pre-configured demo student (Aarav Sharma) vs a real user
  const isDemoStudent =
    !currentUser ||
    currentUser?.email === 'student@example.edu' ||
    currentUser?.studentId === 'STU_0001' ||
    currentUser?.studentId === 'STU_DEMO_01' ||
    currentUser?.role === 'demo_student';

  // College Ingestion Status (true = records found in DB or demo, false = awaiting admin CSV upload)
  const [hasCollegeRecords, setHasCollegeRecords] = useState(isDemoStudent);
  const [recheckLoading, setRecheckLoading] = useState(false);
  const [recheckFeedback, setRecheckFeedback] = useState('');
  const [recheckCounter, setRecheckCounter] = useState(0);

  // Self-Declared Student Goals (Accessible anytime, even when awaiting college records)
  const [targetCgpa, setTargetCgpa] = useState(() => localStorage.getItem('pratibha_target_cgpa') || '8.5');
  const [targetCareer, setTargetCareer] = useState(() => localStorage.getItem('pratibha_target_career') || 'Software Development Engineer');
  const [targetSkills, setTargetSkills] = useState(() => localStorage.getItem('pratibha_target_skills') || 'Data Structures, Cloud Systems, System Design');
  const [goalsSaved, setGoalsSaved] = useState(false);

  const handleSaveGoals = (e) => {
    e.preventDefault();
    localStorage.setItem('pratibha_target_cgpa', targetCgpa);
    localStorage.setItem('pratibha_target_career', targetCareer);
    localStorage.setItem('pratibha_target_skills', targetSkills);
    setGoalsSaved(true);
    setTimeout(() => setGoalsSaved(false), 3000);
  };

  // Student Identity & State
  const [student, setStudent] = useState({
    studentId: currentUser?.studentId || (isDemoStudent ? 'STU-2024-0042' : 'ROLL_PENDING'),
    fullName: currentUser?.name || currentUser?.displayName || (isDemoStudent ? 'Aarav Sharma' : 'Student Scholar'),
    avatar: currentUser?.avatar || STUDENT_AVATARS[0],
    program:
      currentUser?.program ||
      (currentUser?.department ? `B.Tech in ${currentUser.department}` : (isDemoStudent ? 'B.Tech in Computer Science' : 'B.Tech Program')),
    semester: currentUser?.semester
      ? (String(currentUser.semester).toLowerCase().includes('semester')
          ? currentUser.semester
          : `Semester ${currentUser.semester}`)
      : (isDemoStudent ? 'Semester 6' : 'Semester 1'),
    email: currentUser?.email || 'student@campus.edu',
    cgpa: isDemoStudent ? 8.42 : null,
    attendanceRate: isDemoStudent ? 88.5 : null,
    successScore: isDemoStudent ? 78.4 : null,
    academicRisk: isDemoStudent ? 'Low' : 'Pending Data',
    placementRisk: isDemoStudent ? 'Low to Moderate' : 'Pending Data',
    dataCompleteness: isDemoStudent ? 100 : 0,
  });

  const [predictionsData, setPredictionsData] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [loadingLive, setLoadingLive] = useState(false);

  // Manual / Reactive re-check of college records
  const handleRecheckRecords = async () => {
    setRecheckLoading(true);
    setRecheckFeedback('');
    try {
      const studentIdToFetch = currentUser?.studentId || '';
      const emailToFetch = currentUser?.email || '';

      const [studentsRes, recordsRes] = await Promise.all([
        api.getStudents({ search: studentIdToFetch || emailToFetch }).catch(() => null),
        studentIdToFetch ? api.getStudentRecords(studentIdToFetch).catch(() => null) : Promise.resolve(null),
      ]);

      const match = studentsRes?.students?.find(
        (s) => (studentIdToFetch && s.studentId === studentIdToFetch) || (emailToFetch && s.email === emailToFetch)
      );

      const hasData = Boolean(
        match && (
          match.cgpa != null ||
          match.attendanceRate != null ||
          recordsRes?.counts?.academic > 0 ||
          recordsRes?.counts?.attendance > 0
        )
      );

      if (hasData) {
        setHasCollegeRecords(true);
        setRecheckFeedback('✅ Great news! Real college records found and linked.');
        setRecheckCounter((c) => c + 1);
      } else {
        setHasCollegeRecords(false);
        setRecheckFeedback('ℹ️ College administration has not yet uploaded semester CSV sheets for Roll No ' + (studentIdToFetch || 'your ID') + '. Please check back once results are announced.');
      }
    } catch {
      setRecheckFeedback('⚠️ Unable to query institutional records database right now. Please try again.');
    } finally {
      setRecheckLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      setStudent((prev) => ({
        ...prev,
        studentId: currentUser.studentId || prev.studentId,
        fullName: currentUser.name || currentUser.displayName || prev.fullName,
        avatar: currentUser.avatar || prev.avatar,
        program:
          currentUser.program ||
          (currentUser.department ? `B.Tech in ${currentUser.department}` : prev.program),
        semester: currentUser.semester
          ? (String(currentUser.semester).toLowerCase().includes('semester')
              ? currentUser.semester
              : `Semester ${currentUser.semester}`)
          : prev.semester,
        email: currentUser.email || prev.email,
      }));
    }

    // 1. DEMO STUDENT MODE: Load seeded benchmark persona
    if (isDemoStudent) {
      setHasCollegeRecords(true);
      const studentIdToFetch = 'STU_0001';
      setLoadingLive(true);
      Promise.all([
        api.getStudentSuccessScore(studentIdToFetch).catch(() => null),
        api.getStudentPredictions(studentIdToFetch).catch(() => null),
        api.getStudents({ search: studentIdToFetch }).catch(() => null),
      ])
        .then(([scoreRes, predRes, studentsRes]) => {
          setScoreData(scoreRes);
          setPredictionsData(predRes);
          const match = studentsRes?.students?.find((s) => s.studentId === studentIdToFetch) || studentsRes?.students?.[0];
          if (match) {
            setStudent((prev) => ({
              ...prev,
              cgpa: match.cgpa ?? 8.42,
              attendanceRate: match.attendanceRate ?? 88.5,
              successScore: match.successScore ?? 78.4,
              academicRisk: match.academicRisk ?? 'low',
              placementRisk: match.placementRisk ?? 'low',
              dataCompleteness: match.dataCompleteness ?? 100,
            }));
          }
        })
        .finally(() => setLoadingLive(false));
      return;
    }

    // 2. REAL STUDENT MODE: Strict lookup by Roll No / studentId and Email (NO fallback to students[0])
    const realStudentId = currentUser?.studentId;
    const realEmail = currentUser?.email;

    if (!realStudentId && !realEmail) {
      setHasCollegeRecords(false);
      return;
    }

    setLoadingLive(true);
    Promise.all([
      realStudentId ? api.getStudentSuccessScore(realStudentId).catch(() => null) : Promise.resolve(null),
      realStudentId ? api.getStudentPredictions(realStudentId).catch(() => null) : Promise.resolve(null),
      api.getStudents({ search: realStudentId || realEmail }).catch(() => null),
      realStudentId ? api.getStudentRecords(realStudentId).catch(() => null) : Promise.resolve(null),
    ])
      .then(([scoreRes, predRes, studentsRes, recordsRes]) => {
        // Strict Match: Match by exact studentId or email. NEVER use students[0] fallback!
        const match = studentsRes?.students?.find(
          (s) => (realStudentId && s.studentId === realStudentId) || (realEmail && s.email === realEmail)
        );

        const hasRealData = Boolean(
          match && (
            match.cgpa != null ||
            match.attendanceRate != null ||
            (recordsRes?.counts?.academic > 0 || recordsRes?.counts?.attendance > 0)
          )
        );

        if (hasRealData) {
          setHasCollegeRecords(true);
          setScoreData(scoreRes);
          setPredictionsData(predRes);
          setStudent((prev) => ({
            ...prev,
            cgpa: match.cgpa ?? null,
            attendanceRate: match.attendanceRate ?? null,
            successScore: match.successScore ?? scoreRes?.score ?? null,
            academicRisk: match.academicRisk ?? 'Low',
            placementRisk: match.placementRisk ?? 'Low',
            dataCompleteness: match.dataCompleteness ?? scoreRes?.dataCompleteness ?? 100,
          }));
        } else {
          // No records uploaded yet by Admin for this registered student
          setHasCollegeRecords(false);
          setScoreData(null);
          setPredictionsData(null);
          setStudent((prev) => ({
            ...prev,
            cgpa: null,
            attendanceRate: null,
            successScore: null,
            academicRisk: 'Pending Data',
            placementRisk: 'Pending Data',
            dataCompleteness: 0,
          }));
        }
      })
      .catch((err) => {
        console.warn('StudentPortal live fetch error:', err);
        setHasCollegeRecords(false);
      })
      .finally(() => setLoadingLive(false));
  }, [currentUser, recheckCounter]);

  // Score Drivers (Explainable PRD compliance)
  const scoreDrivers = useMemo(() => {
    if (scoreData?.drivers && scoreData.drivers.length > 0) {
      return scoreData.drivers.map((d) => ({
        title: d.name,
        score: d.contribution ? Math.min(100, Math.round(d.contribution * 3.2)) : 80,
        weight: '25%',
        contribution: `+${d.contribution}`,
        detail: `Deterministic attribution from sss-v1 normalized domain feature weights`,
      }));
    }
    return [
      { title: 'Academic Performance', score: Math.round(student.cgpa * 10), weight: '35%', contribution: '+29.4', detail: 'Consistent SGPA progression across core semester courses' },
      { title: 'Classroom Attendance', score: Math.round(student.attendanceRate), weight: '20%', contribution: '+17.7', detail: `${student.attendanceRate}% aggregate attendance, compared with 75% limit` },
      { title: 'Placement Readiness & Tests', score: 76.0, weight: '20%', contribution: '+15.2', detail: 'Aptitude percentile and mock technical coding assessments' },
      { title: 'Digital LMS Activity', score: 82.0, weight: '15%', contribution: '+12.3', detail: 'Regular assignment submissions and digital portal engagements' },
      { title: 'Clubs & Extra-Curriculars', score: 72.0, weight: '10%', contribution: '+3.8', detail: 'Student chapter participation and hackathon entries' },
    ];
  }, [scoreData, student.cgpa, student.attendanceRate]);

  // Attendance Courses Telemetry
  const [attendanceCourses] = useState([
    { code: 'CS301', name: 'Distributed Operating Systems', instructor: 'Dr. Ramesh Chandra', attended: 44, total: 50, pct: 88, margin: '+6 classes' },
    { code: 'CS302', name: 'Database Management Systems', instructor: 'Prof. Ananya Sen', attended: 46, total: 50, pct: 92, margin: '+8 classes' },
    { code: 'CS303', name: 'Design & Analysis of Algorithms', instructor: 'Dr. Vivek Verma', attended: 42, total: 50, pct: 84, margin: '+4 classes' },
    { code: 'CS304', name: 'Compiler Engineering', instructor: 'Prof. Sunita Rao', attended: 38, total: 50, pct: 76, warning: true, margin: '+1 class' },
  ]);

  // Interactive Attendance Simulator
  const [simExtraClasses, setSimExtraClasses] = useState(10);
  const totalHeld = attendanceCourses.reduce((acc, c) => acc + c.total, 0);
  const totalAttended = attendanceCourses.reduce((acc, c) => acc + c.attended, 0);
  const simulatedPct = (((totalAttended + simExtraClasses) / (totalHeld + simExtraClasses)) * 100).toFixed(1);

  // Enrolled and Available Interventions
  const [enrolledInterventions, setEnrolledInterventions] = useState([
    {
      id: 'INT-01',
      title: 'Technical Mock Interview & Aptitude Bootcamp',
      type: 'Career Acceleration',
      date: 'Starting Next Monday (10:00 AM)',
      venue: 'Lab 302 / Placement Center',
      status: 'Active',
      mentor: 'Prof. Rajesh Kumar',
    },
    {
      id: 'INT-02',
      title: 'Competitive Coding & DSA Mentorship',
      type: 'Skill Enhancement',
      date: 'Every Wednesday (4:00 PM)',
      venue: 'Seminar Hall B',
      status: 'Active',
      mentor: 'ACM Student Scholars',
    },
  ]);

  const [availableWorkshops, setAvailableWorkshops] = useState([
    {
      id: 'INT-03',
      title: 'Soft Skills, Group Discussion & Corporate Presence',
      type: 'Placement Finishing School',
      date: 'This Saturday (2:00 PM)',
      venue: 'Auditorium 2',
      mentor: 'Vikram Malhotra (TPO Head)',
      seatsLeft: 8,
    },
    {
      id: 'INT-04',
      title: 'Cloud Native & Docker Essentials Masterclass',
      type: 'Industry Certification',
      date: 'Starting Next Friday (5:00 PM)',
      venue: 'Virtual Cloud Lab',
      mentor: 'Visiting Cloud Architect',
      seatsLeft: 14,
    },
  ]);

  // Career Roadmap Checklist
  const [careerTasks, setCareerTasks] = useState([
    { id: 1, text: 'Complete 30 Dynamic Programming & Graph problems on CodeChef/LeetCode', done: true },
    { id: 2, text: 'Publish Semester 5 Full-Stack Capstone repository with README and Dockerfile', done: true },
    { id: 3, text: 'Take official Tier-1 Technical Mock Coding Assessment', done: true },
    { id: 4, text: 'Update ATS-formatted resume with verified skills badges', done: false },
    { id: 5, text: 'Schedule 1-on-1 resume review with Placement Officer Vikram Malhotra', done: false },
  ]);

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState('Academics & Course Pace');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackList, setFeedbackList] = useState([
    { id: 'FB-982', date: '2026-10-02', category: 'Lab Infrastructure', rating: 4, comment: 'High-memory workstations in Lab 302 were very helpful for Docker builds.', status: 'Reviewed by HOD' },
  ]);

  // Synchronize state with logged in profile
  useEffect(() => {
    if (currentUser) {
      setStudent((prev) => ({
        ...prev,
        fullName: currentUser.name || prev.fullName,
        email: currentUser.email || prev.email,
        avatar: currentUser.avatar || prev.avatar,
        studentId: currentUser.studentId || prev.studentId,
      }));
    }
  }, [currentUser]);

  // Workshop Enroll / Withdraw Handlers
  const handleEnrollWorkshop = (workshop) => {
    setEnrolledInterventions((prev) => [
      ...prev,
      { ...workshop, status: 'Newly Enrolled' },
    ]);
    setAvailableWorkshops((prev) => prev.filter((w) => w.id !== workshop.id));
  };

  const handleWithdrawWorkshop = (id) => {
    const withdrawn = enrolledInterventions.find((w) => w.id === id);
    if (withdrawn) {
      setEnrolledInterventions((prev) => prev.filter((w) => w.id !== id));
      setAvailableWorkshops((prev) => [...prev, { ...withdrawn, status: undefined, seatsLeft: 10 }]);
    }
  };

  // Feedback Submit Handler
  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    const newEntry = {
      id: `FB-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      category: feedbackCategory,
      rating: feedbackRating,
      comment: feedbackText.trim(),
      status: 'Received & Logged',
    };

    setFeedbackList([newEntry, ...feedbackList]);
    setFeedbackSubmitted(true);
    setFeedbackText('');
    setTimeout(() => setFeedbackSubmitted(false), 3000);
  };

  // Toggle Career Tasks
  const handleToggleTask = (id) => {
    setCareerTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  // Print Transcript
  const handlePrintTranscript = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. STUDENT PROFILE HEADER CARD */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <img
            src={student.avatar}
            alt={student.fullName}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid #0284C7',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.2)',
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                {student.fullName}
              </h1>
              {hasCollegeRecords ? (
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '3px 9px',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    borderRadius: '6px',
                    border: '1px solid #A7F3D0',
                  }}
                >
                  ✓ Active Ingested Cohort
                </span>
              ) : (
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '3px 9px',
                    backgroundColor: '#FEF3C7',
                    color: '#B45309',
                    borderRadius: '6px',
                    border: '1px solid #FDE68A',
                  }}
                >
                  ⏳ College Records Pending Ingestion
                </span>
              )}
              {currentUser?.authProvider === 'firebase_google' && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '3px 9px',
                    backgroundColor: '#EFF6FF',
                    color: '#1D4ED8',
                    borderRadius: '6px',
                    border: '1px solid #BFDBFE',
                  }}
                >
                  Google SSO Active
                </span>
              )}
            </div>

            <div style={{ fontSize: '0.86rem', color: '#475569', marginTop: '5px' }}>
              ID: <strong style={{ color: '#0F172A' }}>{student.studentId}</strong> · {student.program} · {student.semester}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={13} />
              <span>Campus Email: {student.email}</span>
            </div>
          </div>
        </div>

        {/* Quick Metrics & Print Action */}
        <div className="student-header-metrics">
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Cumulative CGPA
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: hasCollegeRecords ? '#082B56' : '#94A3B8' }}>
              {hasCollegeRecords && student.cgpa != null ? (
                <>
                  {student.cgpa} <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>/ 10.0</span>
                </>
              ) : (
                <span style={{ fontSize: '0.88rem', color: '#94A3B8', fontWeight: 600 }}>Awaiting CoE</span>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Aggregate Attendance
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: hasCollegeRecords ? '#059669' : '#94A3B8' }}>
              {hasCollegeRecords && student.attendanceRate != null ? (
                `${student.attendanceRate}%`
              ) : (
                <span style={{ fontSize: '0.88rem', color: '#94A3B8', fontWeight: 600 }}>Awaiting Biometrics</span>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Data Completeness
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: hasCollegeRecords ? '#1677D2' : '#D97706' }}>
              {hasCollegeRecords ? `${student.dataCompleteness}%` : '0% (Pending)'}
            </div>
          </div>

          <button
            onClick={handlePrintTranscript}
            className="print-btn-col"
            style={{
              padding: '8px 16px',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
            title="Print Official Transcript"
          >
            <Printer size={15} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* 2. DEDICATED STUDENT NAVIGATION TABS */}
      <div
        style={{
          display: 'flex',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '5px',
          gap: '4px',
          overflowX: 'auto',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
        }}
        role="tablist"
      >
        {[
          { id: 'overview', label: 'Success Cockpit & Risk', icon: GraduationCap },
          { id: 'academic', label: 'Courses & Attendance', icon: BookOpen },
          { id: 'placement', label: 'Placement Readiness', icon: Award },
          { id: 'interventions', label: 'Support & Programs', icon: Sparkles },
          { id: 'feedback', label: 'Feedback & Suggestions', icon: Send },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabChange(tab.id)}
              style={{
                flex: 1,
                minWidth: '170px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '9px 14px',
                borderRadius: '8px',
                border: isActive ? '1px solid #1677D2' : '1px solid transparent',
                backgroundColor: isActive ? '#1677D2' : 'transparent',
                color: isActive ? '#FFFFFF' : '#475569',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = '#F8FAFC';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Icon size={16} color={isActive ? '#FFFFFF' : '#64748B'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: SUCCESS COCKPIT & RISK RADAR (OVERVIEW)
          ========================================================================= */}
      {activeTab === 'overview' && !hasCollegeRecords && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 1. College Ingestion Notice Banner */}
          <div
            style={{
              backgroundColor: '#FFFBEB',
              border: '1px solid #FCD34D',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 6px rgba(245, 158, 11, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: '#FEF3C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#D97706',
                    flexShrink: 0,
                  }}
                >
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#92400E', margin: '0 0 4px 0' }}>
                    College Academic & Attendance Records Pending Ingestion
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: '#B45309', margin: 0, lineHeight: 1.5 }}>
                    Welcome <strong>{student.fullName}</strong>! Your student account is successfully registered and verified for <strong>{student.program}</strong> ({student.semester}) with Roll No: <strong>{student.studentId}</strong>.
                  </p>
                </div>
              </div>

              {/* Live Re-check Button */}
              <button
                type="button"
                onClick={handleRecheckRecords}
                disabled={recheckLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  border: '1px solid #D97706',
                  backgroundColor: '#FFFFFF',
                  color: '#B45309',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: recheckLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease',
                }}
              >
                <RefreshCw size={15} className={recheckLoading ? 'spin' : ''} />
                <span>{recheckLoading ? 'Querying Database...' : 'Check / Refresh College Records'}</span>
              </button>
            </div>

            <div style={{ fontSize: '0.84rem', color: '#78350F', lineHeight: 1.6, backgroundColor: '#FFFFFF', padding: '12px 16px', borderRadius: '8px', border: '1px solid #FDE68A' }}>
              <strong>Why are my marks, attendance, and success score not visible yet?</strong><br />
              In university enterprise governance, student intelligence is generated from verified records ingested by the <strong>Registrar, Controller of Examinations (CoE), Biometric Attendance Portal, and Training & Placement Cell</strong>. Your institution administrator uploads these records as structured CSV files via the <strong>Admin Ingestion Portal</strong>. As soon as your college uploads your department's CSV sheet, your explainable 360° Success Score, Survival Curve, and AI Risk Radar will automatically appear here.
            </div>

            {recheckFeedback && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  backgroundColor: recheckFeedback.includes('Great news') ? '#ECFDF5' : '#EFF6FF',
                  color: recheckFeedback.includes('Great news') ? '#065F46' : '#1E40AF',
                  border: `1px solid ${recheckFeedback.includes('Great news') ? '#A7F3D0' : '#BFDBFE'}`,
                  fontSize: '0.82rem',
                  fontWeight: 500,
                }}
              >
                {recheckFeedback}
              </div>
            )}
          </div>

          {/* 2. 8-Pillars Institutional Ingestion Readiness Checklist */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: '0 0 2px 0' }}>
                  Institutional Telemetry Readiness Tracker (8 Pillars)
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
                  Live ingestion status across university administrative and academic domains for Roll No: <strong>{student.studentId}</strong>
                </p>
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '3px 9px',
                  backgroundColor: '#FEF3C7',
                  color: '#B45309',
                  borderRadius: '4px',
                }}
              >
                1 / 8 Verified (Account Onboarded)
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {[
                { title: 'Student Identity & Enrollment', source: 'Registrar ERP', status: 'VERIFIED', icon: CheckCircle2, color: '#059669', badgeBg: '#ECFDF5', badgeColor: '#065F46', detail: `Roll No ${student.studentId} matched to ${student.program}` },
                { title: 'Academic Examinations (SGPA/CGPA)', source: 'Controller of Examinations', status: 'PENDING', icon: Clock, color: '#D97706', badgeBg: '#FEF3C7', badgeColor: '#92400E', detail: 'Awaiting semester examination results CSV' },
                { title: 'Biometric RFID Attendance', source: 'Campus Attendance Portal', status: 'PENDING', icon: Clock, color: '#D97706', badgeBg: '#FEF3C7', badgeColor: '#92400E', detail: 'Awaiting classroom attendance sessions upload' },
                { title: 'Digital LMS Platform Activity', source: 'Moodle / Canvas LMS', status: 'PENDING', icon: Clock, color: '#D97706', badgeBg: '#FEF3C7', badgeColor: '#92400E', detail: 'Awaiting assignment submissions telemetry' },
                { title: 'Placement Aptitude & Mock Rounds', source: 'Training & Placement Cell (TPO)', status: 'PENDING', icon: Clock, color: '#D97706', badgeBg: '#FEF3C7', badgeColor: '#92400E', detail: 'Awaiting diagnostic mock tests CSV' },
                { title: 'Computing Lab & Practical Skills', source: 'Department Computer Labs', status: 'PENDING', icon: Clock, color: '#D97706', badgeBg: '#FEF3C7', badgeColor: '#92400E', detail: 'Awaiting programming lab performance' },
                { title: 'Co-Curricular & Club Activities', source: 'Student Affairs Council', status: 'PENDING', icon: Clock, color: '#D97706', badgeBg: '#FEF3C7', badgeColor: '#92400E', detail: 'Awaiting hackathon and event records' },
                { title: 'Confidential Student Feedback', source: 'Quality Assurance Cell', status: 'READY', icon: CheckCircle2, color: '#2563EB', badgeBg: '#EFF6FF', badgeColor: '#1E40AF', detail: 'Open for student submission in Feedback tab' },
              ].map((p, idx) => {
                const IconComp = p.icon;
                return (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '14px',
                      backgroundColor: p.status === 'VERIFIED' ? '#F0FDF4' : '#F8FAFC',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>{p.source}</span>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '4px',
                            backgroundColor: p.badgeBg,
                            color: p.badgeColor,
                          }}
                        >
                          {p.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <IconComp size={15} color={p.color} />
                        <span>{p.title}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748B', lineHeight: 1.4 }}>
                      {p.detail}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Self-Service Target Goals Form */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={20} color="#2563EB" />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Personal Academic Targets & Career Goals (Self-Declared)
                </h4>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>
                You can define your personal aspirational milestones right now. These goals will be benchmarked against your actual semester telemetry once uploaded.
              </p>
            </div>

            <form onSubmit={handleSaveGoals} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Target CGPA for this Semester
                </label>
                <input
                  type="text"
                  value={targetCgpa}
                  onChange={(e) => setTargetCgpa(e.target.value)}
                  placeholder="e.g. 8.5"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.84rem',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Primary Career / Industry Aspiration
                </label>
                <input
                  type="text"
                  value={targetCareer}
                  onChange={(e) => setTargetCareer(e.target.value)}
                  placeholder="e.g. Software Development Engineer"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.84rem',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Core Focus Skills to Master
                </label>
                <input
                  type="text"
                  value={targetSkills}
                  onChange={(e) => setTargetSkills(e.target.value)}
                  placeholder="e.g. Data Structures, Cloud Computing"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.84rem',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <button
                  type="submit"
                  style={{
                    padding: '9px 18px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Check size={14} />
                  <span>{goalsSaved ? 'Goals Saved ✓' : 'Save Aspirational Goals'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 1: SUCCESS COCKPIT & RISK RADAR (OVERVIEW) — REAL INGESTED COHORT
          ========================================================================= */}
      {activeTab === 'overview' && hasCollegeRecords && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Score Display Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                    Personal Pratibha Success Score
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      backgroundColor: '#E0F2FE',
                      color: '#0369A1',
                      borderRadius: '4px',
                    }}
                  >
                    Explainable Model v1.0
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', margin: '1.5rem 0' }}>
                  <div
                    style={{
                      width: '94px',
                      height: '94px',
                      borderRadius: '50%',
                      border: '6px solid #0284C7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.85rem',
                      fontWeight: 700,
                      color: '#0284C7',
                      backgroundColor: '#F8FAFC',
                      flexShrink: 0,
                    }}
                  >
                    {student.successScore}
                  </div>
                  <div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A' }}>
                      Strong Academic Trajectory
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#64748B', marginTop: '4px', lineHeight: 1.5 }}>
                      You rank in the <strong>top 18%</strong> of your CSE cohort. You are +7.2 points above the department median.
                    </div>
                  </div>
                </div>
              </div>

              {/* Decoupled Risk Status (Mandatory PRD Rule) */}
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '8px',
                  padding: '1rem',
                  border: '1px solid #E2E8F0',
                  fontSize: '0.82rem',
                  color: '#334155',
                  lineHeight: 1.5,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Shield size={16} color="#0284C7" />
                  <strong>Independent Decoupled Risk Assessment:</strong>
                </div>
                <div>
                  • <strong>Academic Risk: {student.academicRisk}</strong> (Zero backlogs, 8.42 CGPA, reliable submissions).<br />
                  • <strong>Placement Risk: {student.placementRisk}</strong> (Cognitive aptitude is solid; live coding and system design mock rounds will boost placement conversion).
                </div>
              </div>
            </div>

            {/* Score Drivers & Factor Breakdown */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '1rem' }}>
                Contributing Explainability Factors
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {scoreDrivers.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                      <span style={{ fontWeight: 600, color: '#0F172A' }}>{item.title}</span>
                      <span style={{ color: '#0284C7', fontWeight: 600 }}>{item.contribution} pts ({item.weight})</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${item.score}%`,
                          backgroundColor: item.score >= 80 ? '#10B981' : '#F59E0B',
                          borderRadius: '3px',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{item.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Model 1 & Model 2 Predictive Intelligence Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {/* Model 1: Dropout & Debarment Survival Engine (Cox-PH-v1.2) */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #FECACA',
                borderRadius: '12px',
                padding: '1.25rem',
                boxShadow: '0 1px 3px rgba(220, 38, 38, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={18} color="#DC2626" />
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#991B1B' }}>
                      Model 1: Debarment & Dropout Forecast
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.66rem',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: '#FEE2E2',
                      color: '#991B1B',
                    }}
                  >
                    Cox-PH-v1.2
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6B7280', marginBottom: '12px' }}>
                  Time-to-event survival modeling evaluates semester credit loss & attendance debarment horizon.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <div style={{ backgroundColor: '#FEF2F2', padding: '8px 10px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.66rem', color: '#6B7280' }}>Hazard Multiplier</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#991B1B', marginTop: '2px' }}>
                      {predictionsData?.targets?.dropout_forecast?.hazardMultiplier || '1.0x'}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#F0FDF4', padding: '8px 10px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.66rem', color: '#6B7280' }}>Survival Rate</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                      {predictionsData?.targets?.dropout_forecast?.survivalRatePct || 94}%
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#FFFBEB', padding: '8px 10px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.66rem', color: '#6B7280' }}>Debarment Risk</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#B45309', marginTop: '4px' }}>
                      {predictionsData?.targets?.dropout_forecast?.projectedDebarmentWeek || 'Safe / None'}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '12px', fontSize: '0.72rem', color: '#4B5563', borderTop: '1px solid #F3F4F6', paddingTop: '8px' }}>
                • <strong>Status:</strong> {student.attendanceRate < 75 ? '⚠️ Attendance shortfall alert (< 75%). Biometric regularity required.' : '✓ Regular attendance maintains full exam eligibility.'}
              </div>
            </div>

            {/* Model 2: Causal Uplift Recommender (CausalForest-v2.1) */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #BBF7D0',
                borderRadius: '12px',
                padding: '1.25rem',
                boxShadow: '0 1px 3px rgba(22, 163, 74, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} color="#16A34A" />
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#166534' }}>
                      Model 2: Personalized Causal Uplift
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.66rem',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: '#DCFCE7',
                      color: '#15803D',
                    }}
                  >
                    CausalForest-v2.1
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6B7280', marginBottom: '8px' }}>
                  Optimal counterfactual treatment effect identified for maximum metric boost.
                </div>

                <div style={{ backgroundColor: '#F0FDF4', padding: '10px', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#166534', textTransform: 'uppercase' }}>
                    Recommended Action:
                  </div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                    {predictionsData?.targets?.causal_uplift?.optimalIntervention || 'Technical Mock Interview & Behavioral Bootcamp'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.76rem' }}>
                    <span style={{ color: '#16A34A', fontWeight: 700 }}>
                      Predicted Uplift: +{predictionsData?.targets?.causal_uplift?.predictedUpliftPct || 18.2}%
                    </span>
                    <span style={{ color: '#64748B' }}>
                      Horizon: {predictionsData?.targets?.causal_uplift?.estimatedRecoveryWeeks || 3} Wks
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleTabChange('interventions')}
                style={{
                  marginTop: '12px',
                  backgroundColor: '#16A34A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '7px 12px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                Enroll in Recommended Program ➔
              </button>
            </div>
          </div>

          {/* Model 3: Student Voice & Sentiment / Burnout NLP Radar */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #BFDBFE',
              borderRadius: '12px',
              padding: '1.25rem',
              boxShadow: '0 1px 3px rgba(37, 99, 235, 0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} color="#2563EB" />
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E40AF' }}>
                  Model 3: Student Voice & Burnout NLP Radar (RoBERTa-EdSentiment-v1)
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: (predictionsData?.targets?.sentiment_nlp?.burnoutRiskPct || 20) > 50 ? '#FEE2E2' : '#DCFCE7',
                  color: (predictionsData?.targets?.sentiment_nlp?.burnoutRiskPct || 20) > 50 ? '#991B1B' : '#15803D',
                }}
              >
                Burnout Risk: {predictionsData?.targets?.sentiment_nlp?.burnoutRiskPct || 18}%
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <div style={{ backgroundColor: '#F8FAFC', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.66rem', color: '#64748B' }}>Sentiment State</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                  {predictionsData?.targets?.sentiment_nlp?.sentimentLabel || 'Engaged / Resilient Scholar'}
                </div>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.66rem', color: '#64748B' }}>Fatigue & Pacing</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                  {predictionsData?.targets?.sentiment_nlp?.aspects?.burnoutFatigue || 'Low'} Fatigue • {predictionsData?.targets?.sentiment_nlp?.aspects?.academicRigorPace || 'Balanced'}
                </div>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.66rem', color: '#64748B' }}>Thematic Tags</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                  {(predictionsData?.targets?.sentiment_nlp?.detectedThemes || ['#PlacementConfidence', '#ProactiveLearner']).map((t, idx) => (
                    <span key={idx} style={{ fontSize: '0.66rem', fontWeight: 600, color: '#1D4ED8', backgroundColor: '#EFF6FF', padding: '1px 5px', borderRadius: '3px' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: COURSES & ATTENDANCE RADAR
          ========================================================================= */}
      {activeTab === 'academic' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {!hasCollegeRecords && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                }}
              >
                <BookOpen size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>
                Course & Attendance Telemetry Pending Ingestion
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', maxWidth: '600px', margin: '0 auto 1.5rem auto', lineHeight: 1.6 }}>
                Your department has not yet uploaded the semester course roster or biometric attendance logs for Roll No <strong>{student.studentId}</strong>. Once your college administrator uploads the attendance CSV via the Admin Ingestion Portal, your subject-wise attendance percentages, classes held vs attended, and 75% AICTE safety margins will be automatically populated here.
              </p>
              <button
                type="button"
                onClick={handleRecheckRecords}
                disabled={recheckLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  cursor: recheckLoading ? 'not-allowed' : 'pointer',
                }}
              >
                <RefreshCw size={15} className={recheckLoading ? 'spin' : ''} />
                <span>{recheckLoading ? 'Querying Database...' : 'Re-Check Course Telemetry'}</span>
              </button>
            </div>
          )}

          {hasCollegeRecords && (
            <>
              {/* Course Attendance Telemetry */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Current Semester Course Attendance Telemetry
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0 0' }}>
                  Mandatory AICTE statutory compliance threshold is 75.0% aggregate per course.
                </p>
              </div>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  padding: '4px 10px',
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  borderRadius: '6px',
                }}
              >
                Overall: {student.attendanceRate}%
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '12px 14px', color: '#475569' }}>Course Code</th>
                    <th style={{ padding: '12px 14px', color: '#475569' }}>Course Title</th>
                    <th style={{ padding: '12px 14px', color: '#475569' }}>Faculty In-Charge</th>
                    <th style={{ padding: '12px 14px', color: '#475569' }}>Attended / Total</th>
                    <th style={{ padding: '12px 14px', color: '#475569' }}>Attendance Rate</th>
                    <th style={{ padding: '12px 14px', color: '#475569' }}>75% Safety Margin</th>
                    <th style={{ padding: '12px 14px', color: '#475569', textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceCourses.map((c) => (
                    <tr key={c.code} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0F172A' }}>{c.code}</td>
                      <td style={{ padding: '12px 14px', color: '#334155' }}>{c.name}</td>
                      <td style={{ padding: '12px 14px', color: '#64748B' }}>{c.instructor}</td>
                      <td style={{ padding: '12px 14px', color: '#475569' }}>{c.attended} / {c.total}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <strong style={{ color: c.pct >= 85 ? '#10B981' : c.pct >= 75 ? '#F59E0B' : '#EF4444' }}>
                          {c.pct}%
                        </strong>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#64748B', fontSize: '0.8rem' }}>{c.margin}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        {c.warning ? (
                          <span style={{ padding: '3px 8px', borderRadius: '4px', backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '0.74rem', fontWeight: 600 }}>
                            ⚠ Near 75% Threshold
                          </span>
                        ) : (
                          <span style={{ padding: '3px 8px', borderRadius: '4px', backgroundColor: '#ECFDF5', color: '#059669', fontSize: '0.74rem', fontWeight: 600 }}>
                            ✓ Optimal Standing
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Attendance Calculator & Simulator */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sliders size={18} color="#0284C7" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Interactive Attendance Predictor & Target Simulator
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 1rem 0' }}>
              Simulate how attending the upcoming lectures will elevate your overall semester aggregate:
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '260px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Upcoming Lectures Attended: <strong>{simExtraClasses} classes</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={simExtraClasses}
                  onChange={(e) => setSimExtraClasses(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94A3B8' }}>
                  <span>0 classes</span>
                  <span>15 classes</span>
                  <span>30 classes</span>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#F0F9FF',
                  border: '1px solid #BAE6FD',
                  borderRadius: '8px',
                  padding: '1rem 1.5rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.74rem', fontWeight: 600, color: '#0369A1', textTransform: 'uppercase' }}>
                  Projected Aggregate
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0284C7' }}>
                  {simulatedPct}%
                </div>
                <div style={{ fontSize: '0.74rem', color: '#0284C7', marginTop: '2px' }}>
                  (+{(simulatedPct - student.attendanceRate).toFixed(1)}% elevation)
                </div>
              </div>
            </div>
          </div>

          {/* Academic Semester SGPA Progression */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: '0 0 1rem 0' }}>
              SGPA Historical Progression (Semester 1 to 5)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
              {[
                { sem: 'Sem 1', sgpa: 8.10, credits: 24 },
                { sem: 'Sem 2', sgpa: 8.25, credits: 24 },
                { sem: 'Sem 3', sgpa: 8.00, credits: 26 },
                { sem: 'Sem 4', sgpa: 8.55, credits: 26 },
                { sem: 'Sem 5', sgpa: 8.42, credits: 24 },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '12px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>{s.sem}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0F172A', margin: '4px 0' }}>{s.sgpa}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{s.credits} Credits</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )}

      {/* =========================================================================
          TAB 3: PLACEMENT READINESS & SKILLS
          ========================================================================= */}
      {activeTab === 'placement' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {!hasCollegeRecords && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                }}
              >
                <Award size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>
                Placement Readiness Assessment Pending Ingestion
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', maxWidth: '600px', margin: '0 auto 1.5rem auto', lineHeight: 1.6 }}>
                Your Training & Placement Cell (TPO) has not yet uploaded diagnostic mock interviews, aptitude percentiles, or coding test assessments for Roll No <strong>{student.studentId}</strong>. Once uploaded via the Admin Ingestion Portal, your 2×2 Placement Readiness Matrix and Model 2 (Causal Forest) uplift pathways will be computed.
              </p>
              <button
                type="button"
                onClick={handleRecheckRecords}
                disabled={recheckLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  cursor: recheckLoading ? 'not-allowed' : 'pointer',
                }}
              >
                <RefreshCw size={15} className={recheckLoading ? 'spin' : ''} />
                <span>{recheckLoading ? 'Querying Database...' : 'Re-Check Placement Data'}</span>
              </button>
            </div>
          )}

          {hasCollegeRecords && (
            <>
              {/* Assessment Metrics Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1.25rem', backgroundColor: '#FFFFFF' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                Cognitive Aptitude & Reasoning
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0F172A', margin: '6px 0' }}>82 / 100</div>
              <div style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 600 }}>✓ Qualified for Tier-1 Product Companies</div>
            </div>

            <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1.25rem', backgroundColor: '#FFFFFF' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                Technical Mock Interview (DSA)
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0F172A', margin: '6px 0' }}>74 / 100</div>
              <div style={{ fontSize: '0.78rem', color: '#F59E0B', fontWeight: 600 }}>Target: Strengthen timed recursion problems</div>
            </div>

            <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1.25rem', backgroundColor: '#FFFFFF' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                Resume ATS Readiness Index
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0284C7', margin: '6px 0' }}>88 / 100</div>
              <div style={{ fontSize: '0.78rem', color: '#0284C7', fontWeight: 600 }}>High Parser Match for Software Roles</div>
            </div>
          </div>

          {/* Verified Skills Badges */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: '0 0 1rem 0' }}>
              Verified Technical Competencies & Skill Matrix
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[
                { name: 'Python (Advanced)', verified: true, level: 'Expert' },
                { name: 'Data Structures & Algorithms', verified: true, level: 'Advanced' },
                { name: 'Relational DBMS & SQL', verified: true, level: 'Proficient' },
                { name: 'Distributed Systems Architecture', verified: true, level: 'Intermediate' },
                { name: 'Git & GitHub Collaboration', verified: true, level: 'Expert' },
                { name: 'Docker & Containerization', verified: false, level: 'Learning' },
                { name: 'System Design Basics', verified: false, level: 'In Progress' },
              ].map((skill, i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: skill.verified ? '#E0F2FE' : '#F1F5F9',
                    color: skill.verified ? '#0369A1' : '#64748B',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    border: `1px solid ${skill.verified ? '#BAE6FD' : '#E2E8F0'}`,
                  }}
                >
                  {skill.verified && <CheckCircle2 size={13} color="#0284C7" />}
                  <span>{skill.name}</span>
                  <span style={{ fontSize: '0.7rem', color: skill.verified ? '#0284C7' : '#94A3B8', fontWeight: 400 }}>({skill.level})</span>
                </span>
              ))}
            </div>
          </div>

          {/* Interactive Career Roadmap Checklist */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Semester 6 Placement Action Checklist
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                {careerTasks.filter((t) => t.done).length} of {careerTasks.length} Completed
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {careerTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: task.done ? '#F0FDF4' : '#F8FAFC',
                    border: `1px solid ${task.done ? '#BBF7D0' : '#E2E8F0'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      backgroundColor: task.done ? '#16A34A' : '#FFFFFF',
                      border: `2px solid ${task.done ? '#16A34A' : '#94A3B8'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {task.done && <Check size={14} color="#FFFFFF" />}
                  </div>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      color: task.done ? '#166534' : '#334155',
                      textDecoration: task.done ? 'line-through' : 'none',
                    }}
                  >
                    {task.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )}

      {/* =========================================================================
          TAB 4: MY INTERVENTIONS & MENTORSHIP
          ========================================================================= */}
      {activeTab === 'interventions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active Interventions */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  My Enrolled Interventions & Mentorship Programs
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0 0' }}>
                  Recommended by your academic advisor to maintain readiness index.
                </p>
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0284C7' }}>
                {enrolledInterventions.length} Enrolled
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {enrolledInterventions.map((prog) => (
                <div
                  key={prog.id}
                  style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.96rem' }}>{prog.title}</span>
                      <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#E0F2FE', color: '#0369A1', fontWeight: 600 }}>
                        {prog.type}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '5px' }}>
                      {prog.date} · Venue: {prog.venue}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94A3B8', marginTop: '2px' }}>
                      Faculty Mentor: <strong>{prog.mentor}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        backgroundColor: '#ECFDF5',
                        color: '#059669',
                        borderRadius: '4px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                      }}
                    >
                      {prog.status}
                    </span>
                    <button
                      onClick={() => handleWithdrawWorkshop(prog.id)}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: '#FEE2E2',
                        color: '#DC2626',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available Campus Workshops Catalogue */}
          {availableWorkshops.length > 0 && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: '0 0 1rem 0' }}>
                Open Campus Interventions (1-Click Instant Enrollment)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {availableWorkshops.map((workshop) => (
                  <div
                    key={workshop.id}
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '1.25rem',
                      backgroundColor: '#F8FAFC',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.94rem' }}>{workshop.title}</span>
                        <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#F1F5F9', color: '#475569' }}>
                          {workshop.type}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>
                        {workshop.date} · {workshop.venue} · Lead: {workshop.mentor}
                      </div>
                    </div>

                    <button
                      onClick={() => handleEnrollWorkshop(workshop)}
                      style={{
                        padding: '6px 14px',
                        backgroundColor: '#0284C7',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <PlusCircle size={14} />
                      <span>Enroll Now ({workshop.seatsLeft} seats left)</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 5: STUDENT VOICE & GRIEVANCES (FEEDBACK)
          ========================================================================= */}
      {activeTab === 'feedback' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem 0' }}>
              Direct Student Voice, Grievances & Campus Feedback
            </h3>
            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.84rem', color: '#64748B', lineHeight: 1.5 }}>
              Your feedback is aggregated and reviewed by the Dean of Academics and Department HODs. Submit honest feedback regarding course pacing, lab hardware, or placement training.
            </p>

            {feedbackSubmitted ? (
              <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                <CheckCircle2 size={38} color="#16A34A" style={{ margin: '0 auto 8px auto' }} />
                <div style={{ fontWeight: 700, color: '#166534', fontSize: '1.05rem' }}>
                  Thank you, {student.fullName.split(' ')[0]}! Your feedback was recorded.
                </div>
                <div style={{ fontSize: '0.82rem', color: '#15803D', marginTop: '4px' }}>
                  Your submission has been securely logged in the Campus Telemetry database.
                </div>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Select Feedback Domain
                  </label>
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <option value="Academics & Course Pace">Academics & Course Pace</option>
                    <option value="Lab Infrastructure & Hardware">Lab Infrastructure & Hardware</option>
                    <option value="Placement & Mock Interviews">Placement & Mock Interviews</option>
                    <option value="Campus Facilities & Library">Campus Facilities & Library</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Rate Your Experience (1 - 5 Stars)
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setFeedbackRating(s)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                      >
                        <Star
                          size={24}
                          fill={s <= feedbackRating ? '#F59E0B' : 'none'}
                          color={s <= feedbackRating ? '#F59E0B' : '#CBD5E1'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Constructive Suggestions / Remarks
                  </label>
                  <textarea
                    rows={4}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Enter details (e.g., More mock interviews for cloud engineering, or projector clarity in Hall B)..."
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      outline: 'none',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    alignSelf: 'flex-start',
                    padding: '9px 20px',
                    backgroundColor: '#0284C7',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Send size={15} />
                  <span>Submit Anonymous Feedback</span>
                </button>
              </form>
            )}
          </div>

          {/* Submission History Log */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: '0 0 1rem 0' }}>
              My Submissions Log & Status
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {feedbackList.map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    backgroundColor: '#F8FAFC',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '0.86rem', color: '#0F172A' }}>{item.category}</strong>
                      <span style={{ fontSize: '0.72rem', color: '#64748B' }}>({item.date})</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '3px' }}>{item.comment}</div>
                  </div>

                  <span
                    style={{
                      padding: '3px 10px',
                      backgroundColor: '#ECFDF5',
                      color: '#059669',
                      borderRadius: '4px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                    }}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
