'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import InteractiveText from '@/components/InteractiveText';

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
  const [translation, setTranslation] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);

  const recognitionRef = useRef<any>(null);

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
      setTranslation(null);
      setShowTranslation(false);

      if (onboardingData.selectedLang !== 'en') {
        try {
          const transRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(data.prompt)}&langpair=${onboardingData.selectedLang}|en`);
          const transData = await transRes.json();
          if (transData.responseData.translatedText) {
            setTranslation(transData.responseData.translatedText);
          }
        } catch (e) {
          console.error('Translation error', e);
        }
      }
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
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    // Reset state for a new session (Redo functionality)
    setFeedback(null);
    setTranscript('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = onboardingData.selectedLang === 'zh' ? 'zh-CN' :
      onboardingData.selectedLang === 'es' ? 'es-ES' :
        onboardingData.selectedLang === 'it' ? 'it-IT' :
          onboardingData.selectedLang === 'de' ? 'de-DE' : 'en-US';

    recognition.interimResults = true;
    recognition.continuous = true;
    const localTranscriptRef = { current: '' };

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      let transcriptValue = '';
      for (let i = 0; i < event.results.length; ++i) {
        transcriptValue += event.results[i][0].transcript.toLowerCase() + ' ';
      }
      const finalTranscript = transcriptValue.trim();
      setTranscript(finalTranscript);
      localTranscriptRef.current = finalTranscript;
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      
      let targetTokens: string[] = [];
      if (onboardingData.selectedLang === 'zh' && typeof Intl !== 'undefined' && (Intl as any).Segmenter) {
        const segmenter = new (Intl as any).Segmenter('zh-CN', { granularity: 'word' });
        const segments = segmenter.segment(currentPrompt);
        targetTokens = Array.from(segments).map((s: any) => s.segment);
      } else {
        targetTokens = onboardingData.selectedLang === 'zh' ? 
          currentPrompt.split(/([\u4E00-\u9FFF]|[，。？！、：；“”‘’（）]|\s+)/).filter(Boolean) :
          currentPrompt.split(/(\s+)/);
      }
      
      const tokensToWords = (tokens: string[]) => {
        const wordIndices: number[] = [];
        tokens.forEach((token, idx) => {
          if (token.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim()) {
            wordIndices.push(idx);
          }
        });
        return wordIndices;
      };

      const wordTokensCount = tokensToWords(targetTokens).length;
      if (wordTokensCount === 0) return;

      let matchedCount = 0;
      targetTokens.forEach((token) => {
        const cleanToken = token.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim().toLowerCase();
        if (cleanToken && localTranscriptRef.current.includes(cleanToken)) {
            matchedCount++;
        }
      });

      const score = Math.round((matchedCount / wordTokensCount) * 100);
      setScores(prev => [...prev, score]);
      setFeedback({
        score,
        color: score > 80 ? 'var(--success)' : score > 50 ? 'var(--secondary)' : 'var(--error)'
      });
    };

    recognition.start();
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
            <div style={{ 
              fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', 
              marginBottom: '2.5rem', 
              lineHeight: '1.6', 
              color: 'var(--foreground)', 
              fontWeight: 450,
              minHeight: '10rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '0 1rem'
            }}>
              <InteractiveText 
                text={currentPrompt} 
                languageId={onboardingData?.selectedLang || 'en'} 
                interactive={false}
              />
            </div>

            {currentPrompt && (
              <div style={{
                minHeight: '80px',
                padding: '1.5rem',
                background: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                marginBottom: '2rem',
                color: transcript ? 'var(--foreground)' : 'var(--text-muted)',
                fontSize: '1.1rem',
                lineHeight: '1.6',
                fontStyle: transcript ? 'normal' : 'italic',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
              }}>
                {transcript || "Your spoken text will appear here..."}
              </div>
            )}

            {onboardingData?.selectedLang !== 'en' && currentPrompt && (
              <div style={{ marginBottom: '2.5rem' }}>
                <button 
                  onClick={() => setShowTranslation(!showTranslation)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--primary)', 
                    cursor: 'pointer', 
                    fontSize: '1.1rem', 
                    fontWeight: 500,
                    fontFamily: "'Welcome Darling', cursive",
                    textDecoration: 'underline',
                    opacity: 0.8
                  }}
                >
                  {showTranslation ? 'Hide Translation' : 'Show English Translation'}
                </button>
                {showTranslation && (
                  <div className="animate-fade-in" style={{ 
                    marginTop: '1rem', 
                    padding: '1rem', 
                    background: '#f8fafc', 
                    borderRadius: '12px', 
                    fontSize: '1rem', 
                    color: 'var(--foreground)',
                    opacity: 0.9,
                    lineHeight: '1.5',
                    border: '1px solid #e2e8f0'
                  }}>
                    {translation || 'Translating...'}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
              <button
                className={`btn-primary ${isListening ? 'listening' : ''}`}
                onClick={startListening}
                disabled={!!feedback && !isListening}
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
                  opacity: !!feedback && !isListening ? 0.3 : 1
                }}
              >
                {isListening ? '🛑' : '🎤'}
              </button>


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
        </div>
      </section>
    </div>
  );
}
