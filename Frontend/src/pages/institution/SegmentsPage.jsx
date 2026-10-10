import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  RefreshCw,
  Users,
  AlertTriangle,
  Award,
  BookOpen,
  Laptop,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../services/api';

export default function SegmentsPage() {
  const navigate = useNavigate();
  const [segments, setSegments] = useState([]);
  const [rebuilding, setRebuilding] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    api.getSegments().then((data) => setSegments(data || []));
  }, []);

  const handleRebuild = async () => {
    setRebuilding(true);
    setStatusMessage(null);
    try {
      await api.rebuildSegments();
      const updated = await api.getSegments();
      setSegments(updated || []);
      setStatusMessage('Segment memberships recalculated successfully across active cohort.');
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setRebuilding(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
            Student Segmentation Archetypes
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.86rem' }}>
            Groups students with similar academic or placement needs so mentors and advisors can provide timely, personalized support.
          </p>
        </div>

        <button
          onClick={handleRebuild}
          disabled={rebuilding}
          style={{
            backgroundColor: '#1A73E8',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            padding: '9px 16px',
            fontWeight: 600,
            fontSize: '0.82rem',
            cursor: rebuilding ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <RefreshCw size={14} className={rebuilding ? 'spin' : ''} />
          <span>{rebuilding ? 'Recalculating Groups...' : 'Recalculate Student Groups'}</span>
        </button>
      </div>

      {statusMessage && (
        <div style={{ padding: '12px 18px', borderRadius: '8px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', fontSize: '0.85rem', fontWeight: 600 }}>
          {statusMessage}
        </div>
      )}

      {/* 5 Archetype Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
        {segments.map((seg) => (
          <div
            key={seg.key}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    backgroundColor: seg.urgency === 'high' ? '#FEE2E2' : seg.urgency === 'medium' ? '#FEF3C7' : '#DCFCE7',
                    color: seg.urgency === 'high' ? '#DC2626' : seg.urgency === 'medium' ? '#D97706' : '#16A34A',
                  }}
                >
                  {seg.urgency} Urgency
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                  Rule Key: {seg.key}
                </span>
              </div>

              <h3 style={{ margin: '14px 0 6px', fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                {seg.name}
              </h3>

              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B', lineHeight: '1.45' }}>
                {seg.description}
              </p>
            </div>

            <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Identified Members</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A' }}>
                  {seg.studentCount} Students
                </div>
              </div>

              <button
                onClick={() => navigate('/institution/students')}
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  color: '#1A73E8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>View Students</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
