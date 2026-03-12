'use client';

import { useState, useRef } from 'react';
import { pinyin } from 'pinyin-pro';

interface InteractiveTextProps {
  text: string;
  languageId: string;
  statuses?: Record<number, 'correct' | 'incorrect' | 'current' | 'neutral'>;
  interactive?: boolean;
}

export default function InteractiveText({ text, languageId, statuses = {}, interactive = true }: InteractiveTextProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [definition, setDefinition] = useState<string | null>(null);
  const [pinyinValue, setPinyinValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWordClick = async (e: React.MouseEvent<HTMLSpanElement>, word: string) => {
    if (!interactive) return;
    
    // Clean word of punctuation for lookup and speech
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
    if (!cleanWord) return;

    setSelectedWord(cleanWord);
    setLoading(true);
    setDefinition(null);
    setPinyinValue(null);

    if (languageId === 'zh') {
      setPinyinValue(pinyin(cleanWord, { toneType: 'symbol' }));
    }
    
    // Position the tooltip
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect() || { top: 0, left: 0 };
    setPosition({
      top: rect.top - containerRect.top - 10,
      left: rect.left - containerRect.left + (rect.width / 2)
    });

    // Pronounce the word
    speakWord(cleanWord);

    // Fetch definition
    try {
      if (languageId === 'en') {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord.toLowerCase()}`);
        if (res.ok) {
          const data = await res.json();
          const def = data[0]?.meanings[0]?.definitions[0]?.definition;
          setDefinition(def || "Definition not found.");
        } else {
          // Fallback to translation if dictionary fails
          await fetchFallbackTranslation(cleanWord);
        }
      } else {
        await fetchFallbackTranslation(cleanWord);
      }
    } catch (err) {
      setDefinition("Error fetching meaning.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFallbackTranslation = async (word: string) => {
    try {
      // Using MyMemory API for translation to Indonesian/English
      // We'll translate to English since the UI is in English
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=${languageId}|en`);
      const data = await res.json();
      if (data.responseData.translatedText) {
        setDefinition(data.responseData.translatedText);
      } else {
        setDefinition("Meaning not found.");
      }
    } catch (e) {
      setDefinition("Error fetching meaning.");
    }
  };

  const speakWord = (word: string) => {
    if (!interactive || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    
    // Map languageId to BCP 47 tags
    const langMap: Record<string, string> = {
      en: 'en-US',
      zh: 'zh-CN',
      es: 'es-ES',
      it: 'it-IT',
      de: 'de-DE'
    };
    utterance.lang = langMap[languageId] || 'en-US';
    utterance.rate = 0.9; // Slightly slower for clarity
    window.speechSynthesis.speak(utterance);
  };

  // Tokenize text based on language
  const getTokens = () => {
    if (languageId === 'zh') {
      // Use Intl.Segmenter for smart word grouping in Mandarin
      if (typeof Intl !== 'undefined' && (Intl as any).Segmenter) {
        const segmenter = new (Intl as any).Segmenter('zh-CN', { granularity: 'word' });
        const segments = segmenter.segment(text);
        return Array.from(segments).map((s: any) => s.segment);
      }
      // Fallback for older browsers
      return text.split(/([\u4E00-\u9FFF]|[，。？！、：；“”‘’（）]|\s+)/).filter(Boolean);
    }
    // For other languages, split by words/spaces
    return text.split(/(\s+)/);
  };
  const tokens = getTokens();

  return (
    <div ref={containerRef} style={{ position: 'relative', textAlign: 'center' }}>
      <div style={{ lineHeight: '1.8' }}>
        {tokens.map((token, i) => {
          if (token.trim() === '') return <span key={i}>{token}</span>;
          
          const status = statuses[i];
          const color = status === 'correct' ? 'var(--success)' : 
                        status === 'incorrect' ? 'var(--error)' : 
                        status === 'current' ? 'var(--primary)' : 'inherit';
          
          return (
            <span
              key={i}
              onClick={interactive ? (e) => handleWordClick(e, token) : undefined}
              style={{
                transition: 'all 0.2s',
                display: 'inline-block',
                color: color,
                fontWeight: status && status !== 'neutral' ? 600 : 'inherit',
                cursor: interactive ? 'pointer' : 'default'
              }}
              className={interactive ? "interactive-word" : ""}
            >
              {token}
            </span>
          );
        })}
      </div>

      {selectedWord && (
        <>
          <div 
            className="premium-tooltip"
            style={{
              top: position.top,
              left: position.left,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <strong style={{ fontSize: '1.2rem', color: 'var(--primary)', fontFamily: 'Lexend, sans-serif' }}>{selectedWord}</strong>
              <button 
                onClick={() => setSelectedWord(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.5rem', lineHeight: 1 }}
              >
                ×
              </button>
            </div>
            
            <div style={{ fontSize: '1rem', color: 'var(--foreground)', lineHeight: '1.5', fontFamily: 'Lexend, sans-serif', fontWeight: 300 }}>
              {pinyinValue && (
                <div style={{ color: 'var(--primary)', fontWeight: 500, marginBottom: '0.4rem', borderBottom: '1px solid #eee', paddingBottom: '0.4rem' }}>
                  {pinyinValue}
                </div>
              )}
              {loading ? 'Searching meaning...' : definition}
            </div>


          </div>
          
          <div 
            onClick={() => setSelectedWord(null)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 900 }}
          />
        </>
      )}
    </div>
  );
}
