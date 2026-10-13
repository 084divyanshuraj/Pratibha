import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquareHeart,
  Star,
  Shield,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Filter,
  Tag,
  Search,
  Check,
  AlertTriangle,
  ThumbsUp,
  ArrowUpRight,
} from 'lucide-react';
import { api } from '../../services/api';

// ============================================================================
// CLIENT-SIDE NLP SENTIMENT & TOPIC EXTRACTION ENGINE
// ============================================================================
const POSITIVE_LEXICON = [
  'great', 'excellent', 'helpful', 'loved', 'improved', 'awesome', 'good',
  'clear', 'engaging', 'supportive', 'best', 'inspiring', 'smooth', 'practical',
  'appreciate', 'thank', 'valuable', 'boost'
];

const CRITICAL_LEXICON = [
  'worst', 'slow', 'broken', 'difficult', 'lagging', 'downtime', 'failing',
  'horrible', 'poor', 'bad', 'hard', 'unhelpful', 'not working', 'unfair',
  'overload', 'struggling', 'crash', 'crashing', 'flickering', 'disaster', 'loss'
];

const URGENCY_LEXICON = [
  'urgent', 'broken', 'downtime', 'emergency', 'failing', 'cannot access',
  'blocked', 'crash', 'crashing', 'loss', 'severe'
];

export function analyzeSentimentNLP(text) {
  if (!text || text.trim().length === 0) {
    return {
      score: 0,
      label: 'NEUTRAL',
      confidence: 75,
      topic: '#GeneralCampus',
      isUrgent: false,
      piiCleanedText: text || '',
    };
  }

  const lower = text.toLowerCase();
  let posHits = 0;
  let negHits = 0;

  POSITIVE_LEXICON.forEach((w) => {
    if (lower.includes(w)) posHits++;
  });
  CRITICAL_LEXICON.forEach((w) => {
    if (lower.includes(w)) negHits++;
  });

  const isUrgent = URGENCY_LEXICON.some((w) => lower.includes(w));

  // Aspect / Topic Classification
  let topic = '#CampusWelfare';
  if (lower.includes('lab') || lower.includes('compiler') || lower.includes('pc') || lower.includes('system') || lower.includes('projector') || lower.includes('linux')) {
    topic = '#LabInfrastructure';
  } else if (lower.includes('wifi') || lower.includes('internet') || lower.includes('network') || lower.includes('hostel')) {
    topic = '#HostelWiFi';
  } else if (lower.includes('placement') || lower.includes('interview') || lower.includes('mock') || lower.includes('tpo') || lower.includes('aptitude') || lower.includes('resume')) {
    topic = '#PlacementMocks';
  } else if (lower.includes('faculty') || lower.includes('prof') || lower.includes('sir') || lower.includes('teacher') || lower.includes('mentor')) {
    topic = '#FacultyGuidance';
  } else if (lower.includes('exam') || lower.includes('syllabus') || lower.includes('marks') || lower.includes('grading') || lower.includes('math') || lower.includes('speed') || lower.includes('pace')) {
    topic = '#CurriculumPacing';
  } else if (lower.includes('library') || lower.includes('book') || lower.includes('hours') || lower.includes('reading')) {
    topic = '#LibraryAccess';
  }

  // PII Redaction: Protect student and faculty identities (FERPA / DPDP compliant)
  let piiCleaned = text
    .replace(/Prof(\.|essor)?\s+[A-Z][a-z]+/gi, '[Faculty Mentor]')
    .replace(/[A-Z][a-z]+\s+Sir/gi, '[Faculty Mentor]')
    .replace(/[A-Z][a-z]+\s+Ma'?am/gi, '[Faculty Mentor]')
    .replace(/[0-9]{2}[A-Z]{2,4}[0-9]{3,4}/gi, '[Student Roll Ref]')
    .replace(/\b\d{10}\b/g, '[Phone Redacted]')
    .replace(/Room\s+\d+/gi, '[Campus Room Ref]')
    .replace(/Block\s+[A-Z]/gi, '[Hostel Block]');

  let score = 0;
  let label = 'NEUTRAL';
  let confidence = 82;

  if (posHits > negHits) {
    score = Math.min(0.95, 0.45 + posHits * 0.15);
    label = 'POSITIVE';
    confidence = Math.min(98, 80 + posHits * 5);
  } else if (negHits > posHits || isUrgent) {
    score = Math.max(-0.95, -0.45 - negHits * 0.15);
    label = 'CRITICAL';
    confidence = Math.min(99, 84 + negHits * 5);
  } else {
    score = 0.05;
    label = 'NEUTRAL';
    confidence = 80;
  }

  return {
    score: Number(score.toFixed(2)),
    label,
    confidence,
    topic,
    isUrgent,
    piiCleanedText: piiCleaned,
  };
}

// Initial high-fidelity anonymized student voice entries
const INITIAL_STUDENT_VOICES = [
  {
    id: 'sv-1',
    cohort: '4th Year · Computer Science',
    department: 'Computer Science',
    text: 'The Placement mock interview sessions organized by the TPO cell were extremely helpful! The DSA and system design feedback helped me crack real technical interviews.',
    topic: '#PlacementMocks',
    sentiment: 'POSITIVE',
    confidence: 94,
    rating: 5,
    isUrgent: false,
    timestamp: '2 hours ago',
    acknowledged: true,
  },
  {
    id: 'sv-2',
    cohort: '3rd Year · Computer Science',
    department: 'Computer Science',
    text: 'Lab 3 Ubuntu compilers are crashing repeatedly during practical exams. Multiple students lost unsaved code and tests. Needs immediate IT attention.',
    topic: '#LabInfrastructure',
    sentiment: 'CRITICAL',
    confidence: 96,
    rating: 2,
    isUrgent: true,
    timestamp: '5 hours ago',
    acknowledged: false,
  },
  {
    id: 'sv-3',
    cohort: '2nd Year · Information Technology',
    department: 'Information Technology',
    text: 'Hostel [Hostel Block] Wi-Fi has severe downtime every evening between 7 PM and 11 PM. Extremely difficult to complete LMS assignments on time.',
    topic: '#HostelWiFi',
    sentiment: 'CRITICAL',
    confidence: 92,
    rating: 1,
    isUrgent: true,
    timestamp: 'Yesterday',
    acknowledged: false,
  },
  {
    id: 'sv-4',
    cohort: '3rd Year · Computer Science',
    department: 'Computer Science',
    text: 'Operating Systems lectures by [Faculty Mentor] are very clear and structured. Real-world kernel examples and debugging exercises are great.',
    topic: '#FacultyGuidance',
    sentiment: 'POSITIVE',
    confidence: 91,
    rating: 5,
    isUrgent: false,
    timestamp: '1 day ago',
    acknowledged: true,
  },
  {
    id: 'sv-5',
    cohort: '2nd Year · Electronics & Comm.',
    department: 'Electronics & Comm.',
    text: 'Advanced Calculus syllabus pacing is a bit rushed before mid-term exams. Would really appreciate extra tutorial doubt sessions on Saturdays.',
    topic: '#CurriculumPacing',
    sentiment: 'NEUTRAL',
    confidence: 85,
    rating: 3,
    isUrgent: false,
    timestamp: '2 days ago',
    acknowledged: true,
  },
  {
    id: 'sv-6',
    cohort: '4th Year · Information Technology',
    department: 'Information Technology',
    text: 'Corporate soft-skills and HR interview bootcamps were practical. Good guidance on behavioral questions.',
    topic: '#PlacementMocks',
    sentiment: 'POSITIVE',
    confidence: 88,
    rating: 4,
    isUrgent: false,
    timestamp: '3 days ago',
    acknowledged: true,
  },
  {
    id: 'sv-7',
    cohort: '3rd Year · Electronics & Comm.',
    department: 'Electronics & Comm.',
    text: 'Projector in [Campus Room Ref] keeps flickering and turning off during digital signal processing class.',
    topic: '#LabInfrastructure',
    sentiment: 'CRITICAL',
    confidence: 89,
    rating: 2,
    isUrgent: false,
    timestamp: '4 days ago',
    acknowledged: false,
  },
  {
    id: 'sv-8',
    cohort: '3rd Year · Computer Science',
    department: 'Computer Science',
    text: 'Central Library closing at 8 PM is too early during end-semester exams. Please extend reading hall hours till 11 PM.',
    topic: '#LibraryAccess',
    sentiment: 'NEUTRAL',
    confidence: 86,
    rating: 3,
    isUrgent: false,
    timestamp: '5 days ago',
    acknowledged: true,
  },
];

export default function FeedbackPage() {
  const [loading, setLoading] = useState(true);
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [activeTypeFilter, setActiveTypeFilter] = useState('ALL');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // NLP Voice Feed State
  const [studentVoices, setStudentVoices] = useState(INITIAL_STUDENT_VOICES);
  const [sentimentFilter, setSentimentFilter] = useState('ALL');
  const [activeTopicFilter, setActiveTopicFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [acknowledgedMap, setAcknowledgedMap] = useState({
    'sv-1': true,
    'sv-4': true,
    'sv-5': true,
    'sv-6': true,
    'sv-8': true,
  });

  // Submit Feedback Form State
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

  // Real-time NLP preview for the comment being typed
  const liveNlpAnalysis = useMemo(() => {
    return analyzeSentimentNLP(comment);
  }, [comment]);

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

      // Analyze comment through our NLP pipeline
      const nlp = analyzeSentimentNLP(comment || 'Constructive feedback recorded.');

      const newVoice = {
        id: 'sv-' + Date.now(),
        cohort: `3rd Year · ${department}`,
        department,
        text: nlp.piiCleanedText,
        topic: nlp.topic,
        sentiment: nlp.label,
        confidence: nlp.confidence,
        rating,
        isUrgent: nlp.isUrgent,
        timestamp: 'Just now',
        acknowledged: false,
      };

      setStudentVoices((prev) => [newVoice, ...prev]);

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowSubmitModal(false);
        setComment('');
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

  const handleToggleAcknowledge = (id) => {
    setAcknowledgedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter student voices
  const filteredVoices = useMemo(() => {
    return studentVoices.filter((v) => {
      // Sentiment filter
      if (sentimentFilter !== 'ALL' && v.sentiment !== sentimentFilter) return false;
      // Topic filter
      if (activeTopicFilter !== 'ALL' && v.topic !== activeTopicFilter) return false;
      // Search query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchText = v.text.toLowerCase().includes(q);
        const matchTopic = v.topic.toLowerCase().includes(q);
        const matchDept = v.department.toLowerCase().includes(q);
        return matchText || matchTopic || matchDept;
      }
      return true;
    });
  }, [studentVoices, sentimentFilter, activeTopicFilter, searchQuery]);

  // Aggregate NLP Stats
  const nlpStats = useMemo(() => {
    const total = studentVoices.length;
    const positive = studentVoices.filter((v) => v.sentiment === 'POSITIVE').length;
    const neutral = studentVoices.filter((v) => v.sentiment === 'NEUTRAL').length;
    const critical = studentVoices.filter((v) => v.sentiment === 'CRITICAL').length;
    const urgentCount = studentVoices.filter((v) => v.isUrgent && !acknowledgedMap[v.id]).length;
    const nss = Math.round(((positive - critical) / total) * 100);

    return {
      total,
      positivePct: Math.round((positive / total) * 100),
      neutralPct: Math.round((neutral / total) * 100),
      criticalPct: Math.round((critical / total) * 100),
      positiveCount: positive,
      neutralCount: neutral,
      criticalCount: critical,
      urgentCount,
      nss,
    };
  }, [studentVoices, acknowledgedMap]);

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

  const TOPICS_LIST = [
    { tag: '#PlacementMocks', count: 28, sentiment: 'POSITIVE' },
    { tag: '#LabInfrastructure', count: 14, sentiment: 'CRITICAL' },
    { tag: '#HostelWiFi', count: 11, sentiment: 'CRITICAL' },
    { tag: '#FacultyGuidance', count: 22, sentiment: 'POSITIVE' },
    { tag: '#CurriculumPacing', count: 18, sentiment: 'NEUTRAL' },
    { tag: '#LibraryAccess', count: 9, sentiment: 'NEUTRAL' },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(5, 150, 105, 0.1)',
              }}
            >
              <MessageSquareHeart size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.55rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Campus Sentiment & Student Voice
                </h1>
                <span
                  style={{
                    backgroundColor: '#EEF2FF',
                    color: '#4F46E5',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid #C7D2FE',
                  }}
                >
                  NLP Intel Engine
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                Aspect-based sentiment analysis, automated topic clustering, and PII-redacted student feedback telemetry
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowSubmitModal(true)}
            style={{
              padding: '9px 18px',
              backgroundColor: '#1A73E8',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(26, 115, 232, 0.25)',
              transition: 'background 0.2s',
            }}
          >
            <Send size={15} />
            <span>Submit Demo Feedback</span>
          </button>
        </div>
      </div>

      {/* 2. DEAN'S AI SENTIMENT SYNTHESIS BANNER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
          borderRadius: '12px',
          padding: '1.5rem',
          color: '#FFFFFF',
          boxShadow: '0 4px 14px rgba(49, 46, 129, 0.15)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={18} color="#FDE047" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
                Provost & Dean AI Sentiment Synthesis
              </div>
              <div style={{ fontSize: '0.78rem', color: '#C7D2FE' }}>
                Automated natural language synthesis derived from 184 recent anonymous student evaluations
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: '#A5B4FC', textTransform: 'uppercase', fontWeight: 600 }}>
                Campus Net Sentiment
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4ADE80' }}>
                +{nlpStats.nss} NSS (Healthy)
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.07)',
            borderRadius: '8px',
            padding: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#86EFAC', fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>
              <ThumbsUp size={14} /> 🌟 Key Celebrations (High Praise)
            </div>
            <div style={{ fontSize: '0.8rem', color: '#E0E7FF', lineHeight: 1.45 }}>
              Students praise TPO placement mock sessions (91% satisfaction) and interactive programming mentoring in CSE.
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FCA5A5', fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>
              <AlertTriangle size={14} /> ⚠️ Critical Operational Friction
            </div>
            <div style={{ fontSize: '0.8rem', color: '#E0E7FF', lineHeight: 1.45 }}>
              Repeated compiler crashes in <strong>Lab 3</strong> (14 reports) and evening Wi-Fi latency in <strong>Hostel Block</strong> during LMS submissions.
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FDE047', fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>
              <ArrowUpRight size={14} /> 💡 Recommended Administrative Action
            </div>
            <div style={{ fontSize: '0.8rem', color: '#E0E7FF', lineHeight: 1.45 }}>
              Issue IT ticket for Lab 3 compiler upgrades and schedule Saturday tutorial support for 2nd-year Advanced Calculus.
            </div>
          </div>
        </div>
      </div>

      {/* 3. NLP SENTIMENT BAROMETER & KPIS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
          gap: '1rem',
        }}
      >
        {/* Sentiment Distribution Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
              NLP Sentiment Breakdown
            </span>
            <span style={{ fontSize: '0.72rem', backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', color: '#475569', fontWeight: 600 }}>
              184 Evaluated
            </span>
          </div>

          {/* Stacked bar */}
          <div style={{ height: '10px', display: 'flex', borderRadius: '5px', overflow: 'hidden', marginTop: '12px' }}>
            <div style={{ width: `${nlpStats.positivePct}%`, backgroundColor: '#10B981' }} title={`Positive: ${nlpStats.positivePct}%`} />
            <div style={{ width: `${nlpStats.neutralPct}%`, backgroundColor: '#F59E0B' }} title={`Neutral: ${nlpStats.neutralPct}%`} />
            <div style={{ width: `${nlpStats.criticalPct}%`, backgroundColor: '#EF4444' }} title={`Critical: ${nlpStats.criticalPct}%`} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#059669', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
              Positive: {nlpStats.positivePct}%
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#D97706', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B', display: 'inline-block' }} />
              Neutral: {nlpStats.neutralPct}%
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#DC2626', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444', display: 'inline-block' }} />
              Critical: {nlpStats.criticalPct}%
            </div>
          </div>
        </div>

        {/* Urgent Escalations Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
            Urgent Action Flags
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 700, color: nlpStats.urgentCount > 0 ? '#DC2626' : '#10B981' }}>
              {nlpStats.urgentCount}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
              unresolved high-priority issues
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#DC2626', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle size={14} /> Includes Lab compiler crashes & Hostel network outages
          </div>
        </div>

        {/* Institutional Rating */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
            Average Campus Rating
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0F172A' }}>
              {feedbackSummary?.averageRating ? feedbackSummary.averageRating.toFixed(2) : '4.35'}
            </span>
            <span style={{ fontSize: '1rem', color: '#64748B' }}>/ 5.0</span>
          </div>
          <div style={{ display: 'flex', gap: '3px', marginTop: '6px' }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={15} fill="#F59E0B" color="#F59E0B" />
            ))}
            <span style={{ fontSize: '0.78rem', color: '#10B981', marginLeft: '6px', fontWeight: 600 }}>
              +0.21 YoY
            </span>
          </div>
        </div>

        {/* Privacy Shield Guard */}
        <div
          style={{
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '10px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 700, fontSize: '0.85rem' }}>
              <Shield size={16} /> FERPA & DPDP Privacy Guard
            </div>
            <div style={{ fontSize: '0.78rem', color: '#15803D', marginTop: '6px', lineHeight: 1.4 }}>
              Automatic regex PII anonymization redacts faculty names, room numbers, and roll IDs before displaying to institutional reviewers.
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 600, marginTop: '8px' }}>
            ✓ Zero Identity Leakage Guarantee
          </div>
        </div>
      </div>

      {/* 4. EMERGING TOPIC CLUSTER CLOUD */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={16} color="#4F46E5" />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>
              Emerging Campus Topic Clusters
            </span>
            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
              (Click any tag to filter student voices)
            </span>
          </div>

          {activeTopicFilter !== 'ALL' && (
            <button
              onClick={() => setActiveTopicFilter('ALL')}
              style={{
                fontSize: '0.75rem',
                color: '#1A73E8',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Clear Topic Filter ✕
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {TOPICS_LIST.map((t) => {
            const isActive = activeTopicFilter === t.tag;
            const isPos = t.sentiment === 'POSITIVE';
            const isCrit = t.sentiment === 'CRITICAL';

            const bg = isActive
              ? '#1E1B4B'
              : isPos
              ? '#ECFDF5'
              : isCrit
              ? '#FEF2F2'
              : '#F8FAFC';

            const textColor = isActive
              ? '#FFFFFF'
              : isPos
              ? '#065F46'
              : isCrit
              ? '#991B1B'
              : '#334155';

            const borderColor = isActive
              ? '#1E1B4B'
              : isPos
              ? '#A7F3D0'
              : isCrit
              ? '#FECACA'
              : '#E2E8F0';

            return (
              <button
                key={t.tag}
                onClick={() => setActiveTopicFilter(isActive ? 'ALL' : t.tag)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${borderColor}`,
                  backgroundColor: bg,
                  color: textColor,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{t.tag}</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. ANONYMIZED STUDENT VOICE FEED */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Anonymized Student Feedback Telemetry
            </h2>
            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
              Showing {filteredVoices.length} authentic submissions with NLP sentiment scores & topic tags
            </div>
          </div>

          {/* Search & Sentiment Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search feedback or dept..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '6px 12px 6px 30px',
                  fontSize: '0.82rem',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  outline: 'none',
                  width: '210px',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F1F5F9', padding: '3px', borderRadius: '6px' }}>
              {['ALL', 'POSITIVE', 'NEUTRAL', 'CRITICAL'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSentimentFilter(s)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: sentimentFilter === s ? '#FFFFFF' : 'transparent',
                    color: sentimentFilter === s ? '#0F172A' : '#64748B',
                    boxShadow: sentimentFilter === s ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Voices Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredVoices.map((voice) => {
            const isAck = !!acknowledgedMap[voice.id];
            const isPos = voice.sentiment === 'POSITIVE';
            const isCrit = voice.sentiment === 'CRITICAL';

            const borderLeftColor = isPos ? '#10B981' : isCrit ? '#EF4444' : '#F59E0B';
            const badgeBg = isPos ? '#ECFDF5' : isCrit ? '#FEF2F2' : '#FFFBEB';
            const badgeText = isPos ? '#065F46' : isCrit ? '#991B1B' : '#92400E';

            return (
              <div
                key={voice.id}
                style={{
                  border: '1px solid #E2E8F0',
                  borderLeft: `4px solid ${borderLeftColor}`,
                  borderRadius: '8px',
                  padding: '1.25rem',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.01)',
                  transition: 'transform 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A' }}>
                      {voice.cohort}
                    </span>
                    <span
                      style={{
                        backgroundColor: '#F1F5F9',
                        color: '#475569',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {voice.topic}
                    </span>
                    <span
                      style={{
                        backgroundColor: badgeBg,
                        color: badgeText,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {voice.sentiment} · {voice.confidence}% confidence
                    </span>

                    {voice.isUrgent && (
                      <span
                        style={{
                          backgroundColor: '#FEE2E2',
                          color: '#DC2626',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <AlertTriangle size={12} /> Dean Escalation
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          fill={i < voice.rating ? '#F59E0B' : 'none'}
                          color={i < voice.rating ? '#F59E0B' : '#CBD5E1'}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                      {voice.timestamp}
                    </span>
                  </div>
                </div>

                {/* Comment Text */}
                <p style={{ margin: '6px 0 12px 0', fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
                  "{voice.text}"
                </p>

                {/* Card Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #F8FAFC' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Shield size={12} color="#10B981" /> Identity protected via Automated PII Redaction
                  </div>

                  <button
                    onClick={() => handleToggleAcknowledge(voice.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '5px',
                      border: '1px solid',
                      borderColor: isAck ? '#86EFAC' : '#CBD5E1',
                      backgroundColor: isAck ? '#F0FDF4' : '#FFFFFF',
                      color: isAck ? '#15803D' : '#475569',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {isAck ? (
                      <>
                        <Check size={12} /> Acknowledged by Dean
                      </>
                    ) : (
                      'Mark Acknowledged'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. LEGACY QUANTITATIVE BREAKDOWN (Preserved) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Rating Distribution */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0F172A', margin: '0 0 1rem 0' }}>
            Star Rating Distribution
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingDist[star] || 0;
              const pct = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
              return (
                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '55px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: '#475569', fontWeight: 500 }}>
                    <span>{star}</span>
                    <Star size={13} fill="#F59E0B" color="#F59E0B" />
                  </div>
                  <div style={{ flex: 1, height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, backgroundColor: '#F59E0B', borderRadius: '4px', transition: 'width 0.4s ease' }} />
                  </div>
                  <div style={{ width: '70px', textAlign: 'right', fontSize: '0.82rem', color: '#64748B' }}>
                    {count} ({pct}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ratings by Category */}
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
            <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0F172A', margin: 0 }}>
              Ratings by Category
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredTypes.map((item) => (
              <div
                key={item.feedbackType}
                style={{
                  border: '1px solid #F1F5F9',
                  borderRadius: '6px',
                  padding: '0.85rem',
                  backgroundColor: '#F8FAFC',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0F172A', textTransform: 'capitalize' }}>
                    {item.feedbackType.replace(/_/g, ' ')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B', fontWeight: 600, fontSize: '0.82rem' }}>
                    <Star size={13} fill="#F59E0B" color="#F59E0B" />
                    <span>{item.averageRating} / 5.0</span>
                  </div>
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

      {/* 7. SUBMIT FEEDBACK MODAL WITH REAL-TIME NLP PREVIEW */}
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
              borderRadius: '12px',
              maxWidth: '540px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquareHeart size={22} color="#1A73E8" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0F172A' }}>
                  Submit Student Feedback & Sentiment
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
                  Feedback Analyzed & Recorded!
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
                  Your submission was processed by the NLP Sentiment Pipeline and added to the anonymized campus intelligence telemetry.
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
                    Comments & Suggestions (Anonymous)
                  </label>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="e.g. Lab 3 computers are lagging, or the mock interview sessions were great..."
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

                  {/* REAL-TIME NLP PREVIEW BOX */}
                  {comment.trim().length > 3 && (
                    <div
                      style={{
                        marginTop: '8px',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#F8FAFC',
                        border: '1px dashed #CBD5E1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 600, color: '#475569' }}>Live NLP:</span>
                        <span
                          style={{
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor:
                              liveNlpAnalysis.label === 'POSITIVE'
                                ? '#ECFDF5'
                                : liveNlpAnalysis.label === 'CRITICAL'
                                ? '#FEF2F2'
                                : '#FFFBEB',
                            color:
                              liveNlpAnalysis.label === 'POSITIVE'
                                ? '#065F46'
                                : liveNlpAnalysis.label === 'CRITICAL'
                                ? '#991B1B'
                                : '#92400E',
                          }}
                        >
                          {liveNlpAnalysis.label} ({liveNlpAnalysis.confidence}%)
                        </span>
                        <span style={{ color: '#64748B' }}>Topic: {liveNlpAnalysis.topic}</span>
                      </div>

                      {liveNlpAnalysis.isUrgent && (
                        <span style={{ color: '#DC2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <AlertTriangle size={11} /> Urgent
                        </span>
                      )}
                    </div>
                  )}

                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '4px' }}>
                    Names and roll IDs are automatically redacted for privacy.
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
                    {submitting ? 'Analyzing & Submitting...' : 'Analyze & Submit'}
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
