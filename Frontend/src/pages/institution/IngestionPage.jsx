import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle,
  AlertCircle,
  Info,
  ShieldCheck,
  FileText,
  Database,
  ArrowRight,
} from 'lucide-react';
import { IMAGES } from '../../assets/images';
import { api } from '../../services/api';

const CATEGORIES = [
  { key: 'academic', name: 'Academic Records', desc: 'Semester SGPA, CGPA, backlogs, and earned credits.', sampleFile: 'academic.csv' },
  { key: 'attendance', name: 'Attendance Records', desc: 'Classroom attendance percentage, sessions held and attended.', sampleFile: 'attendance.csv' },
  { key: 'lms', name: 'LMS Activity', desc: 'Digital assignments assigned/completed, active portal days.', sampleFile: 'lms.csv' },
  { key: 'placement', name: 'Placement Tests', desc: 'Aptitude, quantitative logic, and mock interview test scores.', sampleFile: 'placement.csv' },
  { key: 'skills', name: 'Skill Assessments', desc: 'Laboratory programming, DSA, and technical certifications.', sampleFile: 'skills.csv' },
  { key: 'engagement', name: 'Co-Curricular Engagement', desc: 'Club leadership, hackathon participation, and sports.', sampleFile: 'engagement.csv' },
  { key: 'feedback', name: 'Student & Faculty Feedback', desc: 'Student satisfaction, faculty notes, and course ratings.', sampleFile: 'feedback.csv' },
];

export default function IngestionPage() {
  const [selectedCategory, setSelectedCategory] = useState('academic');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [importReport, setImportReport] = useState(null);
  const [commitSuccess, setCommitSuccess] = useState(false);

  const handleDownloadSample = (catKey) => {
    // Generate synthetic sample CSV data on the fly
    const csvContent =
      catKey === 'academic'
        ? 'studentId,term,sgpa,cgpa,backlogs,creditsEarned\nSTU_0001,2026-S1,8.4,8.2,0,22\nSTU_0002,2026-S1,9.1,9.0,0,24'
        : catKey === 'attendance'
        ? 'studentId,term,courseCode,classesHeld,classesAttended\nSTU_0001,2026-S1,CS301,50,44\nSTU_0002,2026-S1,CS301,50,48'
        : 'studentId,category,metric,value\nSTU_0001,sample,score,85\nSTU_0002,sample,score,92';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sample_${catKey}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreviewUpload = async () => {
    if (!uploadedFile) return;
    setIsProcessing(true);
    setCommitSuccess(false);
    setImportReport(null);

    try {
      const res = await api.previewImport(selectedCategory, uploadedFile);
      setImportReport(res);
    } catch (err) {
      alert('Preview validation failed: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCommitUpload = async () => {
    if (!uploadedFile) return;
    setIsCommitting(true);
    try {
      await api.commitImport(selectedCategory, uploadedFile);
      setCommitSuccess(true);
    } catch (err) {
      alert('Failed to commit records to MongoDB: ' + err.message);
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Title */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '999px', backgroundColor: '#F1F5F9', color: '#475569', fontSize: '0.74rem', fontWeight: 600, marginBottom: '6px' }}>
          <UploadCloud size={13} />
          <span>Batch Data Ingestion Engine (Phase 4 Specification)</span>
        </div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
          Batch Data Ingestion Studio
        </h1>
        <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.86rem' }}>
          Import raw departmental CSV datasets across all 7 student performance categories with row-level validation.
        </p>
      </div>

      {/* Grid: 7 Pillars Selector + Uploader */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Category List */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px', padding: '0 4px' }}>
            Select Source Category
          </div>
          {CATEGORIES.map((cat) => (
            <div
              key={cat.key}
              onClick={() => {
                setSelectedCategory(cat.key);
                setImportReport(null);
              }}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${selectedCategory === cat.key ? '#1A73E8' : '#F1F5F9'}`,
                backgroundColor: selectedCategory === cat.key ? '#EBF3FE' : '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: selectedCategory === cat.key ? '#1A73E8' : '#1E293B' }}>
                  {cat.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>
                  {cat.desc}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadSample(cat.key);
                }}
                title="Download Sample CSV Template"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <Download size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Uploader Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '2px dashed #CBD5E1',
              padding: '36px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#EBF3FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UploadCloud size={28} color="#1A73E8" />
            </div>

            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0F172A' }}>
              Upload {CATEGORIES.find((c) => c.key === selectedCategory)?.name} CSV
            </h3>

            <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B', maxWidth: '400px' }}>
              Drag and drop your dataset file here, or browse from your workstation.
            </p>

            <input
              type="file"
              accept=".csv"
              onChange={(e) => setUploadedFile(e.target.files[0])}
              style={{ display: 'none' }}
              id="csv-file-input"
            />

            <label
              htmlFor="csv-file-input"
              style={{
                backgroundColor: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              Browse CSV File
            </label>

            {uploadedFile && (
              <div style={{ marginTop: '8px', fontSize: '0.82rem', color: '#0F172A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={16} color="#1A73E8" />
                <span>Selected: {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}

            {uploadedFile && (
              <button
                onClick={handlePreviewUpload}
                disabled={isProcessing}
                style={{
                  marginTop: '10px',
                  backgroundColor: '#1A73E8',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Database size={15} />
                <span>{isProcessing ? 'Validating Dataset Rows...' : 'Run Preview & Validation'}</span>
              </button>
            )}
          </div>

          {/* Import Validation Report */}
          {importReport && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 600, color: '#0F172A' }}>
                  Import Validation Summary Report ({importReport.importId})
                </h4>
                <span style={{ fontSize: '0.74rem', color: '#10B981', fontWeight: 600, backgroundColor: '#DCFCE7', padding: '3px 8px', borderRadius: '999px' }}>
                  Preview Verified
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase' }}>Accepted Rows</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10B981' }}>{importReport.acceptedCount}</div>
                </div>

                <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase' }}>Rejected Rows</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#DC2626' }}>{importReport.rejectedCount}</div>
                </div>

                <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase' }}>Warnings</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#D97706' }}>{importReport.warningsCount || 0}</div>
                </div>
              </div>

              {/* Row Errors */}
              {importReport.errors && importReport.errors.length > 0 && (
                <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#991B1B', marginBottom: '6px' }}>
                    Validation Errors (Bounded Row Inspector):
                  </div>
                  {importReport.errors.map((err, i) => (
                    <div key={i} style={{ fontSize: '0.74rem', color: '#7F1D1D', marginTop: '4px' }}>
                      • <strong>Row {err.row} [{err.studentId}]:</strong> {err.message}
                    </div>
                  ))}
                </div>
              )}

              {/* Commit Button to Persist in MongoDB */}
              {commitSuccess ? (
                <div
                  style={{
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#15803D',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle size={18} />
                  <span>Dataset Successfully Committed to MongoDB Database! Real analytics recalculated.</span>
                </div>
              ) : (
                <button
                  onClick={handleCommitUpload}
                  disabled={isCommitting || importReport.acceptedCount === 0}
                  style={{
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: isCommitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Database size={15} />
                  <span>{isCommitting ? 'Persisting to MongoDB...' : `Commit ${importReport.acceptedCount} Validated Rows to Database`}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
