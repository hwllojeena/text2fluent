'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface TestModalProps {
  languageId: string;
  level: string;
  onClose: () => void;
}

export default function TestModal({ languageId, level, onClose }: TestModalProps) {
  const { data: session } = useSession();
  const [question, setQuestion] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/test/generate?lang=${languageId}&level=${level}`);
        const data = await res.json();
        setQuestion(data.question);
      } catch (e) {
        console.error("Failed to load question", e);
        setQuestion("Error loading test question. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [languageId, level]);

  const startListening = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Your browser does not support Speech Recognition. Please try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = languageId === 'zh' ? 'zh-CN' : 
                      languageId === 'es' ? 'es-ES' : 
                      languageId === 'it' ? 'it-IT' : 
                      languageId === 'de' ? 'de-DE' : 'en-US';
    
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      let transcriptValue = '';
      for (let i = 0; i < event.results.length; ++i) {
        transcriptValue += event.results[i][0].transcript + ' ';
      }
      setTranscript(transcriptValue.trim());
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.start();
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1100
    }} onClick={onClose}>
      
      <div 
        className="premium-card animate-fade-in" 
        style={{ 
          width: '90%', maxWidth: '600px', maxHeight: '85vh', 
          overflowY: 'auto', padding: '2.5rem', display: 'flex', flexDirection: 'column' 
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)' }}>Level Test</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading your test...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>Question</p>
              <p style={{ fontSize: '1.3rem', color: 'var(--foreground)', lineHeight: 1.6, fontWeight: 500 }}>
                {question.split('(')[0]}
              </p>
              
              {question.includes('(') && (
                <div style={{ marginTop: '1rem' }}>
                  <button 
                    onClick={() => setShowHint(!showHint)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 500 }}
                  >
                    {showHint ? 'Hide Hint' : 'Show English Translation Hint'}
                  </button>
                  {showHint && (
                    <p style={{ marginTop: '0.5rem', fontSize: '1rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      ({question.split('(')[1]}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Your Answer</p>
              
              {!submitted ? (
                <>
                  <button 
                    className={`btn-primary ${isListening ? 'listening' : ''}`}
                    onClick={startListening}
                    style={{ 
                      width: '80px', height: '80px', borderRadius: '50%', padding: 0, 
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      fontSize: '1.8rem',
                      background: isListening ? 'var(--error)' : 'var(--primary)',
                      boxShadow: isListening ? '0 0 0 0 rgba(239, 68, 68, 0.4)' : '0 10px 20px rgba(30, 58, 138, 0.2)',
                      animation: isListening ? 'pulse 1.5s infinite' : 'none'
                    }}
                  >
                    {isListening ? '🛑' : '🎤'}
                  </button>
                  
                  <div style={{
                    width: '100%', minHeight: '100px', padding: '1rem',
                    background: 'white', borderRadius: '12px', border: '1px solid var(--card-border)',
                    color: transcript ? 'var(--foreground)' : 'var(--text-muted)',
                    fontStyle: transcript ? 'normal' : 'italic'
                  }}>
                    {transcript || "Speak to answer the question..."}
                  </div>

                  {transcript && !isListening && (
                    <button 
                      className="btn-primary" 
                      onClick={handleSubmit}
                      style={{ width: '100%', marginTop: '1rem', background: 'var(--success)' }}
                    >
                      Submit Answer
                    </button>
                  )}
                </>
              ) : (
                <div className="animate-fade-in" style={{ textAlign: 'center', padding: '2rem', background: '#ecfdf5', borderRadius: '16px', border: '1px solid #a7f3d0', width: '100%' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                  <h3 style={{ color: '#065f46', marginBottom: '0.5rem', fontSize: '1.4rem' }}>Test Completed!</h3>
                  <p style={{ color: '#064e3b', opacity: 0.8 }}>Great job! You have spoken fluently and completed this level's test. Keep practicing to reach the next milestone.</p>
                  <button onClick={onClose} className="btn-primary" style={{ marginTop: '1.5rem', background: '#059669', padding: '0.6rem 2rem' }}>
                    Continue
                  </button>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
