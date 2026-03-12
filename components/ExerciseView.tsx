'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import InteractiveText from './InteractiveText';

interface ExerciseProps {
  languageId: string;
  level: string;
  topic: string;
}

// Declaring Web Speech API types for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function ExerciseView({ languageId, level, topic }: ExerciseProps) {
  const [prompt, setPrompt] = useState<string>('');
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState<{ score: number; color: string } | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayText, setDisplayText] = useState<string>('');
  const [wordStatuses, setWordStatuses] = useState<Record<number, 'correct' | 'incorrect' | 'current' | 'neutral'>>({});
  const [matchedIndices, setMatchedIndices] = useState<Set<number>>(new Set());
  const [lastMatchedIdx, setLastMatchedIdx] = useState<number>(-1);
  const [translation, setTranslation] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);

  const recognitionRef = useRef<any>(null);
  
  // Refs for real-time matching to avoid stale closures
  const statusesRef = useRef<Record<number, 'correct' | 'incorrect' | 'current' | 'neutral'>>({});
  const matchedRef = useRef<Set<number>>(new Set());
  const lastMatchedRef = useRef<number>(-1);

  const fetchPrompt = useCallback(async () => {
    setFeedback(null);
    setTranscript('');
    setWordStatuses({});
    statusesRef.current = {};
    setMatchedIndices(new Set());
    matchedRef.current = new Set();
    setLastMatchedIdx(-1);
    lastMatchedRef.current = -1;
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
      setTimeout(async () => {
        clearInterval(shuffleInterval);
        setPrompt(data.prompt);
        setDisplayText(data.prompt);
        setIsSpinning(false);
        setTranslation(null);
        setShowTranslation(false);

        // Fetch translation for non-English prompts
        if (languageId !== 'en') {
          try {
            const transRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(data.prompt)}&langpair=${languageId}|en`);
            const transData = await transRes.json();
            if (transData.responseData.translatedText) {
              setTranslation(transData.responseData.translatedText);
            }
          } catch (e) {
            console.error('Translation error', e);
          }
        }
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
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    // Reset state for a new session (Redo functionality)
    setFeedback(null);
    setTranscript('');
    setWordStatuses({});
    statusesRef.current = {};
    setMatchedIndices(new Set());
    matchedRef.current = new Set();
    setLastMatchedIdx(-1);
    lastMatchedRef.current = -1;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
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
    const localTranscriptRef = { current: '' };

    recognition.onresult = (event: any) => {
      let transcriptValue = '';
      for (let i = 0; i < event.results.length; ++i) {
        transcriptValue += event.results[i][0].transcript.toLowerCase() + ' ';
      }
      const finalTranscript = transcriptValue.trim();
      setTranscript(finalTranscript);
      localTranscriptRef.current = finalTranscript;

      // Real-time matching logic
      let targetTokens: string[] = [];
      if (languageId === 'zh' && typeof Intl !== 'undefined' && (Intl as any).Segmenter) {
        const segmenter = new (Intl as any).Segmenter('zh-CN', { granularity: 'word' });
        const segments = segmenter.segment(prompt);
        targetTokens = Array.from(segments).map((s: any) => s.segment);
      } else {
        targetTokens = languageId === 'zh' ? 
          prompt.split(/([\u4E00-\u9FFF]|[，。？！、：；“”‘’（）]|\s+)/).filter(Boolean) :
          prompt.split(/(\s+)/);
      }

      // Use refs to avoid stale closures
      const newStatuses = { ...statusesRef.current };
      const newMatched = new Set(matchedRef.current);
      let currentIdx = lastMatchedRef.current;
      
      // Look ahead up to 15 tokens to allow for skips
      const lookAheadRange = 15;

      targetTokens.forEach((token, idx) => {
        const cleanToken = token.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim().toLowerCase();
        if (!cleanToken) return;

        // Skip words already matched
        if (newMatched.has(idx)) return;

        // Lenient matching: Search for the word in the transcript
        // We allow matching words that are ahead of our current position
        if (idx > lastMatchedRef.current && idx <= lastMatchedRef.current + lookAheadRange) {
          if (finalTranscript.includes(cleanToken)) {
            newStatuses[idx] = 'correct';
            newMatched.add(idx);
            
            // SKIP LOGIC: If we matched a word further ahead, mark all intermediate words as incorrect
            for (let i = lastMatchedRef.current + 1; i < idx; i++) {
              const prevClean = targetTokens[i].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim().toLowerCase();
              if (prevClean && !newMatched.has(i)) {
                newStatuses[i] = 'incorrect';
              }
            }
            
            currentIdx = Math.max(currentIdx, idx);
          }
        }
      });

      // Update refs
      statusesRef.current = newStatuses;
      matchedRef.current = newMatched;
      lastMatchedRef.current = currentIdx;

      // Sync to state for UI re-render
      setWordStatuses(newStatuses);
      setMatchedIndices(newMatched);
      setLastMatchedIdx(currentIdx);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      
      // Final calculation: Mark unmatched words as incorrect
      let targetTokens: string[] = [];
      if (languageId === 'zh' && typeof Intl !== 'undefined' && (Intl as any).Segmenter) {
        const segmenter = new (Intl as any).Segmenter('zh-CN', { granularity: 'word' });
        const segments = segmenter.segment(prompt);
        targetTokens = Array.from(segments).map((s: any) => s.segment);
      } else {
        targetTokens = languageId === 'zh' ? 
          prompt.split(/([\u4E00-\u9FFF]|[，。？！、：；“”‘’（）]|\s+)/).filter(Boolean) :
          prompt.split(/(\s+)/);
      }
      
      const finalStatuses = { ...statusesRef.current };
      tokensToWords(targetTokens).forEach((wordIdx) => {
        if (!matchedRef.current.has(wordIdx)) {
          finalStatuses[wordIdx] = 'incorrect';
        }
      });

      statusesRef.current = finalStatuses;
      setWordStatuses(finalStatuses);
      
      checkResult(localTranscriptRef.current, prompt.toLowerCase(), targetTokens, matchedRef.current);
    };

    recognition.start();
  };

  // Helper to get indices of actual words (not just punctuation/spaces)
  const tokensToWords = (tokens: string[]) => {
    const wordIndices: number[] = [];
    tokens.forEach((token, idx) => {
      if (token.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim()) {
        wordIndices.push(idx);
      }
    });
    return wordIndices;
  };

  const checkResult = (said: string, target: string, tokens: string[], matched: Set<number>) => {
    const wordTokensCount = tokensToWords(tokens).length;
    if (wordTokensCount === 0) return;

    const score = (matched.size / wordTokensCount) * 100;
    setFeedback({
      score: Math.min(100, Math.round(score)),
      color: score > 80 ? 'var(--success)' : score > 50 ? 'var(--secondary)' : 'var(--error)'
    });
  };

  return (
    <div className="premium-card animate-fade-in" style={{ textAlign: 'center' }}>
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
          {isSpinning ? (
            displayText
          ) : (
            <InteractiveText text={prompt} languageId={languageId} statuses={wordStatuses} />
          )}
        </div>

        {languageId !== 'en' && !isSpinning && prompt && (
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
            disabled={isSpinning}
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
            {isListening ? '🛑' : '🎤'}
          </button>


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
    </div>
  );
}
