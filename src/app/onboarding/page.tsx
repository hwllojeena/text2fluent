'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from '@/components/Providers';
import UnauthenticatedView from '@/components/UnauthenticatedView';

const LANGUAGES = [
  { id: 'en', name: 'English', flag: '🇺🇸' },
  { id: 'zh', name: 'Mandarin', flag: '🇨🇳' },
  { id: 'it', name: 'Italian', flag: '🇮🇹' },
  { id: 'es', name: 'Spanish', flag: '🇪🇸' },
  { id: 'de', name: 'German', flag: '🇩🇪' },
];

const LEVELS = [
  { id: '1', title: "I don't know anything yet", desc: "I’m just starting and want to learn the basics." },
  { id: '2', title: "I know a few words", desc: "I can understand simple words and phrases." },
  { id: '3', title: "I can hold a basic conversation", desc: "I can talk about simple everyday topics." },
  { id: '4', title: "I can communicate fairly well", desc: "I can discuss different topics but still make mistakes." },
  { id: '5', title: "I’m almost fluent", desc: "I can speak comfortably in most situations." },
  { id: '6', title: "Not sure? Test me.", desc: "" }
];

const GOALS = [
  "Daily conversation",
  "Travel",
  "Work / business",
  "Academic purposes",
  "Just for fun"
];

export default function Onboarding() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [selectedLang, setSelectedLang] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  // Removed unauthenticated redirect

  useEffect(() => {
    if (session?.user?.name && !userName) {
      setUserName(session.user.name);
    }
  }, [session, userName]);

  const finishOnboarding = () => {
    if (selectedLang && selectedLevel && selectedGoal) {
      const onboardingData = {
        userName,
        selectedLang,
        selectedLevel,
        selectedGoal,
        completed: selectedLevel !== '6'
      };
      localStorage.setItem('text2fluent_onboarding', JSON.stringify(onboardingData));
      
      if (selectedLevel === '6') {
        router.push('/onboarding/pretest');
      } else {
        router.push('/');
      }
    }
  };

  if (status === 'unauthenticated') return <UnauthenticatedView />;
  if (status === 'loading') return null;

  return (
    <div className="main-layout">
      {/* Permanent Left Panel */}
      <aside className="left-panel animate-fade-in">
        {/* Logo + Brand Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Text2Fluent Logo" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
          <span style={{ fontFamily: "'Welcome Darling', cursive", fontSize: '1.5rem', fontWeight: 500, color: 'var(--foreground)', letterSpacing: '0.02em' }}>
            Text2Fluent
          </span>
        </div>
        <h1 style={{ fontSize: '5rem', lineHeight: '1', marginBottom: '1rem' }}>
          Speak your way to fluency
        </h1>
        <p className="platform-description">
          Text2Fluent is an AI-powered platform that helps you build confidence in any language. 
          Read texts aloud, get instant feedback, and improve your fluency step by step.
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

      {/* Dynamic Right Panel */}
      <section className="right-panel">
        <div className="animate-fade-in" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          
          {step === 0 && (
            <div className="premium-card">
              <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>What should we call you?</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Let's personalize your experience.</p>
              <div style={{ marginBottom: '2rem' }}>
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  className="premium-input"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
              <button 
                className="btn-primary" 
                onClick={() => setStep(1)}
                disabled={!userName.trim()}
                style={{ width: '100%', opacity: !userName.trim() ? 0.5 : 1 }}
              >
                Next
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="premium-card">
              <button onClick={() => setStep(0)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: 600 }}>
                ← Back
              </button>
              <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Which language would you like to learn?</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Choose your target language from the list below.</p>
              
              <div style={{ marginBottom: '2.5rem' }}>
                <select 
                  className="premium-input"
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="" disabled>Select a language</option>
                  {LANGUAGES.map(lang => (
                    <option key={lang.id} value={lang.id}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="btn-primary"
                style={{ width: '100%' }}
                onClick={() => setStep(2)}
                disabled={!selectedLang}
              >
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="premium-card">
              <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: 600 }}>
                ← Back
              </button>
              <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>What is your current level?</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {LEVELS.map((level) => (
                  <div
                    key={level.id}
                    className={`premium-card ${selectedLevel === level.id ? 'active' : ''}`}
                    onClick={() => setSelectedLevel(level.id)}
                    style={{
                      cursor: 'pointer',
                      padding: '1.2rem 1.5rem',
                      borderRadius: '20px',
                      border: selectedLevel === level.id ? '2px solid var(--primary)' : '1px solid var(--card-border)',
                      background: selectedLevel === level.id ? 'var(--secondary)' : 'white'
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <span style={{ color: 'var(--primary)', opacity: 0.6 }}>{level.id}️⃣</span>
                      {level.title}
                    </h3>
                    {level.desc && <p style={{ margin: '0.3rem 0 0 2.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{level.desc}</p>}
                  </div>
                ))}
              </div>
              <button
                className="btn-primary"
                style={{ marginTop: '2rem', width: '100%' }}
                onClick={() => setStep(3)}
                disabled={!selectedLevel}
              >
                Next
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="premium-card">
              <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: 600 }}>
                ← Back
              </button>
              <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Why are you learning this language?</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {GOALS.map((goal) => (
                  <div
                    key={goal}
                    className={`premium-card ${selectedGoal === goal ? 'active' : ''}`}
                    onClick={() => setSelectedGoal(goal)}
                    style={{
                      cursor: 'pointer',
                      padding: '1.2rem 1.5rem',
                      borderRadius: '20px',
                      border: selectedGoal === goal ? '2px solid var(--primary)' : '1px solid var(--card-border)',
                      background: selectedGoal === goal ? 'var(--secondary)' : 'white'
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{goal}</h3>
                  </div>
                ))}
              </div>
              <button
                className="btn-primary"
                style={{ marginTop: '2rem', width: '100%' }}
                onClick={finishOnboarding}
                disabled={!selectedGoal}
              >
                {selectedLevel === '6' ? 'Do the test' : 'Spin & Start'}
              </button>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
