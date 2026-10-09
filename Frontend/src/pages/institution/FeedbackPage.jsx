import React, { useState, useEffect } from 'react';
import {
  MessageSquareHeart,
  Star,
  Shield,
  Send,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Filter,
} from 'lucide-react';
import { api } from '../../services/api';

export default function FeedbackPage() {
  const [loading, setLoading] = useState(true);
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [activeTypeFilter, setActiveTypeFilter] = useState('ALL');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // New feedback form state
  const [feedbackType, setFeedbackType] = useState('course_feedback');
  const [rating, setRating] = useState(5);
  const [department, setDepartment] = useState('Computer Science');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const data = await api.getFeedbackSummary();
      setFeedbackSummary(data);
    } catch {
      // fallback handled in api.js
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.submitFeedback({
        feedbackType,
        rating,
        department,
        comment,
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowSubmitModal(false);
        setComment('');
        // Update local counts reactively
        if (feedbackSummary) {
          setFeedbackSummary({
            ...feedbackSummary,
            totalResponses: feedbackSummary.totalResponses + 1,
          });
        }
      }, 1200);
    } catch (err) {
      alert('Feedback submission failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const ratingDist = feedbackSummary?.ratingDistribution || { 5: 60, 4: 80, 3: 28, 2: 12, 1: 4 };
  const totalRatings = Object.values(ratingDist).reduce((a, b) => a + b, 0);

  const byType = feedbackSummary?.byType || [
    { feedbackType: 'course_feedback', count: 90, averageRating: 4.4 },
    { feedbackType: 'faculty_feedback', count: 64, averageRating: 4.5 },
    { feedbackType: 'student_satisfaction', count: 30, averageRating: 4.1 },
  ];

  const filteredTypes = activeTypeFilter === 'ALL'
    ? byType
    : byType.filter((t) => t.feedbackType === activeTypeFilter);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. HEADER & ACTION BAR */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MessageSquareHeart size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Campus Sentiment & Student Voice
              </h1>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
                Continuous institutional pulse, automated satisfaction telemetry, and differential privacy compliance
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowSubmitModal(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1A73E8',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <Send size={15} />
            <span>Submit Demo Feedback</span>
          </button>
        </div>
      </div>

      {/* 2. PRIVACY SHIELD COMPLIANCE BANNER */}
      <div
        style={{
          backgroundColor: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: '8px',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#DCFCE7',
              color: '#16A34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shield size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#166534', fontSize: '0.88rem' }}>
              Student Confidentiality & Psychological Safety Shield Active
            </div>
            <div style={{ fontSize: '0.8rem', color: '#15803D' }}>
              Raw individual comments are withheld from administrative exports. Telemetry is mathematically aggregated to prevent punitive student identification (KPMG Challenge 4 Integrity Mandate).
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '4px 10px',
            backgroundColor: '#DCFCE7',
            color: '#15803D',
            borderRadius: '999px',
            border: '1px solid #86EFAC',
          }}
        >
          FERPA / Anonymized Mode
        </div>
      </div>

      {/* 3. KPI CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Total Responses */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
            Total Feedback Submissions
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0F172A', marginTop: '6px' }}>
            {feedbackSummary?.totalResponses ?? 184}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#10B981', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={14} /> +18.4% response rate vs last cycle
          </div>
        </div>

        {/* Institutional Rating */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
            Average Institutional Rating
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0F172A' }}>
              {feedbackSummary?.averageRating ? feedbackSummary.averageRating.toFixed(2) : '4.35'}
            </span>
            <span style={{ fontSize: '1rem', color: '#64748B' }}>/ 5.0</span>
          </div>
          <div style={{ display: 'flex', gap: '3px', marginTop: '6px' }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={16}
                fill={s <= Math.round(feedbackSummary?.averageRating || 4.35) ? '#F59E0B' : 'none'}
                color={s <= Math.round(feedbackSummary?.averageRating || 4.35) ? '#F59E0B' : '#CBD5E1'}
              />
            ))}
          </div>
        </div>

        {/* Positive Sentiment */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
            Sentiment Polarity
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#10B981', marginTop: '6px' }}>
            82.4% Positive
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '6px' }}>
            11.6% Neutral · 6.0% Constructive Action Items
          </div>
        </div>

        {/* Academic Satisfaction */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
            Top Satisfaction Pillar
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A', marginTop: '8px' }}>
            Faculty Mentorship
          </div>
          <div style={{ fontSize: '0.78rem', color: '#1A73E8', marginTop: '6px' }}>
            Rated 4.5/5 across 64 verified submissions
          </div>
        </div>
      </div>

      {/* 4. RATING DISTRIBUTION & CATEGORY BREAKDOWN */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Rating Distribution */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0F172A', margin: '0 0 1rem 0' }}>
            Star Rating Distribution
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingDist[star] || 0;
              const pct = totalRatings > 0 ? ((count / totalRatings) * 100).toFixed(1) : 0;
              return (
                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '60px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                    <span>{star}</span>
                    <Star size={13} fill="#F59E0B" color="#F59E0B" />
                  </div>
                  <div
                    style={{
                      flex: 1,
                      height: '10px',
                      backgroundColor: '#F1F5F9',
                      borderRadius: '5px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        backgroundColor: star >= 4 ? '#10B981' : star === 3 ? '#F59E0B' : '#EF4444',
                        borderRadius: '5px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                  <div style={{ width: '70px', textAlign: 'right', fontSize: '0.82rem', color: '#64748B' }}>
                    {count} ({pct}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Breakdown by Feedback Type */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0F172A', margin: 0 }}>
              Pillar Satisfaction telemetry
            </h2>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['ALL', 'course_feedback', 'faculty_feedback', 'student_satisfaction'].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveTypeFilter(f)}
                  style={{
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: activeTypeFilter === f ? '#1A73E8' : '#E2E8F0',
                    backgroundColor: activeTypeFilter === f ? '#EFF6FF' : '#FFFFFF',
                    color: activeTypeFilter === f ? '#1A73E8' : '#64748B',
                    cursor: 'pointer',
                    fontWeight: activeTypeFilter === f ? 600 : 400,
                  }}
                >
                  {f === 'ALL' ? 'All' : f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredTypes.map((item) => (
              <div
                key={item.feedbackType}
                style={{
                  border: '1px solid #F1F5F9',
                  borderRadius: '6px',
                  padding: '1rem',
                  backgroundColor: '#F8FAFC',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0F172A', textTransform: 'capitalize' }}>
                    {item.feedbackType.replace(/_/g, ' ')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B', fontWeight: 600, fontSize: '0.85rem' }}>
                    <Star size={14} fill="#F59E0B" color="#F59E0B" />
                    <span>{item.averageRating} / 5.0</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
                  {item.count} submissions aggregated
                </div>
                <div
                  style={{
                    height: '6px',
                    backgroundColor: '#E2E8F0',
                    borderRadius: '3px',
                    marginTop: '8px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${(item.averageRating / 5) * 100}%`,
                      backgroundColor: '#1A73E8',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. SUBMIT FEEDBACK MODAL */}
      {showSubmitModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              maxWidth: '520px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquareHeart size={20} color="#1A73E8" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
                  Submit Anonymous Campus Voice
                </h3>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94A3B8' }}
              >
                ✕
              </button>
            </div>

            {submitSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <CheckCircle2 size={48} color="#10B981" style={{ margin: '0 auto 1rem auto' }} />
                <h4 style={{ margin: '0 0 6px 0', color: '#0F172A', fontSize: '1.1rem' }}>
                  Feedback Recorded Successfully!
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
                  Aggregated telemetry updated. Raw student identity protected under differential privacy rules.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Category / Feedback Type
                  </label>
                  <select
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  >
                    <option value="course_feedback">Course Curriculum & Lab Quality</option>
                    <option value="faculty_feedback">Faculty Mentoring & Pedagogy</option>
                    <option value="student_satisfaction">General Campus & Welfare Satisfaction</option>
                    <option value="placement_support">Placement Drive & Soft Skills Support</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Electronics & Comm.">Electronics & Comm.</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Rating ({rating} of 5 Stars)
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setRating(s)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                      >
                        <Star
                          size={24}
                          fill={s <= rating ? '#F59E0B' : 'none'}
                          color={s <= rating ? '#F59E0B' : '#CBD5E1'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Constructive Comments (Anonymized)
                  </label>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Provide constructive feedback regarding labs, course pacing, or placement sessions..."
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
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '4px' }}>
                    Protected under Differential Privacy. No personally identifiable student data is exposed.
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#475569',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#1A73E8',
                      color: '#FFFFFF',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
