'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

const TEST_PHASES = [
  { level: 'Beginner', difficulty: 'Beginner' },
  { level: 'Intermediate', difficulty: 'Intermediate' },
  { level: 'Advanced', difficulty: 'Advanced' }
];

export default function Pretest() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [phase, setPhase] = useState(0); // 0, 1, 2
  const [scores, setScores] = useState<number[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ score: number; color: string } | null>(null);

  useEffect(() => {
    const data = localStorage.getItem('text2fluent_onboarding');
    if (!data) {
      router.push('/onboarding');
      return;
    }
    setOnboardingData(JSON.parse(data));
    setLoading(false);
  }, [router]);

  const fetchTestPrompt = useCallback(async (difficulty: string) => {
    if (!onboardingData) return;
    setFeedback(null);
    setTranscript('');
    try {
      const res = await fetch(`/api/generate?lang=${onboardingData.selectedLang}&level=${difficulty}`);
      const data = await res.json();
      setCurrentPrompt(data.prompt);
    } catch (err) {
      console.error('Failed to fetch test prompt', err);
    }
  }, [onboardingData]);

  useEffect(() => {
    if (onboardingData) {
      fetchTestPrompt(TEST_PHASES[phase].difficulty);
    }
  }, [onboardingData, phase, fetchTestPrompt]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = onboardingData.selectedLang === 'zh' ? 'zh-CN' :
      onboardingData.selectedLang === 'es' ? 'es-ES' :
        onboardingData.selectedLang === 'it' ? 'it-IT' :
          onboardingData.selectedLang === 'de' ? 'de-DE' : 'en-US';

    recognition.interimResults = true;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcriptValue = event.results[current][0].transcript;
      setTranscript(transcriptValue.toLowerCase());

      if (event.results[current].isFinal) {
        calculateScore(transcriptValue.toLowerCase());
      }
    };

    recognition.start();
  };

  const calculateScore = (said: string) => {
    const target = currentPrompt.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
    const cleanSaid = said.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();

    const saidWords = cleanSaid.split(/\s+/);
    const targetWords = target.split(/\s+/);
    let matches = 0;
    targetWords.forEach(w => { if (saidWords.includes(w)) matches++; });

    const score = Math.round((matches / targetWords.length) * 100);
    setScores(prev => [...prev, score]);
    setFeedback({
      score,
      color: score > 80 ? 'var(--success)' : score > 50 ? 'var(--secondary)' : 'var(--error)'
    });
  };

  const skipPhase = () => {
    setScores(prev => [...prev, 0]);
    nextPhase();
  };

  const nextPhase = () => {
    if (phase < 2) {
      setPhase(phase + 1);
    } else {
      finalizeLevel();
    }
  };

  const finalizeLevel = () => {
    let assignedLevel = 'Beginner';
    const [s1, s2, s3] = scores;

    // Logic:
    // Beginner > 80, Intermediate > 70, Advanced > 60 -> Advanced
    // Beginner > 70, Intermediate > 50 -> Intermediate
    // Else -> Beginner
    if (s1 >= 80 && s2 >= 70 && s3 >= 60) assignedLevel = 'Advanced';
    else if (s1 >= 70 && s2 >= 50) assignedLevel = 'Intermediate';
    else assignedLevel = 'Beginner';

    const updatedData = {
      ...onboardingData,
      selectedLevel: assignedLevel === 'Beginner' ? '1' : assignedLevel === 'Intermediate' ? '3' : '5',
      completed: true
    };
    localStorage.setItem('text2fluent_onboarding', JSON.stringify(updatedData));
    router.push('/');
  };

  if (loading || status === 'loading') return null;

  return (
    <div className="main-layout">
      <aside className="left-panel animate-fade-in">
        <h1 style={{ fontSize: '5rem', lineHeight: '1', marginBottom: '1rem' }}>
          Let’s find your level
        </h1>
        <p className="platform-description">
          Read a few short sentences and we’ll estimate your current speaking level.
        </p>



        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{
            marginTop: '4rem',
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '1.2rem',
            textAlign: 'left',
            padding: 0
          }}
        >
          ← Sign Out
        </button>
      </aside>

      <section className="right-panel">
        <div className="premium-card animate-fade-in" style={{ textAlign: 'center' }}>
          <div style={{ padding: '1rem 0' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
              Speak this aloud:
            </p>
            <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', marginBottom: '2rem', lineHeight: '1.3', color: 'var(--foreground)', fontWeight: 500 }}>
              {currentPrompt}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
              <button
                className={`btn-primary ${isListening ? 'listening' : ''}`}
                onClick={startListening}
                disabled={isListening || !!feedback}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  padding: 0,
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  background: isListening ? 'var(--error)' : 'var(--primary)',
                  boxShadow: isListening ? '0 0 0 0 rgba(239, 68, 68, 0.4)' : '0 10px 20px rgba(30, 58, 138, 0.2)',
                  animation: isListening ? 'pulse 1.5s infinite' : 'none',
                  opacity: !!feedback ? 0.3 : 1
                }}
              >
                {isListening ? '...' : '🎤'}
              </button>

              <div style={{ minHeight: '3rem', fontStyle: 'italic', color: 'var(--primary)', fontSize: '1.2rem', fontWeight: 500 }}>
                {transcript ? `"${transcript}"` : <span style={{ color: '#94a3b8' }}>Your speech will appear here...</span>}
              </div>

              {!feedback && !isListening && (
                <button 
                  onClick={skipPhase}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--text-muted)', 
                    cursor: 'pointer', 
                    textDecoration: 'underline',
                    fontSize: '1.1rem',
                    opacity: 0.7,
                    fontFamily: 'inherit'
                  }}
                >
                  I don't know how to read this
                </button>
              )}

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
                    onClick={nextPhase}
                  >
                    {phase < 2 ? 'Next Test' : 'Finish & See Result'}
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
      </section>
    </div>
  );
}
