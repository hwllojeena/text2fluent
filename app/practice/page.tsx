'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ExerciseView from '@/components/ExerciseView';

const LANGUAGES = [
  { id: 'en', name: 'English', flag: '🇺🇸' },
  { id: 'zh', name: 'Mandarin', flag: '🇨🇳' },
  { id: 'it', name: 'Italian', flag: '🇮🇹' },
  { id: 'es', name: 'Spanish', flag: '🇪🇸' },
  { id: 'de', name: 'German', flag: '🇩🇪' },
];

const DIFFICULTIES = [
  { id: '1', name: 'Alphabets' },
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

export default function Practice() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // States for filters
  const [selectedLang, setSelectedLang] = useState('en');
  const [selectedLevelId, setSelectedLevelId] = useState('1');
  const [selectedTopic, setSelectedTopic] = useState('Daily conversation');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      const data = localStorage.getItem('text2fluent_onboarding');
      if (data) {
        const parsedData = JSON.parse(data);
        if (parsedData.completed) {
          setOnboardingData(parsedData);
          
          // Initialize filters from onboarding data
          setSelectedLang(parsedData.selectedLang || 'en');
          
          // Map stored 1-6 levels to our 1-5 UI levels
          const initialLevelId = parsedData.selectedLevel === '6' ? '1' : parsedData.selectedLevel || '1';
          setSelectedLevelId(initialLevelId);
          setSelectedTopic(parsedData.selectedGoal || 'Daily conversation');
          
          setLoading(false);
        } else {
          router.push(parsedData.selectedLevel === '6' ? '/onboarding/pretest' : '/onboarding');
        }
      } else {
        router.push('/onboarding');
      }
    }
  }, [status, router]);

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react');
    localStorage.removeItem('text2fluent_onboarding');
    await signOut({ callbackUrl: '/' });
  };

  if (status === 'loading' || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '2rem' }}>Loading Practice...</h2>
      </div>
    );
  }

  // Map 1-5 to Beginner/Intermediate/Advanced for the component
  const getMappedLevel = (id: string) => {
    if (id === '1' || id === '2') return 'Beginner';
    if (id === '3') return 'Intermediate';
    return 'Advanced';
  };

  return (
    <div className="main-layout">
      <aside className="left-panel animate-fade-in">
        <h1 style={{ fontSize: '5rem', lineHeight: '1', marginBottom: '1rem' }}>
          Speak your way to fluency
        </h1>
        <div className="platform-description">
          <p>1) Spin to generate a speaking topic</p>
          <p>2) Read the text aloud</p>
          <p>3) Build your fluency</p>
        </div>

        <button 
          onClick={handleSignOut}
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
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          
          {/* Filters Row */}
          <div className="animate-fade-in" style={{ 
            display: 'flex', 
            gap: '1rem', 
            width: '100%', 
            maxWidth: '500px',
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
            onBack={() => {
                localStorage.removeItem('text2fluent_onboarding');
                router.push('/onboarding');
            }} 
          />
        </div>
      </section>
    </div>
  );
}
