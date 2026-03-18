'use client';

import { useState } from 'react';
import ExerciseView from './ExerciseView';

const LANGUAGES = [
  { id: 'en', name: 'English', flag: '🇺🇸' },
  { id: 'zh', name: 'Mandarin', flag: '🇨🇳' },
  { id: 'it', name: 'Italian', flag: '🇮🇹' },
  { id: 'es', name: 'Spanish', flag: '🇪🇸' },
  { id: 'de', name: 'German', flag: '🇩🇪' },
];

const DIFFICULTIES = [
  { id: '1', name: 'Starter' },
  { id: '2', name: 'Beginner' },
  { id: '3', name: 'Intermediate' },
  { id: '4', name: 'Advanced' },
  { id: '5', name: 'Fluent' },
];

const TOPICS = [
  "Daily conversation",
  "Travel",
  "Work / business",
  "Academic purposes",
  "Just for fun"
];

interface PracticeViewProps {
  initialLang: string;
  initialLevelId: string;
  initialTopic: string;
}

export default function PracticeView({ initialLang, initialLevelId, initialTopic }: PracticeViewProps) {
  const [selectedLang, setSelectedLang] = useState(initialLang);
  const [selectedLevelId, setSelectedLevelId] = useState(initialLevelId);
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);

  const getMappedLevel = (id: string) => {
    const level = DIFFICULTIES.find(d => d.id === id);
    return level ? level.name : 'Beginner';
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginTop: '2rem' }}>
      <div className="animate-fade-in" style={{
        display: 'flex',
        gap: '1rem',
        width: '100%',
        maxWidth: '700px',
        background: 'rgba(255, 255, 255, 0.5)',
        padding: '1rem',
        borderRadius: '20px',
        border: '1px solid var(--card-border)'
      }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Language</label>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="premium-input"
            style={{ padding: '0.6rem 1rem', fontSize: '1rem' }}
          >
            {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.flag} {l.name}</option>)}
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Difficulty</label>
          <select
            value={selectedLevelId}
            onChange={(e) => setSelectedLevelId(e.target.value)}
            className="premium-input"
            style={{ padding: '0.6rem 1rem', fontSize: '1rem' }}
          >
            {DIFFICULTIES.map(d => <option key={d.id} value={d.id}>{d.id}. {d.name}</option>)}
          </select>
        </div>

        <div style={{ flex: 1.2 }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Topic</label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="premium-input"
            style={{ padding: '0.6rem 1rem', fontSize: '1rem' }}
          >
            {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <ExerciseView
        languageId={selectedLang}
        level={getMappedLevel(selectedLevelId)}
        topic={selectedTopic}
      />
    </div>
  );
}
