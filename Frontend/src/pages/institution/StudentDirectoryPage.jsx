import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { api } from '../../services/api';
import StudentDrawer from '../../components/students/StudentDrawer';

export default function StudentDirectoryPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStudents = () => {
    setLoading(true);
    api.getStudents({ search, department })
      .then((res) => {
        let list = res?.students || [];
        if (riskFilter === 'high') {
          list = list.filter((s) => s.academicRisk === 'high' || s.placementRisk === 'high');
        } else if (riskFilter === 'divergent') {
          list = list.filter((s) => s.cgpa >= 7.5 && s.placementRisk === 'high');
        }
        setStudents(list);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, [search, department, riskFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Title & Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
            Student 360° Directory
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.85rem' }}>
            Verified institutional cohort tracking with decoupled academic and placement risk indicators.
          </p>
        </div>

        <div style={{ fontSize: '0.82rem', color: '#64748B', backgroundColor: '#FFFFFF', padding: '6px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', fontWeight: 600 }}>
          Showing <strong>{students.length}</strong> Students
        </div>
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
            onChange={(e) => setDepartment(e.target.value)}
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
            onChange={(e) => setRiskFilter(e.target.value)}
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
