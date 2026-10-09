import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  ShieldCheck,
  FileText,
  Database,
  ArrowRight,
  RefreshCw,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

const CATEGORIES = [
  {
    key: 'students',
    name: 'Student Roster Onboarding',
    desc: 'Student identity, department, cohort, enrollment year.',
    source: 'Registrar & Admissions ERP',
    columns: ['studentId', 'firstName', 'lastName', 'department', 'program', 'semester', 'enrollmentYear', 'cohort', 'email'],
    validationRule: 'Unique studentId, valid enrollment year, active semester 1-12.',
  },
  {
    key: 'academic',
    name: 'Academic Examinations',
    desc: 'Semester SGPA, CGPA, assessment marks, backlogs.',
    source: 'Controller of Examinations (CoE)',
    columns: ['studentId', 'term', 'subjectCode', 'subjectName', 'assessmentType', 'marksObtained', 'maxMarks', 'grade', 'cgpa', 'backlog'],
    validationRule: 'marksObtained <= maxMarks, 0.0 <= cgpa <= 10.0, registered studentId.',
  },
  {
    key: 'attendance',
    name: 'Attendance Telemetry',
    desc: 'Classroom attendance, sessions held vs attended.',
    source: 'Biometric RFID & Attendance Portal',
    columns: ['studentId', 'term', 'subjectCode', 'classesHeld', 'classesAttended', 'attendancePercentage'],
    validationRule: 'classesAttended <= classesHeld, 0% <= attendance <= 100%.',
  },
  {
    key: 'lms',
    name: 'LMS Digital Learning',
    desc: 'Assignments assigned/completed, active days, minutes.',
    source: 'Moodle / Canvas / Google Classroom',
    columns: ['studentId', 'periodStart', 'periodEnd', 'loginCount', 'activeDays', 'assignmentsAssigned', 'assignmentsCompleted', 'engagementMinutes'],
    validationRule: 'completed <= assigned, periodEnd >= periodStart, non-negative numbers.',
  },
  {
    key: 'placement',
    name: 'Placement Drives & Tests',
    desc: 'Aptitude, quantitative logic, mock interview scores.',
    source: 'Training & Placement Cell (TPO / HackerRank)',
    columns: ['studentId', 'assessmentType', 'score', 'maxScore', 'outcomeLabel', 'employerOrProgram'],
    validationRule: 'score <= maxScore, assessmentType in {aptitude, coding, mock_interview, ...}',
  },
  {
    key: 'skills',
    name: 'Skill & Lab Assessments',
    desc: 'DSA, programming labs, technical certifications.',
    source: 'Department Computing Labs',
    columns: ['studentId', 'skillCategory', 'skillName', 'score', 'maxScore'],
    validationRule: 'skillCategory in {technical, soft_skill}, score <= maxScore.',
  },
  {
    key: 'engagement',
    name: 'Co-Curricular Engagement',
    desc: 'Club leadership, hackathon participation, sports.',
    source: 'Student Affairs & Cultural Council',
    columns: ['studentId', 'activityType', 'activityName', 'hours', 'result'],
    validationRule: 'activityType in {event, club, hackathon, certification, workshop, sports, other}.',
  },
  {
    key: 'feedback',
    name: 'Feedback & Course Ratings',
    desc: 'Anonymous student satisfaction and course ratings.',
    source: 'IQAC Quality Assurance Cell',
    columns: ['studentId', 'feedbackType', 'rating', 'comment', 'visibility'],
    validationRule: '1 <= rating <= 5, visibility in {private, staff_only, aggregated}.',
  },
];

export default function IngestionPage() {
  const [selectedCategory, setSelectedCategory] = useState('academic');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [importReport, setImportReport] = useState(null);
  const [commitResult, setCommitResult] = useState(null);

  const activeCategoryMeta = CATEGORIES.find((c) => c.key === selectedCategory) || CATEGORIES[1];

  const generateSampleCsv = (catKey, withErrors = false) => {
    switch (catKey) {
      case 'students':
        return withErrors
          ? `studentId,firstName,lastName,department,program,semester,enrollmentYear,cohort,email\nSTU_0201,Aditya,Sen,Computer Science,B.Tech,6,2023,Cohort-2023-CSE,aditya.sen@campus.edu\nSTU_0202,Ritika,Nambiar,Data Science,B.Tech,4,2024,Cohort-2024-DS,ritika.n@campus.edu\nSTU_0203,Karan,Verma,Information Technology,B.Tech,15,1995,Cohort-Invalid,karan.v@campus.edu`
          : `studentId,firstName,lastName,department,program,semester,enrollmentYear,cohort,email\nSTU_0201,Aditya,Sen,Computer Science,B.Tech,6,2023,Cohort-2023-CSE,aditya.sen@campus.edu\nSTU_0202,Ritika,Nambiar,Data Science,B.Tech,4,2024,Cohort-2024-DS,ritika.n@campus.edu\nSTU_0203,Karan,Verma,Information Technology,B.Tech,6,2023,Cohort-2023-IT,karan.v@campus.edu`;

      case 'academic':
        return withErrors
          ? `studentId,term,subjectCode,subjectName,assessmentType,marksObtained,maxMarks,grade,cgpa,backlog\nSTU_0001,2026-S1,CS301,Data Structures and Algorithms,final,88,100,A,8.4,false\nSTU_0002,2026-S1,CS301,Data Structures and Algorithms,final,92,100,A+,9.1,false\nSTU_9999,2026-S1,CS301,Data Structures and Algorithms,final,70,100,B,7.0,false\nSTU_0003,2026-S1,IT301,Web Architecture,final,120,100,A+,11.5,false`
          : `studentId,term,subjectCode,subjectName,assessmentType,marksObtained,maxMarks,grade,cgpa,backlog\nSTU_0001,2026-S1,CS301,Data Structures and Algorithms,final,88,100,A,8.4,false\nSTU_0002,2026-S1,CS301,Data Structures and Algorithms,final,92,100,A+,9.1,false\nSTU_0003,2026-S1,IT301,Web Architecture,final,62,100,C,6.2,false\nSTU_0004,2026-S1,DS301,Machine Learning Foundations,final,78,100,B+,7.6,false`;

      case 'attendance':
        return withErrors
          ? `studentId,term,subjectCode,classesHeld,classesAttended,attendancePercentage\nSTU_0001,2026-S1,CS301,50,44,88.0\nSTU_0002,2026-S1,CS301,50,47,94.0\nSTU_0003,2026-S1,IT301,50,55,110.0`
          : `studentId,term,subjectCode,classesHeld,classesAttended,attendancePercentage\nSTU_0001,2026-S1,CS301,50,44,88.0\nSTU_0002,2026-S1,CS301,50,47,94.0\nSTU_0003,2026-S1,IT301,50,32,64.0\nSTU_0004,2026-S1,DS301,50,36,72.0`;

      case 'lms':
        return withErrors
          ? `studentId,periodStart,periodEnd,loginCount,activeDays,assignmentsAssigned,assignmentsCompleted,engagementMinutes\nSTU_0001,2026-01-01,2026-06-30,52,38,12,11,1850\nSTU_0002,2026-06-30,2026-01-01,68,44,12,15,2400`
          : `studentId,periodStart,periodEnd,loginCount,activeDays,assignmentsAssigned,assignmentsCompleted,engagementMinutes\nSTU_0001,2026-01-01,2026-06-30,52,38,12,11,1850\nSTU_0002,2026-01-01,2026-06-30,68,44,12,12,2400\nSTU_0003,2026-01-01,2026-06-30,18,12,12,5,420`;

      case 'placement':
        return withErrors
          ? `studentId,assessmentType,score,maxScore,outcomeLabel,employerOrProgram\nSTU_0001,aptitude,84,100,Cleared,National Qualifier Mock\nSTU_0002,invalid_type,55,100,Needs Preparation,Technical Mock Interview`
          : `studentId,assessmentType,score,maxScore,outcomeLabel,employerOrProgram\nSTU_0001,aptitude,84,100,Cleared,National Qualifier Mock\nSTU_0002,mock_interview,55,100,Needs Preparation,Technical Mock Interview\nSTU_0003,aptitude,48,100,Shortfall,Quantitative Diagnostic`;

      case 'skills':
        return withErrors
          ? `studentId,skillCategory,skillName,score,maxScore\nSTU_0001,technical,DSA & Problem Solving,86,100\nSTU_0002,gaming,Advanced Unreal Engine,110,100`
          : `studentId,skillCategory,skillName,score,maxScore\nSTU_0001,technical,DSA & Problem Solving,86,100\nSTU_0002,technical,Object Oriented Programming,92,100\nSTU_0003,soft_skill,Professional Communication,58,100`;

      case 'engagement':
        return withErrors
          ? `studentId,activityType,activityName,hours,result\nSTU_0001,hackathon,KPMG Innovation Challenge,24,Finalist\nSTU_0002,invalid_activity,Random Event,10,Completed`
          : `studentId,activityType,activityName,hours,result\nSTU_0001,hackathon,KPMG Innovation Challenge,24,Finalist\nSTU_0002,club,Google Developer Student Club,18,Core Lead\nSTU_0003,workshop,Cloud Computing Essentials,8,Completed`;

      case 'feedback':
        return withErrors
          ? `studentId,feedbackType,rating,comment,visibility\nSTU_0001,course_feedback,5,Excellent depth in practical algorithms,staff_only\nSTU_0002,course_feedback,9,Exceeds 5-star scale rating,public_leak`
          : `studentId,feedbackType,rating,comment,visibility\nSTU_0001,course_feedback,5,Excellent depth in practical algorithms,staff_only\nSTU_0002,faculty_feedback,4,Strong academic engagement in lectures,staff_only\nSTU_0003,student_satisfaction,3,Requires more guided lab sessions,staff_only`;

      default:
        return 'studentId,metric,value\nSTU_0001,score,85';
    }
  };

  const handleDownloadSample = (catKey, withErrors = false) => {
    const csvContent = generateSampleCsv(catKey, withErrors);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${catKey}_${withErrors ? 'with_errors_sample' : 'clean_template'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv')) {
        setUploadedFile(file);
        setImportReport(null);
        setCommitResult(null);
      } else {
        alert('Please upload a valid .csv dataset file.');
      }
    }
  };

  const handlePreviewUpload = async () => {
    if (!uploadedFile) return;
    setIsProcessing(true);
    setCommitResult(null);
    setImportReport(null);

    try {
      const res = await api.previewImport(selectedCategory, uploadedFile);
      setImportReport(res);
    } catch (err) {
      alert('Preview validation failed: ' + (err.message || 'Unknown network error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCommitUpload = async () => {
    if (!uploadedFile) return;
    setIsCommitting(true);
    try {
      const res = await api.commitImport(selectedCategory, uploadedFile);
      setCommitResult(res);
    } catch (err) {
      alert('Failed to commit records to MongoDB: ' + (err.message || 'Unknown database error'));
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '999px', backgroundColor: '#EBF3FE', color: '#1A73E8', fontSize: '0.76rem', fontWeight: 600, marginBottom: '8px' }}>
          <UploadCloud size={14} />
          <span>Pathway 1: Multi-Pillar Batch Data Ingestion Studio (KPMG Challenge 4)</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
              Batch Data Ingestion & Scalability Studio
            </h1>
            <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.88rem', maxWidth: '800px' }}>
              Upload departmental CSV dumps across all 8 student performance pillars. Automatically executes dry-run row-level validation, relational integrity checks, and triggers real-time MongoDB Success Score recalculation.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleDownloadSample(selectedCategory, false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#334155',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title="Download standard schema-compliant CSV file"
            >
              <Download size={14} color="#1A73E8" />
              <span>Download Clean Template</span>
            </button>
            <button
              onClick={() => handleDownloadSample(selectedCategory, true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #FECACA',
                backgroundColor: '#FEF2F2',
                color: '#991B1B',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title="Download sample with intentional error rows to test the bounded row validator"
            >
              <AlertTriangle size={14} color="#DC2626" />
              <span>Test Error Sample</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: 8 Pillar Categories */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', padding: '0 4px' }}>
            Select Source Category ({CATEGORIES.length} Pillars)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.key;
              return (
                <div
                  key={cat.key}
                  onClick={() => {
                    setSelectedCategory(cat.key);
                    setImportReport(null);
                    setCommitResult(null);
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: `1.5px solid ${isSelected ? '#1A73E8' : '#F1F5F9'}`,
                    backgroundColor: isSelected ? '#EBF3FE' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: isSelected ? '#1A73E8' : '#1E293B' }}>
                      {cat.name}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadSample(cat.key, false);
                      }}
                      title="Download template"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: isSelected ? '#1A73E8' : '#94A3B8',
                        cursor: 'pointer',
                        padding: '2px',
                      }}
                    >
                      <Download size={13} />
                    </button>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px', lineHeight: 1.3 }}>
                    {cat.desc}
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '0.68rem', color: isSelected ? '#1D4ED8' : '#94A3B8', fontWeight: 500 }}>
                    Source: {cat.source}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Ingestion Engine Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active Category Specification Card */}
          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={16} color="#1A73E8" />
                <span>Schema Specification: {activeCategoryMeta.name}</span>
              </div>
              <span style={{ fontSize: '0.72rem', backgroundColor: '#E2E8F0', color: '#334155', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>
                Target: {activeCategoryMeta.source}
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '10px' }}>
              <strong>Expected CSV Columns:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                {activeCategoryMeta.columns.map((col) => (
                  <code
                    key={col}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      fontSize: '0.74rem',
                      color: '#0F172A',
                      fontFamily: 'monospace',
                    }}
                  >
                    {col}
                  </code>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={14} color="#3B82F6" />
              <span><strong>Validation Constraint:</strong> {activeCategoryMeta.validationRule}</span>
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            style={{
              backgroundColor: isDragging ? '#EFF6FF' : '#FFFFFF',
              borderRadius: '12px',
              border: `2px dashed ${isDragging ? '#1A73E8' : '#CBD5E1'}`,
              padding: '36px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.15s ease',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: isDragging ? '#DBEAFE' : '#EBF3FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UploadCloud size={28} color="#1A73E8" />
            </div>

            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0F172A', fontWeight: 600 }}>
              Upload {activeCategoryMeta.name} Dataset (.CSV)
            </h3>

            <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B', maxWidth: '420px', lineHeight: 1.4 }}>
              Drag and drop your raw departmental CSV file here, or browse from your computer. Our streaming validator inspects every row prior to MongoDB storage.
            </p>

            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setUploadedFile(e.target.files[0]);
                  setImportReport(null);
                  setCommitResult(null);
                }
              }}
              style={{ display: 'none' }}
              id="csv-file-input"
            />

            <label
              htmlFor="csv-file-input"
              style={{
                backgroundColor: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '8px 18px',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
            >
              Browse CSV File
            </label>

            {uploadedFile && (
              <div
                style={{
                  marginTop: '10px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.82rem',
                  color: '#0F172A',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <FileText size={16} color="#1A73E8" />
                <span>
                  Ready: <strong>{uploadedFile.name}</strong> ({(uploadedFile.size / 1024).toFixed(1)} KB)
                </span>
                <button
                  onClick={() => {
                    setUploadedFile(null);
                    setImportReport(null);
                    setCommitResult(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    fontSize: '0.74rem',
                    marginLeft: '8px',
                    textDecoration: 'underline',
                  }}
                >
                  Clear
                </button>
              </div>
            )}

            {uploadedFile && (
              <button
                onClick={handlePreviewUpload}
                disabled={isProcessing}
                style={{
                  marginTop: '12px',
                  backgroundColor: '#1A73E8',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 1px 2px rgba(26,115,232,0.3)',
                }}
              >
                {isProcessing ? <RefreshCw size={15} className="spin" /> : <Database size={15} />}
                <span>{isProcessing ? 'Validating Dataset Rows...' : 'Run Dry-Run Preview & Validation'}</span>
              </button>
            )}
          </div>

          {/* Validation Report Card */}
          {importReport && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '22px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
                    Validation Summary Report ({importReport.importId})
                  </h4>
                  <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '2px' }}>
                    Dataset: <strong>{importReport.datasetType}</strong> · File: <strong>{importReport.fileName}</strong>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '0.74rem',
                    color: importReport.rejectedCount === 0 ? '#10B981' : '#D97706',
                    fontWeight: 600,
                    backgroundColor: importReport.rejectedCount === 0 ? '#DCFCE7' : '#FEF3C7',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  {importReport.rejectedCount === 0 ? <CheckCircle size={13} /> : <AlertTriangle size={13} />}
                  <span>{importReport.rejectedCount === 0 ? 'All Rows Passed Validation' : 'Row Range Violations Detected'}</span>
                </span>
              </div>

              {/* 3 Metric Summary Boxes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '18px' }}>
                <div style={{ backgroundColor: '#F0FDF4', padding: '14px', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 600, textTransform: 'uppercase' }}>Accepted Rows</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#15803D' }}>{importReport.acceptedCount}</div>
                  <div style={{ fontSize: '0.72rem', color: '#15803D', marginTop: '2px' }}>Ready for MongoDB insert</div>
                </div>

                <div style={{ backgroundColor: importReport.rejectedCount > 0 ? '#FEF2F2' : '#F8FAFC', padding: '14px', borderRadius: '8px', border: `1px solid ${importReport.rejectedCount > 0 ? '#FECACA' : '#E2E8F0'}` }}>
                  <div style={{ fontSize: '0.7rem', color: importReport.rejectedCount > 0 ? '#991B1B' : '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Rejected Rows</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: importReport.rejectedCount > 0 ? '#DC2626' : '#64748B' }}>{importReport.rejectedCount}</div>
                  <div style={{ fontSize: '0.72rem', color: importReport.rejectedCount > 0 ? '#DC2626' : '#64748B', marginTop: '2px' }}>Boundary or relational fails</div>
                </div>

                <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Total Rows Processed</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A' }}>{importReport.totalRows}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>Multi-pillar stream</div>
                </div>
              </div>

              {/* Bounded Row Errors Inspector */}
              {importReport.errors && importReport.errors.length > 0 && (
                <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '14px', marginBottom: '18px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#991B1B', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <AlertCircle size={15} color="#DC2626" />
                    <span>Bounded Row Inspector ({importReport.errors.length} Violations):</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {importReport.errors.map((err, i) => (
                      <div key={i} style={{ fontSize: '0.76rem', color: '#7F1D1D', backgroundColor: '#FFFFFF', padding: '8px 12px', borderRadius: '6px', border: '1px solid #FEE2E2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>Row {err.row}:</strong> {err.message}
                        </div>
                        {err.field && (
                          <span style={{ fontFamily: 'monospace', backgroundColor: '#FEE2E2', padding: '1px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>
                            field: {err.field}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Valid Records Preview */}
              {importReport.sampleValidRecords && importReport.sampleValidRecords.length > 0 && (
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Clean Record Preview (First {importReport.sampleValidRecords.length} Rows):
                  </div>
                  <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '6px' }}>
                    <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead style={{ backgroundColor: '#F8FAFC' }}>
                        <tr>
                          {Object.keys(importReport.sampleValidRecords[0]).map((k) => (
                            <th key={k} style={{ padding: '8px 12px', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 600 }}>
                              {k}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {importReport.sampleValidRecords.map((rec, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            {Object.values(rec).map((val, vIdx) => (
                              <td key={vIdx} style={{ padding: '8px 12px', color: '#1E293B', fontFamily: typeof val === 'number' ? 'monospace' : 'inherit' }}>
                                {typeof val === 'boolean' ? (val ? 'true' : 'false') : String(val ?? '—')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Commit Button & Confirmation */}
              {commitResult ? (
                <div
                  style={{
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803D', fontSize: '0.88rem', fontWeight: 700 }}>
                    <CheckCircle size={18} />
                    <span>Dataset Successfully Committed to MongoDB Database!</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#166534', lineHeight: 1.4 }}>
                    Batch Job <code>{commitResult.importId}</code> inserted <strong>{commitResult.committedRows}</strong> records into MongoDB. The explainable Student Success Score engine (<code>sss-v1</code>) and decoupled risk radar have dynamically updated for affected cohorts.
                  </p>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    <Link
                      to="/institution/students"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#15803D',
                        color: '#FFFFFF',
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      <span>View Student 360° Directory</span>
                      <ArrowRight size={13} />
                    </Link>
                    <Link
                      to="/institution/overview"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #BBF7D0',
                        color: '#166534',
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      <span>Check Recalculated KPIs</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <div style={{ fontSize: '0.76rem', color: '#64748B' }}>
                    Clicking commit writes verified records to the active MongoDB collections.
                  </div>
                  <button
                    onClick={handleCommitUpload}
                    disabled={isCommitting || importReport.acceptedCount === 0}
                    style={{
                      backgroundColor: '#0F172A',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      cursor: isCommitting || importReport.acceptedCount === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 1px 3px rgba(15,23,42,0.2)',
                    }}
                  >
                    {isCommitting ? <RefreshCw size={15} className="spin" /> : <Database size={15} />}
                    <span>{isCommitting ? 'Persisting to MongoDB...' : `Commit ${importReport.acceptedCount} Validated Rows to Database`}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
