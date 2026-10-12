import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  UserPlus,
  Edit3,
  Trash2,
  X,
  AlertCircle,
  RefreshCw,
  UploadCloud,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StudentDrawer from '../../components/students/StudentDrawer';

export default function StudentDirectoryPage() {
  const navigate = useNavigate();
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
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // CRUD State
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const [formData, setFormData] = useState({
    studentId: '',
    fullName: '',
    email: '',
    department: 'Computer Science',
    program: 'B.Tech',
    semester: 6,
    enrollmentYear: 2023,
    status: 'active',
    cgpa: 8.2,
    attendanceRate: 88,
    academicRisk: 'low',
    placementRisk: 'low',
  });

  const fetchStudents = () => {
    setLoading(true);
    api.getStudents({ search, department, limit: pageSize === 'all' ? 'all' : pageSize, page: currentPage })
      .then((res) => {
        let list = res?.students || [];
        setTotalCount(res?.pagination?.total ?? list.length);

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
  }, [search, department, riskFilter, personaChip, pageSize, currentPage]);

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

  // CRUD Handlers
  const handleOpenAddModal = () => {
    const maxNum = students.reduce((acc, s) => {
      const match = s.studentId?.match(/STU_(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return Math.max(acc, isNaN(num) ? 0 : num);
      }
      return acc;
    }, 25);
    const nextId = `STU_${String(maxNum + 1).padStart(4, '0')}`;

    setFormData({
      studentId: nextId,
      fullName: '',
      email: '',
      department: 'Computer Science',
      program: 'B.Tech',
      semester: 6,
      enrollmentYear: 2023,
      status: 'active',
      cgpa: 8.2,
      attendanceRate: 88,
      academicRisk: 'low',
      placementRisk: 'low',
    });
    setFormError('');
    setEditingStudent(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (student, e) => {
    if (e) e.stopPropagation();
    setEditingStudent(student);
    setFormData({
      studentId: student.studentId,
      fullName: student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim(),
      email: student.email || `${student.studentId.toLowerCase()}@campus.edu`,
      department: student.department || 'Computer Science',
      program: student.program || 'B.Tech',
      semester: student.semester || 6,
      enrollmentYear: student.enrollmentYear || 2023,
      status: student.status || 'active',
      cgpa: student.cgpa ?? 8.0,
      attendanceRate: student.attendanceRate ?? 85,
      academicRisk: student.academicRisk || 'low',
      placementRisk: student.placementRisk || 'low',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.studentId?.trim()) {
      setFormError('Student ID is required.');
      return;
    }
    if (!formData.fullName?.trim()) {
      setFormError('Full Name is required.');
      return;
    }
    const cgpaNum = Number(formData.cgpa);
    if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
      setFormError('CGPA must be a valid number between 0.0 and 10.0');
      return;
    }
    const attNum = Number(formData.attendanceRate);
    if (isNaN(attNum) || attNum < 0 || attNum > 100) {
      setFormError('Attendance Rate must be a valid percentage between 0% and 100%');
      return;
    }

    setSubmitting(true);
    try {
      if (editingStudent) {
        await api.updateStudent(editingStudent.studentId, {
          ...formData,
          cgpa: cgpaNum,
          attendanceRate: attNum,
        });
        setToastMessage(`Student ${formData.studentId} updated successfully.`);
      } else {
        await api.createStudent({
          ...formData,
          cgpa: cgpaNum,
          attendanceRate: attNum,
        });
        setToastMessage(`Student ${formData.studentId} created successfully.`);
      }
      setShowModal(false);
      setEditingStudent(null);
      fetchStudents();
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err) {
      setFormError(err.message || 'Failed to save student profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    setSubmitting(true);
    try {
      await api.deleteStudent(studentToDelete.studentId);
      setToastMessage(`Student ${studentToDelete.studentId} removed successfully.`);
      setStudentToDelete(null);
      fetchStudents();
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Title & Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#082B56', margin: 0, letterSpacing: '-0.3px' }}>
              {role === 'faculty_mentor'
                ? 'CSE Mentorship & Student Directory'
                : role === 'placement_officer'
                ? 'Corporate Placement & Candidate Roster'
                : 'Student 360° Directory'}
            </h1>
          </div>
          <p style={{ margin: '3px 0 0', color: '#64748B', fontSize: '0.84rem' }}>
            {role === 'faculty_mentor'
              ? 'Monitor mentee academic grades, track low attendance (<75%), and identify students needing tutoring support.'
              : role === 'placement_officer'
              ? 'Filter candidates by company eligibility criteria, inspect mock interview scores, and export candidate lists for visiting recruiters.'
              : 'Track student academic progress, attendance records, and placement readiness with decoupled risk indicators.'}
          </p>
        </div>

        <div className="directory-header-actions">
          <div className="directory-counter-card">
            <span>Showing <strong>{students.length}</strong> of <strong>{totalCount || students.length}</strong> Students</span>
            <div style={{ width: '1px', height: '14px', backgroundColor: '#CBD5E1' }} />
            <label style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 500 }}>Rows:</label>
            <select
              value={pageSize}
              onChange={(e) => {
                const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                setPageSize(val);
                setCurrentPage(1);
              }}
              style={{
                border: '1px solid #CBD5E1',
                borderRadius: '5px',
                padding: '2px 6px',
                fontSize: '0.76rem',
                color: '#1E293B',
                fontWeight: 600,
                backgroundColor: '#F8FAFC',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value="all">All</option>
            </select>
          </div>
          <button
            onClick={handleExportCsv}
            className="directory-action-btn secondary"
            title={role === 'placement_officer' ? 'Export eligible student roster for visiting recruiters' : 'Export filtered student roster as CSV'}
          >
            <Download size={14} />
            <span>{role === 'placement_officer' ? 'Export Recruiter Roster' : role === 'faculty_mentor' ? 'Export Mentee Report' : 'Export Roster CSV'}</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="directory-action-btn primary"
            title="Create a new student profile in directory"
          >
            <UserPlus size={14} />
            <span>+ Add Student</span>
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
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 600,
                border: '1px solid #BBF7D0',
                backgroundColor: personaChip === 'mentees' ? '#16A34A' : '#F0FDF4',
                color: personaChip === 'mentees' ? '#FFFFFF' : '#15803D',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              🎯 My CSE Mentees (Prof. Rajesh Kumar)
            </button>
            <button
              onClick={() => setPersonaChip(personaChip === 'attendance_warning' ? '' : 'attendance_warning')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 600,
                border: '1px solid #FED7AA',
                backgroundColor: personaChip === 'attendance_warning' ? '#EA580C' : '#FFF7ED',
                color: personaChip === 'attendance_warning' ? '#FFFFFF' : '#C2410C',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
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
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 600,
                border: '1px solid #BFDBFE',
                backgroundColor: personaChip === 'tier1_eligible' ? '#2563EB' : '#EFF6FF',
                color: personaChip === 'tier1_eligible' ? '#FFFFFF' : '#1D4ED8',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
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
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 600,
                border: '1px solid #FDE68A',
                backgroundColor: riskFilter === 'divergent' ? '#D97706' : '#FFFBEB',
                color: riskFilter === 'divergent' ? '#FFFFFF' : '#B45309',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
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
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 600,
                border: '1px solid #E2E8F0',
                backgroundColor: !department && !riskFilter && !personaChip ? '#0F172A' : '#FFFFFF',
                color: !department && !riskFilter && !personaChip ? '#FFFFFF' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
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
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 600,
                border: '1px solid #FECACA',
                backgroundColor: riskFilter === 'high' ? '#DC2626' : '#FEF2F2',
                color: riskFilter === 'high' ? '#FFFFFF' : '#B91C1C',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
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
      <div className="directory-filter-bar">
        {/* Search */}
        <div className="directory-search-input-wrap" style={{ position: 'relative' }}>
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
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Department Filter */}
        <div>
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
              boxSizing: 'border-box',
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
        <div>
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
              boxSizing: 'border-box',
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
        <div className="responsive-table-wrapper">
          <table style={{ width: '100%', minWidth: '840px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
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
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: (() => {
                          const gradients = [
                            'linear-gradient(135deg, #1677D2 0%, #082B56 100%)',
                            'linear-gradient(135deg, #0D9488 0%, #065F46 100%)',
                            'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)',
                            'linear-gradient(135deg, #D97706 0%, #92400E 100%)',
                            'linear-gradient(135deg, #0284C7 0%, #075985 100%)',
                            'linear-gradient(135deg, #E11D48 0%, #9F1239 100%)',
                          ];
                          let hash = 0;
                          const name = student.fullName || 'Student';
                          for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
                          return gradients[Math.abs(hash) % gradients.length];
                        })(),
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.80rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                      }}
                    >
                      {(student.fullName || 'ST')
                        .split(' ')
                        .filter(Boolean)
                        .map((p) => p[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase() || 'ST'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#082B56', fontSize: '0.88rem' }}>{student.fullName}</div>
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
                      borderRadius: '4px',
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
                      borderRadius: '4px',
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
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedStudent(student)}
                      style={{
                        backgroundColor: '#F1F5F9',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        padding: '5px 9px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        color: '#1A73E8',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 120ms ease',
                      }}
                      title="View Student 360° analytics drawer"
                    >
                      <Eye size={13} />
                      <span>360°</span>
                    </button>
                    <button
                      onClick={(e) => handleOpenEditModal(student, e)}
                      style={{
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        padding: '5px 8px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        color: '#475569',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        transition: 'all 120ms ease',
                      }}
                      title="Edit student profile and telemetry"
                    >
                      <Edit3 size={12} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setStudentToDelete(student);
                      }}
                      style={{
                        backgroundColor: '#FEF2F2',
                        border: '1px solid #FECACA',
                        borderRadius: '6px',
                        padding: '5px 7px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        color: '#DC2626',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        transition: 'all 120ms ease',
                      }}
                      title="Delete student and cascade all records"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '60px 24px', textAlign: 'center' }}>
                  {search || department || riskFilter || personaChip ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={24} color="#94A3B8" />
                      </div>
                      <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.98rem' }}>No student records matched your active filters</div>
                      <div style={{ fontSize: '0.82rem', color: '#64748B' }}>Try clearing your search term or resetting the department filter.</div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button
                          onClick={() => {
                            setDepartment('');
                            setRiskFilter('');
                            setPersonaChip('');
                            setSearch('');
                          }}
                          style={{
                            padding: '6px 14px',
                            backgroundColor: '#F1F5F9',
                            color: '#334155',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Clear All Filters
                        </button>
                        <button
                          onClick={handleOpenAddModal}
                          style={{
                            padding: '6px 14px',
                            backgroundColor: '#1E40AF',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          + Add Student Profile
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', maxWidth: '640px', margin: '0 auto' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UploadCloud size={28} color="#2563EB" />
                      </div>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '1.1rem', letterSpacing: '-0.2px' }}>
                        No Students Uploaded Yet for Your Account ({currentUser?.username ? `@${currentUser.username}` : currentUser?.name || 'Administrator'})
                      </div>
                      <div style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: 1.55 }}>
                        Aap ek real administrator profile ke roop me logged in hain. Yahan par sirf wahi student records show honge jo aapke account dwara upload ya create kiye gaye hon. Data Integration Studio se student roster CSV upload karein ya naya profile add karein.
                      </div>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button
                          onClick={() => navigate('/institution/ingestion')}
                          style={{
                            padding: '8px 18px',
                            backgroundColor: '#1E40AF',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '7px',
                            boxShadow: '0 2px 4px rgba(30,64,175,0.2)',
                          }}
                        >
                          <FileSpreadsheet size={15} />
                          <span>Go to Data Integration Studio (Upload CSV)</span>
                        </button>
                        <button
                          onClick={handleOpenAddModal}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#FFFFFF',
                            color: '#1E40AF',
                            border: '1px solid #BFDBFE',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <UserPlus size={15} />
                          <span>+ Add Student Manually</span>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Load 121 sample benchmark students into your workspace for demonstration and testing?')) {
                              api.loadSampleBenchmark();
                              fetchStudents();
                            }
                          }}
                          style={{
                            padding: '8px 14px',
                            backgroundColor: '#F8FAFC',
                            color: '#475569',
                            border: '1px solid #CBD5E1',
                            borderRadius: '8px',
                            fontSize: '0.80rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                          title="Quickly populate sample benchmark cohort into your account"
                        >
                          <RefreshCw size={14} />
                          <span>⚡ Load Sample Benchmark (121 Students)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>

        {/* Pagination Bar */}
        {totalCount > (typeof pageSize === 'number' ? pageSize : 0) && (
          <div
            style={{
              padding: '12px 18px',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FAFAFA',
              fontSize: '0.80rem',
              color: '#64748B',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              Showing page <strong>{currentPage}</strong> of <strong>{Math.ceil(totalCount / (typeof pageSize === 'number' ? pageSize : 1)) || 1}</strong> ({totalCount} total students)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: currentPage <= 1 ? '#F1F5F9' : '#FFFFFF',
                  color: currentPage <= 1 ? '#94A3B8' : '#334155',
                  cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                }}
              >
                Previous
              </button>
              <span style={{ padding: '0 6px', fontWeight: 600, color: '#1E293B' }}>
                {currentPage}
              </span>
              <button
                disabled={currentPage >= Math.ceil(totalCount / (typeof pageSize === 'number' ? pageSize : 1))}
                onClick={() => setCurrentPage((p) => p + 1)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: currentPage >= Math.ceil(totalCount / (typeof pageSize === 'number' ? pageSize : 1)) ? '#F1F5F9' : '#FFFFFF',
                  color: currentPage >= Math.ceil(totalCount / (typeof pageSize === 'number' ? pageSize : 1)) ? '#94A3B8' : '#334155',
                  cursor: currentPage >= Math.ceil(totalCount / (typeof pageSize === 'number' ? pageSize : 1)) ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over Drawer */}
      <StudentDrawer
        student={selectedStudent}
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />

      {/* Add / Edit Student Modal */}
      {showModal && (
        <>
          <div
            onClick={() => !submitting && setShowModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              backdropFilter: 'blur(3px)',
              zIndex: 1100,
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              zIndex: 1101,
              maxWidth: '680px',
              width: '92%',
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 24px',
                borderBottom: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: editingStudent ? '#EFF6FF' : '#F0FDF4',
                    color: editingStudent ? '#1D4ED8' : '#15803D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {editingStudent ? <Edit3 size={18} /> : <UserPlus size={18} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                    {editingStudent ? `Edit Student — ${editingStudent.studentId}` : 'Add New Student Profile'}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#64748B' }}>
                    {editingStudent
                      ? 'Update academic metrics, telemetry, and decoupled risk flags.'
                      : 'Enroll a new student into the active campus dataset.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                disabled={submitting}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveStudent} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {formError && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#B91C1C',
                    fontSize: '0.8rem',
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                {/* Student ID */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>
                    Student ID <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingStudent}
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value.toUpperCase() })}
                    placeholder="e.g. STU_0026"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.84rem',
                      fontFamily: 'monospace',
                      backgroundColor: editingStudent ? '#F1F5F9' : '#FFFFFF',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>
                    Full Name <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Ananya Sen"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.84rem',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ananya.sen@campus.edu"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.84rem',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Department */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>
                    Department <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.84rem',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Electronics & Comm.">Electronics & Comm.</option>
                    <option value="Mechanical">Mechanical</option>
                  </select>
                </div>

                {/* Program */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>
                    Degree Program
                  </label>
                  <select
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.84rem',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <option value="B.Tech">B.Tech</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="BCA">BCA</option>
                    <option value="MCA">MCA</option>
                  </select>
                </div>

                {/* Semester */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>
                    Current Semester (1-8)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.84rem',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* CGPA */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>
                    CGPA (0.00 – 10.00) <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.84rem',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Attendance Rate */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>
                    Attendance Rate % (0 – 100) <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    value={formData.attendanceRate}
                    onChange={(e) => setFormData({ ...formData, attendanceRate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.84rem',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Academic Risk */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>
                    Academic Risk Level
                  </label>
                  <select
                    value={formData.academicRisk}
                    onChange={(e) => setFormData({ ...formData, academicRisk: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.84rem',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high">High Risk</option>
                  </select>
                </div>

                {/* Placement Risk */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>
                    Placement Risk Level
                  </label>
                  <select
                    value={formData.placementRisk}
                    onChange={(e) => setFormData({ ...formData, placementRisk: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.84rem',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high">High Risk</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '12px',
                  paddingTop: '16px',
                  borderTop: '1px solid #E2E8F0',
                }}
              >
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: editingStudent ? '#2563EB' : '#15803D',
                    color: '#FFFFFF',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  {submitting && <RefreshCw size={14} className="animate-spin" />}
                  <span>{editingStudent ? 'Save Changes' : 'Create Student'}</span>
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <>
          <div
            onClick={() => !submitting && setStudentToDelete(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              backdropFilter: 'blur(3px)',
              zIndex: 1100,
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              zIndex: 1101,
              maxWidth: '460px',
              width: '92%',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                  Delete Student Profile?
                </h3>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748B', lineHeight: 1.5 }}>
                  Are you sure you want to permanently delete <strong>{studentToDelete.fullName}</strong> (
                  <span style={{ fontFamily: 'monospace' }}>{studentToDelete.studentId}</span>)?
                  This action will cascade delete all academic scores, attendance telemetry, and risk predictions.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '22px' }}>
              <button
                type="button"
                disabled={submitting}
                onClick={() => setStudentToDelete(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmDelete}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {submitting && <RefreshCw size={14} className="animate-spin" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '12px 18px',
            borderRadius: '10px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.84rem',
            fontWeight: 500,
            zIndex: 1200,
            animation: 'fadeIn 200ms ease',
          }}
        >
          <CheckCircle size={16} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
