import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  ShieldCheck,
  Database,
  ArrowRight,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Radio,
} from 'lucide-react';
import { api } from '../../services/api';

const PROMPT_SUGGESTIONS = [
  "What is Aarav Sharma's score?",
  'Who has attendance below 75%?',
  'Show decoupled divergence students',
  'Which students have backlogs?',
  'Show Computer Science students',
  'Who are the top performers?',
  'Campus overview and KPIs',
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
                marginTop: idx > 0 ? '8px' : '0px',
                marginBottom: '3px',
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
                fontSize: '0.84rem',
                lineHeight: '1.45',
              }}
            >
              <span style={{ color: '#1A73E8', fontSize: '0.9rem', lineHeight: '1.2' }}>•</span>
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
      id: 'init-1',
      sender: 'copilot',
      text: "Hello! I am your **Campus Analytics Copilot** (Voice AI Enabled 🎙️). You can type or click the microphone to ask queries in natural English.\n\nTry asking: *\"What is Aarav Sharma's score?\"* or *\"Show decoupled divergence students\"*.",
      sources: ['/api/v1/analytics/overview'],
      disclaimer: 'Verified against stored MongoDB records. Zero LLM hallucination.',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeSpeakingIdx, setActiveSpeakingIdx] = useState(null);
  const [autoSpeak, setAutoSpeak] = useState(true);

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setActiveSpeakingIdx(null);
  };

  // Stop speaking and listening when closed
  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    }
  }, [isOpen]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isListening, isOpen]);

  const speakMessage = (text, idx) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (activeSpeakingIdx === idx) {
      stopSpeaking();
      return;
    }

    stopSpeaking();

    // Clean text for natural spoken audio cadence
    const clean = (text || '')
      .replace(/###\s+/g, '')
      .replace(/##\s+/g, '')
      .replace(/#\s+/g, '')
      .replace(/\*\*/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/^\s*[-*•]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      .replace(/[🎓🌟⚠️📉📚🏛️🚨📊]/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices();
    // Prioritize natural English voices
    const preferredVoice =
      voices.find((v) => (v.lang === 'en-US' || v.lang === 'en-GB' || v.lang === 'en-IN') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Samantha') || v.name.includes('Jenny') || v.name.includes('Guy') || v.name.includes('English'))) ||
      voices.find((v) => v.lang === 'en-US' || v.lang === 'en-GB') ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0];

    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setActiveSpeakingIdx(idx);
    utterance.onend = () => setActiveSpeakingIdx(null);
    utterance.onerror = () => setActiveSpeakingIdx(null);

    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceRecognition = () => {
    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    stopSpeaking();

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setQuery(transcript);
      };

      recognition.onerror = (err) => {
        console.warn('Speech recognition warning:', err.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSend = async (textToSend = query, shouldSpeakResponse = autoSpeak) => {
    const text = textToSend.trim();
    if (!text) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    stopSpeaking();

    const userMsg = { id: `user-${Date.now()}`, sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const response = await api.queryCopilot(text);
      const copilotText = response.summary || response.message || 'Analysis completed successfully.';
      const newCopilotMsg = {
        id: `copilot-${Date.now()}`,
        sender: 'copilot',
        text: copilotText,
        sources: response.sources || ['/api/v1/analytics'],
        disclaimer: response.disclaimer || 'Verified against institutional data.',
      };

      setMessages((prev) => {
        const nextList = [...prev, newCopilotMsg];
        const newIdx = nextList.length - 1;
        if (shouldSpeakResponse) {
          setTimeout(() => speakMessage(copilotText, newIdx), 250);
        }
        return nextList;
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `copilot-${Date.now()}`,
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

  const handleResetChat = () => {
    stopSpeaking();
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'copilot',
        text: 'Conversation reset. How can I assist your campus analytics today? (Type or speak your query 🎙️)',
        sources: ['/api/v1/analytics/overview'],
        disclaimer: 'Verified against stored MongoDB records.',
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(3px)',
          zIndex: 110,
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '490px',
          maxWidth: '100vw',
          height: '100vh',
          backgroundColor: '#FFFFFF',
          boxShadow: '-10px 0 35px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 120,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #1E293B',
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
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={20} color="#38BDF8" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.94rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Campus Analytics Copilot</span>
                <span
                  style={{
                    backgroundColor: 'rgba(56, 189, 248, 0.16)',
                    color: '#38BDF8',
                    padding: '1px 6px',
                    borderRadius: '999px',
                    fontSize: '0.66rem',
                    fontWeight: 700,
                  }}
                >
                  Voice AI 🎙️
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} color="#10B981" />
                <span>Grounded Decision Intelligence</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Auto Readout Toggle */}
            <button
              onClick={() => setAutoSpeak(!autoSpeak)}
              title={autoSpeak ? 'Auto Voice Readout: Enabled' : 'Auto Voice Readout: Disabled'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: autoSpeak ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.15)',
                color: autoSpeak ? '#34D399' : '#94A3B8',
                border: '1px solid',
                borderColor: autoSpeak ? 'rgba(16, 185, 129, 0.4)' : 'rgba(148, 163, 184, 0.3)',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.68rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {autoSpeak ? <Volume2 size={12} /> : <VolumeX size={12} />}
              <span>{autoSpeak ? 'Readout On' : 'Readout Off'}</span>
            </button>

            {/* Reset Chat */}
            <button
              onClick={handleResetChat}
              title="Reset Conversation"
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '5px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <RotateCcw size={16} />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              title="Close Copilot"
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '5px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Quick Voice / Text Chips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Radio size={12} color="#1A73E8" />
              <span>Suggested Voice or Text Queries:</span>
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {PROMPT_SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s, false)}
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '999px',
                    padding: '5px 11px',
                    fontSize: '0.74rem',
                    color: '#334155',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 150ms ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ color: '#1A73E8', fontSize: '0.7rem' }}>🎙️</span>
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '4px 0' }} />

          {/* Conversation Messages */}
          {messages.map((m, idx) => {
            const isSpeakingThis = activeSpeakingIdx === idx;
            return (
              <div
                key={m.id || idx}
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
                    boxShadow: m.sender === 'user' ? '0 1px 3px rgba(26,115,232,0.2)' : '0 1px 2px rgba(0,0,0,0.03)',
                  }}
                >
                  <FormattedMessage text={m.text} isUser={m.sender === 'user'} />
                </div>

                {/* Footer Controls for Bot Message */}
                {m.sender === 'copilot' && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', fontSize: '0.68rem', color: '#64748B' }}>
                    {m.sources && m.sources.length > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Database size={11} color="#1A73E8" />
                        <span>{m.sources.join(', ')}</span>
                      </div>
                    ) : <div />}

                    {/* Listen / Stop Audio Button */}
                    <button
                      onClick={() => speakMessage(m.text, idx)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: isSpeakingThis ? '#ECFDF5' : 'none',
                        border: isSpeakingThis ? '1px solid #A7F3D0' : 'none',
                        color: isSpeakingThis ? '#059669' : '#64748B',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.7rem',
                        fontWeight: isSpeakingThis ? 700 : 500,
                      }}
                    >
                      {isSpeakingThis ? (
                        <>
                          <span className="voice-wave-bar" style={{ animationDelay: '0ms', color: '#059669' }} />
                          <span className="voice-wave-bar" style={{ animationDelay: '150ms', color: '#059669' }} />
                          <span className="voice-wave-bar" style={{ animationDelay: '300ms', color: '#059669' }} />
                          <VolumeX size={12} color="#059669" />
                          <span>Stop Voice</span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={12} color="#64748B" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div style={{ alignSelf: 'flex-start', color: '#64748B', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <Sparkles size={14} className="spin" color="#1A73E8" />
              <span>Querying verified campus analytics engine...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
          {/* Active Listening Sound Banner */}
          {isListening && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                padding: '7px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626', fontSize: '0.78rem', fontWeight: 600 }}>
                <span className="voice-wave-bar" style={{ animationDelay: '0ms' }} />
                <span className="voice-wave-bar" style={{ animationDelay: '150ms' }} />
                <span className="voice-wave-bar" style={{ animationDelay: '300ms' }} />
                <span className="voice-wave-bar" style={{ animationDelay: '450ms' }} />
                <span>Listening... Start speaking your query...</span>
              </div>
              <button
                type="button"
                onClick={toggleVoiceRecognition}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#DC2626',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Stop
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(query, autoSpeak);
            }}
            style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            {/* Microphone Button */}
            <button
              type="button"
              onClick={toggleVoiceRecognition}
              title={isListening ? 'Stop listening' : 'Start voice query (Mic)'}
              className={isListening ? 'voice-listening-pulse' : ''}
              style={{
                backgroundColor: isListening ? '#EF4444' : '#FFFFFF',
                color: isListening ? '#FFFFFF' : '#1A73E8',
                border: isListening ? 'none' : '1px solid #CBD5E1',
                borderRadius: '8px',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                flexShrink: 0,
              }}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <input
              type="text"
              placeholder={isListening ? 'Listening... Speak now...' : 'Type or speak: "What is Aarav Sharma\'s score?" or "Who has backlogs?"...'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '8px',
                border: isListening ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
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
                width: '38px',
                height: '38px',
                cursor: query.trim() ? 'pointer' : 'not-allowed',
                opacity: query.trim() ? 1 : 0.6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Send size={15} />
            </button>
          </form>

          <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '6px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span>Zero LLM hallucination</span>
            <span>•</span>
            <span>Real-time Speech Recognition & Spoken Audio</span>
            <span>•</span>
            <span>Verified Mongo Analytics</span>
          </div>
        </div>
      </div>
    </>
  );
}
