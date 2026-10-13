import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  GraduationCap,
  Award,
  CheckCircle2,
  BookOpen,
  Clock,
  Sparkles,
  Target,
  Send,
  Star,
  Shield,
  ShieldAlert,
  Printer,
  Check,
  PlusCircle,
  Sliders,
  Mail,
  RefreshCw,
  Database,
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
  const [previewBenchmark, setPreviewBenchmark] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [recheckLoading, setRecheckLoading] = useState(false);
  const [recheckFeedback, setRecheckFeedback] = useState('');
  const [recheckCounter, setRecheckCounter] = useState(0);

  // Helper function to extract elegant initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return 'RS';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

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

  // Reactive listener: automatically re-sync student records when Admin uploads CSV in Data Integration Studio
  useEffect(() => {
    const handleDataUpdate = () => {
      setRecheckCounter((c) => c + 1);
    };
    window.addEventListener('pratibha_data_updated', handleDataUpdate);
    return () => window.removeEventListener('pratibha_data_updated', handleDataUpdate);
  }, []);

  // Lazy-load sample benchmark analytics when preview mode is toggled
  useEffect(() => {
    if (previewBenchmark && !scoreData) {
      setLoadingLive(true);
      Promise.all([
        api.getStudentSuccessScore('STU_0001').catch(() => null),
        api.getStudentPredictions('STU_0001').catch(() => null),
      ])
        .then(([scoreRes, predRes]) => {
          setScoreData(scoreRes);
          setPredictionsData(predRes);
        })
        .finally(() => setLoadingLive(false));
    }
  }, [previewBenchmark, scoreData]);

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
    const safeCgpa = student.cgpa ?? 8.42;
    const safeAttendance = student.attendanceRate ?? 88.5;
    return [
      { title: 'Academic Performance', score: Math.round(safeCgpa * 10), weight: '35%', contribution: '+29.4', detail: 'Consistent SGPA progression across core semester courses' },
      { title: 'Classroom Attendance', score: Math.round(safeAttendance), weight: '20%', contribution: '+17.7', detail: `${safeAttendance}% aggregate attendance, compared with 75% limit` },
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
      {/* 1. STUDENT PROFILE HEADER CARD */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {student.avatar && !avatarError ? (
            <img
              src={student.avatar}
              alt=""
              referrerPolicy="no-referrer"
              onError={() => setAvatarError(true)}
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2.5px solid #1677D2',
                boxShadow: '0 4px 12px rgba(22, 119, 210, 0.18)',
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1677D2 0%, #082B56 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                fontWeight: 700,
                letterSpacing: '0.5px',
                boxShadow: '0 4px 12px rgba(8, 43, 86, 0.2)',
                border: '2.5px solid #FFFFFF',
                flexShrink: 0,
              }}
            >
              {getInitials(student.fullName)}
            </div>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#082B56', margin: 0, letterSpacing: '-0.3px' }}>
                {student.fullName}
              </h1>
            </div>

            <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '4px' }}>
              ID: <strong style={{ color: '#0F172A' }}>{student.studentId}</strong> · {student.program} · {student.semester}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={13} />
              <span>{student.email}</span>
            </div>
          </div>
        </div>

        {/* Quick Metrics & Print Action */}
        <div className="student-header-metrics">
          <div className="student-metric-cell">
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Cumulative CGPA
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: (hasCollegeRecords || previewBenchmark) ? '#082B56' : '#94A3B8' }}>
              {(hasCollegeRecords || previewBenchmark) && (student.cgpa != null || previewBenchmark) ? (
                <>
                  {student.cgpa ?? 8.42} <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>/ 10.0</span>
                </>
              ) : (
                <span style={{ fontSize: '0.86rem', color: '#94A3B8', fontWeight: 600 }}>Pending Sync</span>
              )}
            </div>
          </div>

          <div className="student-metric-cell">
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Aggregate Attendance
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: (hasCollegeRecords || previewBenchmark) ? '#059669' : '#94A3B8' }}>
              {(hasCollegeRecords || previewBenchmark) && (student.attendanceRate != null || previewBenchmark) ? (
                `${student.attendanceRate ?? 88.5}%`
              ) : (
                <span style={{ fontSize: '0.86rem', color: '#94A3B8', fontWeight: 600 }}>Pending Sync</span>
              )}
            </div>
          </div>

          <div className="student-metric-cell">
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Data Completeness
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: (hasCollegeRecords || previewBenchmark) ? '#1677D2' : '#D97706' }}>
              {(hasCollegeRecords || previewBenchmark) ? `${student.dataCompleteness || 100}%` : '0%'}
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
              height: '38px',
              boxSizing: 'border-box',
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
      {/* =========================================================================
          TAB 1: SUCCESS COCKPIT & RISK RADAR (OVERVIEW) — AWAITING COLLEGE INGESTION
          ========================================================================= */}
      {activeTab === 'overview' && !hasCollegeRecords && !previewBenchmark && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* 1. Sleek Sync Status Header Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1.25rem 1.5rem',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #DBEAFE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1677D2',
                    flexShrink: 0,
                  }}
                >
                  <Clock size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#082B56', margin: '0 0 2px 0' }}>
                    Academic & Attendance Telemetry Syncing
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                    <span>Account registered for <strong>{student.program}</strong> ({student.semester}) · Roll No: <strong>{student.studentId}</strong></span>
                    {!hasCollegeRecords && (
                      <>
                        <span style={{ color: '#D97706', fontSize: '0.78rem', fontWeight: 600 }}>
                          (Awaiting Roster Match)
                        </span>
                        <a
                          href="#/student/profile"
                          style={{
                            color: '#1677D2',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            textDecoration: 'underline',
                          }}
                        >
                          Update Roll No in Profile →
                        </a>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Symmetrical Dual Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleRecheckRecords}
                  disabled={recheckLoading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#334155',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: recheckLoading ? 'not-allowed' : 'pointer',
                    height: '38px',
                    boxSizing: 'border-box',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                >
                  <RefreshCw size={14} className={recheckLoading ? 'spin' : ''} />
                  <span>{recheckLoading ? 'Checking...' : 'Check Sync Status'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewBenchmark(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #1677D2',
                    backgroundColor: '#1677D2',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    height: '38px',
                    boxSizing: 'border-box',
                    boxShadow: '0 1px 3px rgba(22, 119, 210, 0.25)',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0D5CA8')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1677D2')}
                >
                  <Sparkles size={14} />
                  <span>Preview Sample Analytics</span>
                </button>
              </div>
            </div>

            {recheckFeedback && (
              <div
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  backgroundColor: recheckFeedback.includes('Great news') ? '#ECFDF5' : '#F8FAFC',
                  color: recheckFeedback.includes('Great news') ? '#065F46' : '#475569',
                  border: `1px solid ${recheckFeedback.includes('Great news') ? '#A7F3D0' : '#E2E8F0'}`,
                  fontSize: '0.8rem',
                  fontWeight: 500,
                }}
              >
                {recheckFeedback}
              </div>
            )}
          </div>

          {/* 2. Compact 8-Domain Telemetry Checklist (Symmetrical 4-Column Grid) */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1.25rem 1.5rem',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
                marginBottom: '1rem',
              }}
            >
              <div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Domain Data Checklist (8 Pillars)
                </h4>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0 0' }}>
                  Institutional telemetry readiness across academic and campus services
                </p>
              </div>

              {/* Progress Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669' }}>
                  1 of 8 Connected (12.5%)
                </span>
                <div
                  style={{
                    width: '100px',
                    height: '6px',
                    borderRadius: '3px',
                    backgroundColor: '#E2E8F0',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: '12.5%',
                      height: '100%',
                      backgroundColor: '#059669',
                      borderRadius: '3px',
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '0.75rem',
              }}
            >
              {[
                { title: 'Student Identity', status: 'VERIFIED', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', icon: CheckCircle2 },
                { title: 'Examination Results', status: 'PENDING', color: '#B45309', bg: '#FEF3C7', border: '#FDE68A', icon: Clock },
                { title: 'Biometric Attendance', status: 'PENDING', color: '#B45309', bg: '#FEF3C7', border: '#FDE68A', icon: Clock },
                { title: 'Digital LMS Activity', status: 'PENDING', color: '#B45309', bg: '#FEF3C7', border: '#FDE68A', icon: Clock },
                { title: 'Placement Mock Tests', status: 'PENDING', color: '#B45309', bg: '#FEF3C7', border: '#FDE68A', icon: Clock },
                { title: 'Computing Lab Skills', status: 'PENDING', color: '#B45309', bg: '#FEF3C7', border: '#FDE68A', icon: Clock },
                { title: 'Co-Curricular Records', status: 'PENDING', color: '#B45309', bg: '#FEF3C7', border: '#FDE68A', icon: Clock },
                { title: 'Student Feedback Cell', status: 'READY', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE', icon: CheckCircle2 },
              ].map((domain, idx) => {
                const IconComp = domain.icon;
                return (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      backgroundColor: '#F8FAFC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IconComp size={15} color={domain.color} />
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1E293B' }}>
                        {domain.title}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: domain.bg,
                        color: domain.color,
                        border: `1px solid ${domain.border}`,
                      }}
                    >
                      {domain.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Symmetrical Semester Targets & Goals Form */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1.25rem 1.5rem',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)',
            }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={18} color="#1677D2" />
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Semester Targets & Career Direction
                </h4>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '3px 0 0 0' }}>
                Define personal milestones to benchmark against upcoming academic records.
              </p>
            </div>

            <form
              onSubmit={handleSaveGoals}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: '0.85rem',
                alignItems: 'flex-end',
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Target Semester CGPA
                </label>
                <input
                  type="text"
                  value={targetCgpa}
                  onChange={(e) => setTargetCgpa(e.target.value)}
                  placeholder="e.g. 8.5"
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.84rem',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                    backgroundColor: '#FFFFFF',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Career & Industry Aspiration
                </label>
                <input
                  type="text"
                  value={targetCareer}
                  onChange={(e) => setTargetCareer(e.target.value)}
                  placeholder="e.g. Software Development Engineer"
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.84rem',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                    backgroundColor: '#FFFFFF',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Core Focus Skills
                </label>
                <input
                  type="text"
                  value={targetSkills}
                  onChange={(e) => setTargetSkills(e.target.value)}
                  placeholder="e.g. Data Structures, Cloud Computing"
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.84rem',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                    backgroundColor: '#FFFFFF',
                  }}
                />
              </div>

              <div>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '0 16px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: goalsSaved ? '#059669' : '#1677D2',
                    color: '#FFFFFF',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <Check size={14} />
                  <span>{goalsSaved ? 'Saved ✓' : 'Save Milestones'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 1: SUCCESS COCKPIT & RISK RADAR (OVERVIEW) — REAL OR BENCHMARK PREVIEW
          ========================================================================= */}
      {activeTab === 'overview' && (hasCollegeRecords || previewBenchmark) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Sample Benchmark Preview Banner */}
          {previewBenchmark && !hasCollegeRecords && (
            <div
              style={{
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '8px',
                padding: '9px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#1E40AF' }}>
                <Sparkles size={16} color="#2563EB" />
                <span>
                  <strong>Sample Benchmark Preview Active</strong> — Demonstrating explainable analytics (Roll No: STU_0001 benchmark profile).
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewBenchmark(false)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #93C5FD',
                  backgroundColor: '#FFFFFF',
                  color: '#1D4ED8',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Exit Preview
              </button>
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
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
                    {student.successScore ?? scoreData?.score ?? 78.4}
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
                  • <strong>Academic Risk: {student.academicRisk === 'Pending Data' ? (scoreData?.academicRisk ?? 'Low') : student.academicRisk}</strong> (Zero backlogs, 8.42 CGPA, reliable submissions).<br />
                  • <strong>Placement Risk: {student.placementRisk === 'Pending Data' ? (scoreData?.placementRisk ?? 'Low to Moderate') : student.placementRisk}</strong> (Cognitive aptitude is solid; live coding and system design mock rounds will boost placement conversion).
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

          {/* Quick Navigation to Detailed Student Tabs */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0F172A' }}>
                Next Steps for Academic & Career Growth
              </div>
              <div style={{ fontSize: '0.80rem', color: '#64748B', marginTop: '3px' }}>
                Explore your detailed course attendance safety margins or verify technical placement benchmarks.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleTabChange('academic')}
                style={{
                  padding: '7px 14px',
                  backgroundColor: '#F8FAFC',
                  color: '#1E293B',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  fontSize: '0.80rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Inspect Courses & Attendance ➔
              </button>
              <button
                onClick={() => handleTabChange('placement')}
                style={{
                  padding: '7px 14px',
                  backgroundColor: '#1677D2',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.80rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Placement Readiness ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: COURSES & ATTENDANCE RADAR
          ========================================================================= */}
      {activeTab === 'academic' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {!hasCollegeRecords && !previewBenchmark ? (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#EFF6FF',
                  color: '#1677D2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                }}
              >
                <BookOpen size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                Course Attendance Telemetry Awaiting Ingestion
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#64748B', maxWidth: '580px', margin: '0 auto 1.25rem auto', lineHeight: 1.5 }}>
                Your department ({student.program}) has not yet published semester attendance registers or course enrollment sheets for Roll No <strong>{student.studentId}</strong>.
              </p>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.8rem',
                  color: '#475569',
                  fontWeight: 500,
                }}
              >
                <Clock size={15} color="#D97706" />
                <span>Statutory 75% AICTE rule applies once departmental CSV is imported</span>
              </div>
            </div>
          ) : (
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
                  Overall: {student.attendanceRate != null ? `${student.attendanceRate}%` : '88.5%'}
                </span>
              </div>

              <div className="responsive-table-wrapper">
                <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
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
          )}

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
          {(hasCollegeRecords || previewBenchmark) && (
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
          )}
    </div>
  )}

      {/* =========================================================================
          TAB 3: PLACEMENT READINESS & SKILLS
          ========================================================================= */}
      {activeTab === 'placement' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {!hasCollegeRecords && !previewBenchmark ? (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#EFF6FF',
                  color: '#1677D2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                }}
              >
                <Award size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                Placement Mock Assessment Telemetry Pending
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#64748B', maxWidth: '580px', margin: '0 auto 1.25rem auto', lineHeight: 1.5 }}>
                The Training & Placement Cell (TPO) has not yet recorded mock interview or aptitude test scores for Roll No <strong>{student.studentId}</strong>.
              </p>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.8rem',
                  color: '#475569',
                  fontWeight: 500,
                }}
              >
                <Sparkles size={15} color="#2563EB" />
                <span>You can track your self-declared technical skills and interview milestones below</span>
              </div>
            </div>
          ) : (
            /* Assessment Metrics Row */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.25rem' }}>
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
          )}

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
