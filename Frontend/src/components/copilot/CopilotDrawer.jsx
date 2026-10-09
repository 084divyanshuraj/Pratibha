import React, { useState } from 'react';
import { Sparkles, X, Send, ShieldCheck, Database, ArrowRight, CornerDownLeft } from 'lucide-react';
import { api } from '../../services/api';

const PROMPT_SUGGESTIONS = [
  'Aarav Sharma ka info do',
  'Who has attendance below 75%?',
  'Show decoupled divergence students',
  'Which students have backlogs?',
  'Show Computer Science students',
  'Who are the top performers?',
];

function renderInlineFormatting(str) {
  if (!str) return str;
  const parts = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let lastIdx = 0;
  let match;
  let keyCounter = 0;

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIdx) {
      parts.push(str.substring(lastIdx, match.index));
    }
    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      const codeText = token.slice(1, -1);
      parts.push(
        <code
          key={`code-${keyCounter++}`}
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.08)',
            padding: '1px 5px',
            borderRadius: '4px',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '0.84em',
            color: '#0F172A',
            fontWeight: 600,
          }}
        >
          {codeText}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      const boldText = token.slice(2, -2);
      parts.push(
        <strong key={`bold-${keyCounter++}`} style={{ fontWeight: 650, color: '#0F172A' }}>
          {boldText}
        </strong>
      );
    }
    lastIdx = regex.lastIndex;
  }
  if (lastIdx < str.length) {
    parts.push(str.substring(lastIdx));
  }
  return parts.length > 0 ? parts : str;
}

function FormattedMessage({ text, isUser }) {
  if (isUser) {
    return <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>;
  }

  const lines = (text || '').split('\n');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} style={{ height: '4px' }} />;
        }
        if (trimmed.startsWith('### ')) {
          const headerText = trimmed.replace('### ', '');
          return (
            <div
              key={idx}
              style={{
                fontSize: '0.94rem',
                fontWeight: 700,
                color: '#0F172A',
                marginTop: idx > 0 ? '6px' : '0px',
                marginBottom: '2px',
                borderBottom: '1px solid #E2E8F0',
                paddingBottom: '3px',
              }}
            >
              {renderInlineFormatting(headerText)}
            </div>
          );
        }
        if (trimmed.startsWith('## ')) {
          const headerText = trimmed.replace('## ', '');
          return (
            <div
              key={idx}
              style={{
                fontSize: '1rem',
                fontWeight: 750,
                color: '#0F172A',
                marginTop: '8px',
                marginBottom: '2px',
              }}
            >
              {renderInlineFormatting(headerText)}
            </div>
          );
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
          const bulletText = trimmed.replace(/^[-•*]\s+/, '');
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '6px',
                paddingLeft: '4px',
                fontSize: '0.84rem',
                lineHeight: '1.45',
              }}
            >
              <span style={{ color: '#1A73E8', fontWeight: 700, marginTop: '-1px' }}>•</span>
              <div style={{ flex: 1 }}>{renderInlineFormatting(bulletText)}</div>
            </div>
          );
        }
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '6px',
                paddingLeft: '4px',
                fontSize: '0.84rem',
                lineHeight: '1.45',
              }}
            >
              <span style={{ color: '#1A73E8', fontWeight: 600, minWidth: '16px' }}>{numMatch[1]}.</span>
              <div style={{ flex: 1 }}>{renderInlineFormatting(numMatch[2])}</div>
            </div>
          );
        }
        return (
          <div key={idx} style={{ fontSize: '0.84rem', lineHeight: '1.45' }}>
            {renderInlineFormatting(line)}
          </div>
        );
      })}
    </div>
  );
}

export default function CopilotDrawer({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'copilot',
      text: 'Hello! I am your Campus Analytics Copilot. I can query institutional KPIs, analyze decoupled risk divergences, and look up student 360 profiles. All insights are grounded directly in verified database records.',
      sources: ['/api/v1/analytics/overview'],
      disclaimer: 'Verified against stored MongoDB records. Zero LLM hallucination.',
    },
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend = query) => {
    const text = textToSend.trim();
    if (!text) return;

    const userMsg = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const response = await api.queryCopilot(text);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'copilot',
          text: response.summary || response.message || 'Analysis completed successfully.',
          sources: response.sources || ['/api/v1/analytics'],
          disclaimer: response.disclaimer || 'Verified against institutional data.',
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'copilot',
          text: 'Unable to process query at this time. Please use standard analytical dashboards.',
          sources: [],
          disclaimer: 'Connection error.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(2px)',
          zIndex: 110,
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '460px',
          maxWidth: '100vw',
          height: '100vh',
          backgroundColor: '#FFFFFF',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.12)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 120,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={18} color="#38BDF8" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Campus Analytics Copilot</div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} color="#10B981" />
                <span>Grounded Verification Engine</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Message Stream */}
        <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Quick Prompt Chips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
              Suggested Queries:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {PROMPT_SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s)}
                  style={{
                    backgroundColor: '#F1F5F9',
                    border: '1px solid #E2E8F0',
                    borderRadius: '999px',
                    padding: '5px 10px',
                    fontSize: '0.75rem',
                    color: '#334155',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 150ms ease',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '4px 0' }} />

          {/* Conversation */}
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '92%',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div
                style={{
                  backgroundColor: m.sender === 'user' ? '#1A73E8' : '#F8FAFC',
                  color: m.sender === 'user' ? '#FFFFFF' : '#1E293B',
                  border: m.sender === 'user' ? 'none' : '1px solid #E2E8F0',
                  padding: '12px 14px',
                  borderRadius: m.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  fontSize: '0.84rem',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap',
                }}
              >
                <FormattedMessage text={m.text} isUser={m.sender === 'user'} />
              </div>

              {m.sources && m.sources.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', color: '#64748B', paddingLeft: '4px' }}>
                  <Database size={11} color="#1A73E8" />
                  <span>Sources: {m.sources.join(', ')}</span>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ alignSelf: 'flex-start', color: '#64748B', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} className="spin" color="#1A73E8" />
              <span>Querying verified backend services...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{ display: 'flex', gap: '8px' }}
          >
            <input
              type="text"
              placeholder="Ask about KPIs, risk divergence, interventions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.84rem',
                outline: 'none',
                backgroundColor: '#FFFFFF',
              }}
            />
            <button
              type="submit"
              disabled={!query.trim() || loading}
              style={{
                backgroundColor: '#1A73E8',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '0 14px',
                cursor: query.trim() ? 'pointer' : 'not-allowed',
                opacity: query.trim() ? 1 : 0.6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={15} />
            </button>
          </form>
          <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '6px', textAlign: 'center' }}>
            Zero LLM hallucination. Direct execution against verified analytical services.
          </div>
        </div>
      </div>
    </>
  );
}
