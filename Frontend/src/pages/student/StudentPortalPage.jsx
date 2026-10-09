import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Award,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  TrendingUp,
  Clock,
  Sparkles,
  Target,
  Send,
  Star,
  Shield,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { STUDENT_AVATARS } from '../../assets/images';

export default function StudentPortalPage() {
  const [activeTab, setActiveTab] = useState('academic');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');

  // Aarav Sharma demo profile data matching backend records
  const student = {
    studentId: 'STU_0001',
    fullName: 'Aarav Sharma',
    avatar: STUDENT_AVATARS[0],
    program: 'B.Tech Computer Science & Engineering',
    semester: 'Semester 6',
    email: 'aarav.sharma@campus.edu',
    cgpa: 8.4,
    attendanceRate: 88.0,
    successScore: 78.4,
    academicRisk: 'low',
    placementRisk: 'low',
    dataCompleteness: 100,
  };

  const scoreDrivers = [
    { title: 'Academic Foundation', score: 84.0, weight: '35%', contribution: '+29.4', detail: 'Consistent SGPA > 8.0 across core theory & practicals' },
    { title: 'Classroom Attendance', score: 88.0, weight: '20%', contribution: '+17.6', detail: '88% aggregate attendance across 4 credit courses' },
    { title: 'Placement & Mock Tests', score: 75.0, weight: '20%', contribution: '+15.0', detail: 'Solid aptitude (82%), mock technical interview (68%)' },
    { title: 'LMS Platform Activity', score: 82.0, weight: '15%', contribution: '+12.3', detail: '100% quiz submission rate in operating systems' },
    { title: 'Co-curricular Engagement', score: 70.0, weight: '10%', contribution: '+4.1', detail: 'Member of ACM Student Chapter & Hackathon Team' },
  ];

  const attendanceCourses = [
    { code: 'CS301', name: 'Distributed Operating Systems', attended: 44, total: 50, pct: 88 },
    { code: 'CS302', name: 'Database Management Systems', attended: 46, total: 50, pct: 92 },
    { code: 'CS303', name: 'Design & Analysis of Algorithms', attended: 42, total: 50, pct: 84 },
    { code: 'CS304', name: 'Compiler Engineering', attended: 38, total: 50, pct: 76, warning: true },
  ];

  const enrolledInterventions = [
    {
      title: 'Technical Mock Interview & Aptitude Bootcamp',
      type: 'Career Acceleration',
      date: 'Starting Next Monday (10:00 AM)',
      venue: 'Lab 302 / Placement Center',
      status: 'Enrolled',
      mentor: 'Prof. Rajesh Kumar',
    },
    {
      title: 'Competitive Coding & DSA Mentorship',
      type: 'Skill Enhancement',
      date: 'Every Wednesday (4:00 PM)',
      venue: 'Seminar Hall B',
      status: 'Active',
      mentor: 'ACM Student Scholars',
    },
  ];

  const handleSendFeedback = (e) => {
    e.preventDefault();
    api.submitFeedback({
      feedbackType: 'course_feedback',
      rating: feedbackRating,
      department: 'Computer Science',
      comment: feedbackText,
    });
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackSent(false);
      setFeedbackText('');
    }, 2500);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. STUDENT PROFILE HEADER */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
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
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid #1A73E8',
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                {student.fullName}
              </h1>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  borderRadius: '999px',
                  border: '1px solid #A7F3D0',
                }}
              >
                Good Standing
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>
              ID: <strong>{student.studentId}</strong> · {student.program} · {student.semester}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '2px' }}>
              Campus Email: {student.email}
            </div>
          </div>
        </div>

        {/* Quick Snapshot Metrics */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
              Cumulative CGPA
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' }}>
              {student.cgpa} <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>/ 10.0</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
              Overall Attendance
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10B981' }}>
              {student.attendanceRate}%
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
              Data Completeness
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1A73E8' }}>
              100%
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUCCESS SCORE & EXPLAINABLE DRIVERS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Success Score Rating Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
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
                Your Pratibha Success Score
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  backgroundColor: '#EFF6FF',
                  color: '#1A73E8',
                  borderRadius: '4px',
                }}
              >
                Model v1.0 (Explainable)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', margin: '1.5rem 0' }}>
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  border: '6px solid #1A73E8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  color: '#1A73E8',
                  backgroundColor: '#F8FAFC',
                }}
              >
                {student.successScore}
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
                  Strong Academic Trajectory
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '4px' }}>
                  You rank in the top 22% of your cohort. Your academic foundations and attendance are robust.
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '6px',
              padding: '1rem',
              border: '1px solid #E2E8F0',
              fontSize: '0.8rem',
              color: '#475569',
            }}
          >
            <strong>Decoupled Risk Status:</strong> Academic Risk is Low. Placement Risk is Low to Moderate. Increasing mock interview participation will elevate your overall placement readiness.
          </div>
        </div>

        {/* Explainable Factor Contributions */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Score Breakdown & Weightage
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {scoreDrivers.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{item.title}</span>
                  <span style={{ color: '#1A73E8', fontWeight: 600 }}>{item.contribution} pts ({item.weight})</span>
                </div>
                <div style={{ height: '6px', backgroundColor: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${item.score}%`,
                      backgroundColor: '#10B981',
                      borderRadius: '3px',
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{item.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. TRANSCRIPT & ATTENDANCE DETAILS */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          overflow: 'hidden',
        }}
      >
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
          {[
            { id: 'academic', label: 'Course Attendance & Labs', icon: BookOpen },
            { id: 'placement', label: 'Placement & Mock Interviews', icon: Award },
            { id: 'interventions', label: 'My Enrolled Interventions', icon: Sparkles },
            { id: 'feedback', label: 'Student Voice & Feedback', icon: Send },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 18px',
                  backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #1A73E8' : '2px solid transparent',
                  color: isActive ? '#1A73E8' : '#64748B',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Course Attendance */}
        {activeTab === 'academic' && (
          <div style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0F172A', margin: '0 0 1rem 0' }}>
              Current Semester Course Attendance Telemetry
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '10px 14px', color: '#475569' }}>Course Code</th>
                    <th style={{ padding: '10px 14px', color: '#475569' }}>Course Name</th>
                    <th style={{ padding: '10px 14px', color: '#475569' }}>Classes Attended</th>
                    <th style={{ padding: '10px 14px', color: '#475569' }}>Attendance Rate</th>
                    <th style={{ padding: '10px 14px', color: '#475569', textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceCourses.map((c) => (
                    <tr key={c.code} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0F172A' }}>{c.code}</td>
                      <td style={{ padding: '10px 14px', color: '#334155' }}>{c.name}</td>
                      <td style={{ padding: '10px 14px', color: '#64748B' }}>{c.attended} / {c.total}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600, color: c.pct >= 85 ? '#10B981' : c.pct >= 75 ? '#F59E0B' : '#EF4444' }}>
                            {c.pct}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        {c.warning ? (
                          <span style={{ padding: '3px 8px', borderRadius: '4px', backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '0.75rem', fontWeight: 600 }}>
                            Near 75% Threshold
                          </span>
                        ) : (
                          <span style={{ padding: '3px 8px', borderRadius: '4px', backgroundColor: '#ECFDF5', color: '#059669', fontSize: '0.75rem', fontWeight: 600 }}>
                            Optimal
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

        {/* Tab 2: Placement & Mock Tests */}
        {activeTab === 'placement' && (
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0F172A', margin: 0 }}>
              Placement Readiness & Mock Drive Results
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '6px', padding: '1rem', backgroundColor: '#F8FAFC' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Cognitive & Aptitude Assessment</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0F172A', margin: '6px 0' }}>82 / 100</div>
                <div style={{ fontSize: '0.75rem', color: '#10B981' }}>Qualified for Tier-1 Tech On-Campus Rounds</div>
              </div>

              <div style={{ border: '1px solid #E2E8F0', borderRadius: '6px', padding: '1rem', backgroundColor: '#F8FAFC' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Technical Mock Interview (DSA & System Design)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0F172A', margin: '6px 0' }}>68 / 100</div>
                <div style={{ fontSize: '0.75rem', color: '#F59E0B' }}>Action item: Strengthen live code explaining under time pressure</div>
              </div>

              <div style={{ border: '1px solid #E2E8F0', borderRadius: '6px', padding: '1rem', backgroundColor: '#F8FAFC' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Verified Technical Skills</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#EFF6FF', color: '#1A73E8', padding: '3px 8px', borderRadius: '4px' }}>Python (Advanced)</span>
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#EFF6FF', color: '#1A73E8', padding: '3px 8px', borderRadius: '4px' }}>Data Structures (Advanced)</span>
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#EFF6FF', color: '#1A73E8', padding: '3px 8px', borderRadius: '4px' }}>SQL (Proficient)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Enrolled Interventions */}
        {activeTab === 'interventions' && (
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0F172A', margin: 0 }}>
              Assigned Support Programs & Coaching
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {enrolledInterventions.map((prog, idx) => (
                <div
                  key={idx}
                  style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
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
                      <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.95rem' }}>{prog.title}</span>
                      <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#EFF6FF', color: '#1A73E8' }}>{prog.type}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>
                      {prog.date} · Venue: {prog.venue}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                      Coordinated by {prog.mentor}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '4px 12px',
                      backgroundColor: '#ECFDF5',
                      color: '#059669',
                      borderRadius: '999px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                    }}
                  >
                    {prog.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Student Voice & Feedback */}
        {activeTab === 'feedback' && (
          <div style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0F172A', margin: '0 0 0.5rem 0' }}>
              Direct Anonymous Feedback & Campus Voice
            </h3>
            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.82rem', color: '#64748B' }}>
              Your feedback is anonymous and aggregated. Share suggestions regarding lab hardware, course pace, or placement assistance.
            </p>

            {feedbackSent ? (
              <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#F0FDF4', borderRadius: '6px' }}>
                <CheckCircle2 size={36} color="#16A34A" style={{ margin: '0 auto 8px auto' }} />
                <div style={{ fontWeight: 600, color: '#166534' }}>Thank you, Aarav! Your feedback was recorded.</div>
                <div style={{ fontSize: '0.8rem', color: '#15803D', marginTop: '4px' }}>Telemetry updated anonymously.</div>
              </div>
            ) : (
              <form onSubmit={handleSendFeedback} style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    How would you rate your current semester academic experience?
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
                          size={22}
                          fill={s <= feedbackRating ? '#F59E0B' : 'none'}
                          color={s <= feedbackRating ? '#F59E0B' : '#CBD5E1'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Constructive Suggestions / Feedback
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="E.g., More hands-on mock interview slots for cloud engineering..."
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      outline: 'none',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    style={{
                      padding: '8px 18px',
                      backgroundColor: '#1A73E8',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Send size={14} />
                    <span>Send Anonymous Feedback</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
