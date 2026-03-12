'use client';

import { useState, useEffect, useCallback } from 'react';

interface ExerciseProps {
  languageId: string;
  level: string;
  topic: string;
  onBack: () => void;
}

// Declaring Web Speech API types for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function ExerciseView({ languageId, level, topic, onBack }: ExerciseProps) {
  const [prompt, setPrompt] = useState<string>('');
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState<{ score: number; color: string } | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayText, setDisplayText] = useState<string>('');

  const fetchPrompt = useCallback(async () => {
    setFeedback(null);
    setTranscript('');
    setIsSpinning(true);

    const placeholders = [
      "Generating a topic...",
      "Searching for phrases...",
      "Picking something fun...",
      "Loading exercise...",
      "Almost ready...",
    ];

    let shuffleInterval = setInterval(() => {
      setDisplayText(placeholders[Math.floor(Math.random() * placeholders.length)]);
    }, 100);

    try {
      const res = await fetch(`/api/generate?lang=${languageId}&level=${level}&topic=${topic}`);
      const data = await res.json();
      
      // Keep spinning for at least 800ms for visual effect
      setTimeout(() => {
        clearInterval(shuffleInterval);
        setPrompt(data.prompt);
        setDisplayText(data.prompt);
        setIsSpinning(false);
      }, 800);
    } catch (err) {
      console.error('Failed to fetch prompt', err);
      if (shuffleInterval) clearInterval(shuffleInterval);
      setIsSpinning(false);
    }
  }, [languageId, level, topic]);

  useEffect(() => {
    fetchPrompt();
  }, [fetchPrompt]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Your browser does not support Speech Recognition. Please try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = languageId === 'zh' ? 'zh-CN' : 
                      languageId === 'es' ? 'es-ES' : 
                      languageId === 'it' ? 'it-IT' : 
                      languageId === 'de' ? 'de-DE' : 'en-US';
    
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcriptValue = event.results[current][0].transcript;
      setTranscript(transcriptValue.toLowerCase());

      if (event.results[current].isFinal) {
        checkResult(transcriptValue.toLowerCase(), prompt.toLowerCase());
      }
    };

    recognition.start();
  };

  const checkResult = (said: string, target: string) => {
    // Basic similarity check (can be improved)
    // Removing punctuation for comparison
    const cleanSaid = said.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
    const cleanTarget = target.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
    
    // Simple word match ratio
    const saidWords = cleanSaid.split(/\s+/);
    const targetWords = cleanTarget.split(/\s+/);
    let matches = 0;
    
    targetWords.forEach(word => {
        if (saidWords.includes(word)) matches++;
    });

    const score = (matches / targetWords.length) * 100;
    setFeedback({
      score: Math.round(score),
      color: score > 80 ? 'var(--success)' : score > 50 ? 'var(--secondary)' : 'var(--error)'
    });
  };

  return (
    <div className="premium-card animate-fade-in" style={{ textAlign: 'center' }}>
      <button onClick={onBack} style={{ float: 'left', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}>
        ← Menu
      </button>
      
      <div style={{ padding: '1rem 0' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
          Speak this aloud:
        </p>
        <div style={{ 
          fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', 
          marginBottom: '2.5rem', 
          lineHeight: '1.6', 
          color: isSpinning ? 'var(--primary)' : 'var(--foreground)', 
          fontWeight: 450,
          opacity: isSpinning ? 0.6 : 1,
          transition: 'all 0.3s ease',
          minHeight: '10rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 1rem'
        }}>
          {displayText}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
          {!feedback && !isSpinning && (
            <button 
              className="btn-primary" 
              onClick={fetchPrompt}
              style={{ background: 'var(--secondary)', color: 'var(--primary)', padding: '0.8rem 2rem', fontSize: '1rem', fontWeight: 600 }}
            >
              🔄 Spin New Topic
            </button>
          )}

          <button 
            className={`btn-primary ${isListening ? 'listening' : ''}`}
            onClick={startListening}
            disabled={isListening || isSpinning}
            style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              padding: 0, 
              justifyContent: 'center',
              fontSize: '1.8rem',
              background: isListening ? 'var(--error)' : isSpinning ? 'var(--text-muted)' : 'var(--primary)',
              boxShadow: isListening ? '0 0 0 0 rgba(239, 68, 68, 0.4)' : '0 10px 20px rgba(30, 58, 138, 0.2)',
              animation: isListening ? 'pulse 1.5s infinite' : 'none',
              opacity: isSpinning ? 0.5 : 1,
              cursor: isSpinning ? 'not-allowed' : 'pointer'
            }}
          >
            {isListening ? '...' : '🎤'}
          </button>

          <div style={{ minHeight: '3rem', fontStyle: 'italic', color: 'var(--primary)', fontSize: '1.2rem', fontWeight: 500 }}>
            {transcript ? `"${transcript}"` : <span style={{ color: '#94a3b8' }}>{isSpinning ? 'Spinning...' : 'Your speech will appear here...'}</span>}
          </div>

          {feedback && (
            <div className="animate-fade-in" style={{ padding: '2rem', borderRadius: '24px', background: 'var(--secondary)', width: '100%', border: '1px solid #d1d9cc' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: feedback.color === 'var(--success)' ? '#065f46' : feedback.color === 'var(--error)' ? '#991b1b' : '#3730a3', marginBottom: '0.5rem' }}>
                 Accuracy: {feedback.score}%
              </div>
              <p style={{ color: 'var(--foreground)', opacity: 0.8, fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                {feedback.score > 80 ? 'Excellent pronunciation!' : feedback.score > 50 ? "Good try, keep it up!" : 'Try once more, you can do it.'}
              </p>
              <button 
                className="btn-primary" 
                style={{ background: 'var(--primary)', color: 'white' }}
                onClick={fetchPrompt}
              >
                🔄 Spin for New Topic!
              </button>
            </div>
          )}
        </div>
      </div>


      <style jsx>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 25px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  );
}
