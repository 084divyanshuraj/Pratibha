import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Users,
  ChevronRight,
  ArrowUpDown,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  GraduationCap,
  Briefcase,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StudentDrawer from '../../components/students/StudentDrawer';

export default function StudentDirectoryPage() {
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'institution_admin';
  const [searchParams, setSearchParams] = useSearchParams();

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState(searchParams.get('dept') || '');
  const [riskFilter, setRiskFilter] = useState(searchParams.get('risk') || '');
  const [personaChip, setPersonaChip] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStudents = () => {
    setLoading(true);
    api.getStudents({ search, department })
      .then((res) => {
        let list = res?.students || [];

        // Apply risk filters
        if (riskFilter === 'high') {
          list = list.filter((s) => s.academicRisk === 'high' || s.placementRisk === 'high');
        } else if (riskFilter === 'divergent') {
          list = list.filter((s) => s.cgpa >= 7.5 && s.placementRisk === 'high');
        }

        // Apply Persona Chips
        if (personaChip === 'mentees') {
          list = list.filter((s) => s.department === 'Computer Science' && s.cgpa <= 8.5);
        } else if (personaChip === 'attendance_warning') {
          list = list.filter((s) => s.attendanceRate < 75);
        } else if (personaChip === 'tier1_eligible') {
          list = list.filter((s) => s.cgpa >= 7.5 && (s.backlogs ?? 0) === 0);
        }

        setStudents(list);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
    const handleUpdate = () => fetchStudents();
    window.addEventListener('pratibha_data_updated', handleUpdate);
    return () => window.removeEventListener('pratibha_data_updated', handleUpdate);
  }, [search, department, riskFilter, personaChip]);

  // Export CSV Handler
  const handleExportCsv = () => {
    if (!students || students.length === 0) return;
    const headers = ['Student ID', 'Full Name', 'Department', 'Program', 'CGPA', 'Attendance %', 'Academic Risk', 'Placement Risk', 'Success Score', 'Data Completeness %'];
    const rows = students.map((s) => [
      `"${s.studentId || ''}"`,
      `"${s.fullName || ''}"`,
      `"${s.department || ''}"`,
      `"${s.program || ''}"`,
      s.cgpa ?? '',
      s.attendanceRate ?? '',
      `"${s.academicRisk || ''}"`,
      `"${s.placementRisk || ''}"`,
      s.successScore ?? '',
      `${s.dataCompleteness ?? 100}%`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pratibha_${role}_cohort_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Title & Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
              {role === 'faculty_mentor'
                ? 'CSE Mentorship & Student Directory'
                : role === 'placement_officer'
                ? 'Corporate Placement & Candidate Roster'
                : 'Student 360° Directory'}
            </h1>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '999px',
                backgroundColor: role === 'faculty_mentor' ? '#DCFCE7' : role === 'placement_officer' ? '#DBEAFE' : '#E2E8F0',
                color: role === 'faculty_mentor' ? '#15803D' : role === 'placement_officer' ? '#1D4ED8' : '#334155',
              }}
            >
              {role === 'faculty_mentor' ? 'Faculty Mentor View' : role === 'placement_officer' ? 'Placement Officer View' : 'Provost & Administrator View'}
            </span>
          </div>
          <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.85rem' }}>
            {role === 'faculty_mentor'
              ? 'Monitor mentee academic grades, track low attendance (<75%), and identify students needing tutoring support.'
              : role === 'placement_officer'
              ? 'Filter candidates by company eligibility criteria, inspect mock interview scores, and export candidate lists for visiting recruiters.'
              : 'Track student academic progress, attendance records, and placement readiness with decoupled risk indicators.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '0.82rem', color: '#64748B', backgroundColor: '#FFFFFF', padding: '6px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', fontWeight: 600 }}>
            Showing <strong>{students.length}</strong> Students
          </div>
          <button
            onClick={handleExportCsv}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: role === 'faculty_mentor' ? '#15803D' : role === 'placement_officer' ? '#1D4ED8' : '#0F172A',
              color: '#FFFFFF',
              border: 'none',
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
            title={role === 'placement_officer' ? 'Export eligible student roster for visiting recruiters' : 'Export filtered student roster as CSV'}
          >
            <Download size={14} />
            <span>{role === 'placement_officer' ? 'Export Recruiter Roster (CSV)' : role === 'faculty_mentor' ? 'Export Mentee Report (CSV)' : 'Export Roster (CSV)'}</span>
          </button>
        </div>
      </div>

      {/* Role-Specific Quick Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
          {role === 'faculty_mentor' ? 'Faculty Focus:' : role === 'placement_officer' ? 'TPO Focus:' : 'Admin Focus:'}
        </span>

        {role === 'faculty_mentor' && (
          <>
            <button
              onClick={() => {
                setDepartment('Computer Science');
                setPersonaChip(personaChip === 'mentees' ? '' : 'mentees');
              }}
              style={{
                padding: '5px 12px',
                borderRadius: '999px',
                fontSize: '0.76rem',
                fontWeight: 600,
                border: '1px solid #BBF7D0',
                backgroundColor: personaChip === 'mentees' ? '#16A34A' : '#F0FDF4',
                color: personaChip === 'mentees' ? '#FFFFFF' : '#15803D',
                cursor: 'pointer',
              }}
            >
              🎯 My CSE Mentees (Prof. Rajesh Kumar)
            </button>
            <button
              onClick={() => setPersonaChip(personaChip === 'attendance_warning' ? '' : 'attendance_warning')}
              style={{
                padding: '5px 12px',
                borderRadius: '999px',
                fontSize: '0.76rem',
                fontWeight: 600,
                border: '1px solid #FED7AA',
                backgroundColor: personaChip === 'attendance_warning' ? '#EA580C' : '#FFF7ED',
                color: personaChip === 'attendance_warning' ? '#FFFFFF' : '#C2410C',
                cursor: 'pointer',
              }}
            >
              ⚠ Statutory Attendance Alert (&lt;75%)
            </button>
          </>
        )}

        {role === 'placement_officer' && (
          <>
            <button
              onClick={() => setPersonaChip(personaChip === 'tier1_eligible' ? '' : 'tier1_eligible')}
              style={{
                padding: '5px 12px',
                borderRadius: '999px',
                fontSize: '0.76rem',
                fontWeight: 600,
                border: '1px solid #BFDBFE',
                backgroundColor: personaChip === 'tier1_eligible' ? '#2563EB' : '#EFF6FF',
                color: personaChip === 'tier1_eligible' ? '#FFFFFF' : '#1D4ED8',
                cursor: 'pointer',
              }}
            >
              💼 Tier-1 Placement Eligible (CGPA ≥ 7.5, 0 Backlogs)
            </button>
            <button
              onClick={() => {
                setRiskFilter(riskFilter === 'divergent' ? '' : 'divergent');
                setPersonaChip('');
              }}
              style={{
                padding: '5px 12px',
                borderRadius: '999px',
                fontSize: '0.76rem',
                fontWeight: 600,
                border: '1px solid #FDE68A',
                backgroundColor: riskFilter === 'divergent' ? '#D97706' : '#FFFBEB',
                color: riskFilter === 'divergent' ? '#FFFFFF' : '#B45309',
                cursor: 'pointer',
              }}
            >
              🚨 Mock Interview Deficit (Divergent Cluster)
            </button>
          </>
        )}

        {role === 'institution_admin' && (
          <>
            <button
              onClick={() => {
                setDepartment('');
                setRiskFilter('');
                setPersonaChip('');
              }}
              style={{
                padding: '5px 12px',
                borderRadius: '999px',
                fontSize: '0.76rem',
                fontWeight: 600,
                border: '1px solid #E2E8F0',
                backgroundColor: !department && !riskFilter && !personaChip ? '#0F172A' : '#FFFFFF',
                color: !department && !riskFilter && !personaChip ? '#FFFFFF' : '#475569',
                cursor: 'pointer',
              }}
            >
              🏛 All Departments (Cross-Campus)
            </button>
            <button
              onClick={() => {
                setRiskFilter(riskFilter === 'high' ? '' : 'high');
                setPersonaChip('');
              }}
              style={{
                padding: '5px 12px',
                borderRadius: '999px',
                fontSize: '0.76rem',
                fontWeight: 600,
                border: '1px solid #FECACA',
                backgroundColor: riskFilter === 'high' ? '#DC2626' : '#FEF2F2',
                color: riskFilter === 'high' ? '#FFFFFF' : '#B91C1C',
                cursor: 'pointer',
              }}
            >
              ⚡ High Risk Cohort
            </button>
          </>
        )}

        {(department || riskFilter || personaChip) && (
          <button
            onClick={() => {
              setDepartment('');
              setRiskFilter('');
              setPersonaChip('');
              setSearch('');
            }}
            style={{
              padding: '4px 10px',
              fontSize: '0.74rem',
              color: '#64748B',
              background: 'none',
              border: 'none',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '14px 18px',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}
      >
        {/* Search */}
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by student name or STU ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              fontSize: '0.84rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Department Filter */}
        <div style={{ flex: '0 1 200px' }}>
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setPersonaChip('');
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              fontSize: '0.84rem',
              outline: 'none',
              backgroundColor: '#FFFFFF',
              color: '#334155',
            }}
          >
            <option value="">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Data Science">Data Science</option>
            <option value="Electronics & Comm.">Electronics & Comm.</option>
          </select>
        </div>

        {/* Risk / Divergence Filter */}
        <div style={{ flex: '0 1 200px' }}>
          <select
            value={riskFilter}
            onChange={(e) => {
              setRiskFilter(e.target.value);
              setPersonaChip('');
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              fontSize: '0.84rem',
              outline: 'none',
              backgroundColor: '#FFFFFF',
              color: '#334155',
            }}
          >
            <option value="">All Risk Profiles</option>
            <option value="high">High Risk (Either Target)</option>
            <option value="divergent">Decoupled Divergent (High CGPA + Placement Risk)</option>
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 600 }}>
              <th style={{ padding: '12px 18px' }}>Student Profile</th>
              <th style={{ padding: '12px 16px' }}>Department & Program</th>
              <th style={{ padding: '12px 14px' }}>CGPA</th>
              <th style={{ padding: '12px 16px' }}>Attendance</th>
              <th style={{ padding: '12px 16px' }}>Success Score</th>
              <th style={{ padding: '12px 14px' }}>Academic Risk</th>
              <th style={{ padding: '12px 14px' }}>Placement Risk</th>
              <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr
                key={student.studentId}
                onClick={() => setSelectedStudent(student)}
                style={{
                  borderBottom: '1px solid #F1F5F9',
                  cursor: 'pointer',
                  transition: 'background-color 120ms ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {/* Profile Cell */}
                <td style={{ padding: '12px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={student.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100'}
                      alt={student.fullName}
                      style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.88rem' }}>{student.fullName}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B', fontFamily: 'monospace' }}>{student.studentId}</div>
                    </div>
                  </div>
                </td>

                {/* Department Cell */}
                <td style={{ padding: '12px 16px', color: '#475569' }}>
                  <div>{student.department}</div>
                  <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>Sem {student.semester} • {student.program}</div>
                </td>

                {/* CGPA */}
                <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0F172A' }}>
                  {student.cgpa}
                </td>

                {/* Attendance */}
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 600, color: student.attendanceRate >= 75 ? '#10B981' : '#EF4444' }}>
                      {student.attendanceRate}%
                    </span>
                    <div style={{ width: '50px', height: '5px', backgroundColor: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(100, student.attendanceRate)}%`,
                          height: '100%',
                          backgroundColor: student.attendanceRate >= 75 ? '#10B981' : '#EF4444',
                        }}
                      />
                    </div>
                  </div>
                </td>

                {/* Success Score */}
                <td style={{ padding: '12px 16px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: student.successScore >= 75 ? '#EBF3FE' : '#FEF3C7',
                      color: student.successScore >= 75 ? '#1A73E8' : '#D97706',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                    }}
                  >
                    {student.successScore}
                  </span>
                </td>

                {/* Academic Risk (Decoupled Model 1) */}
                <td style={{ padding: '12px 14px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      backgroundColor: student.academicRisk === 'high' ? '#FEE2E2' : student.academicRisk === 'medium' ? '#FEF3C7' : '#DCFCE7',
                      color: student.academicRisk === 'high' ? '#DC2626' : student.academicRisk === 'medium' ? '#D97706' : '#16A34A',
                    }}
                  >
                    {student.academicRisk}
                  </span>
                </td>

                {/* Placement Risk (Decoupled Model 2) */}
                <td style={{ padding: '12px 14px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      backgroundColor: student.placementRisk === 'high' ? '#FEE2E2' : student.placementRisk === 'medium' ? '#FEF3C7' : '#DCFCE7',
                      color: student.placementRisk === 'high' ? '#DC2626' : student.placementRisk === 'medium' ? '#D97706' : '#16A34A',
                    }}
                  >
                    {student.placementRisk}
                  </span>
                </td>

                {/* Action */}
                <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStudent(student);
                    }}
                    style={{
                      backgroundColor: '#F1F5F9',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      padding: '5px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#1A73E8',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Eye size={13} />
                    <span>View 360°</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide-over Drawer */}
      <StudentDrawer
        student={selectedStudent}
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
}
