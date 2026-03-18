'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/components/Providers';
import UserProfileModal from '@/components/UserProfileModal';
import { getUserStats } from '@/utils/userTracker';
import UnauthenticatedView from '@/components/UnauthenticatedView';
import dynamic from 'next/dynamic';
import { PracticeSkeleton, HistorySkeleton, VocabSkeleton, TestSkeleton } from '@/components/TabSkeleton';

const PracticeView = dynamic(() => import('@/components/PracticeView'), {
  loading: () => <PracticeSkeleton />
});
const HistoryTab = dynamic(() => import('@/components/HistoryTab'), {
  loading: () => <HistorySkeleton />
});
const VocabTab = dynamic(() => import('@/components/VocabTab'), {
  loading: () => <VocabSkeleton />
});
const TestTab = dynamic(() => import('@/components/TestTab'), {
  loading: () => <TestSkeleton />
});

type TabType = 'practice' | 'history' | 'vocab' | 'test';

export default function Practice() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('practice');

  // Initial states for PracticeView
  const [initialLang, setInitialLang] = useState('en');
  const [initialLevelId, setInitialLevelId] = useState('1');
  const [initialTopic, setInitialTopic] = useState('Daily conversation');

  // Fetch streak interval to keep it updated when modal closes
  useEffect(() => {
    if (session?.user?.email && !showProfileModal) {
      getUserStats(session.user.email).then(stats => setCurrentStreak(stats.streak));
    }
  }, [session, showProfileModal]);

  useEffect(() => {
    if (status === 'authenticated') {
      const data = localStorage.getItem('text2fluent_onboarding');
      if (data) {
        const parsedData = JSON.parse(data);
        if (parsedData.completed) {
          // Initialize filters from onboarding data
          setInitialLang(parsedData.selectedLang || 'en');
          const initLevel = parsedData.selectedLevel === '6' ? '1' : parsedData.selectedLevel || '1';
          setInitialLevelId(initLevel);
          setInitialTopic(parsedData.selectedGoal || 'Daily conversation');

          setLoading(false);
        } else {
          router.push(parsedData.selectedLevel === '6' ? '/onboarding/pretest' : '/onboarding');
        }
      } else {
        router.push('/onboarding');
      }
    }
  }, [status, router]);

  if (status === 'unauthenticated') {
    return <UnauthenticatedView />;
  }

  if (status === 'loading' || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '2rem' }}>Loading Practice...</h2>
      </div>
    );
  }

  return (
    <div className="main-layout">
      {/* Top Right Icons (Streak & Profile) - Absolute position so it scrolls with the page */}
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '1rem', zIndex: 1100 }}>
        <button
          onClick={() => setShowProfileModal(true)}
          style={{
            background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)',
            border: '1px solid var(--card-border)', borderRadius: '20px',
            padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
            cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s', fontSize: '1.1rem', fontWeight: 600, color: 'var(--foreground)'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          🔥 {currentStreak}
        </button>

        <button
          onClick={() => setShowProfileModal(true)}
          style={{
            background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)',
            border: '1px solid var(--card-border)', borderRadius: '50%',
            width: '45px', height: '45px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s', fontSize: '1.2rem', color: 'var(--foreground)'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          👤
        </button>
      </div>

      {showProfileModal && <UserProfileModal onClose={() => setShowProfileModal(false)} />}

      <aside className="left-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        
        {/* Logo + Brand Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Text2Fluent Logo" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
          <span style={{ fontFamily: "'Welcome Darling', cursive", fontSize: '1.5rem', fontWeight: 500, color: 'var(--foreground)', letterSpacing: '0.02em' }}>
            Text2Fluent
          </span>
        </div>

        {/* Navigation Tabs directly above the heading */}
        <div className="nav-tabs-container scrollbar-hide">
          {(['practice', 'history', 'vocab', 'test'] as const).map(tab => (
            <button
              key={tab}
              className="nav-tab-btn"
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? 'white' : 'rgba(255, 255, 255, 0.5)',
                border: '1px solid var(--card-border)',
                padding: '0.6rem 1.2rem',
                borderRadius: '12px',
                fontSize: '1.05rem',
                fontWeight: 600,
                color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'capitalize',
                boxShadow: activeTab === tab ? '0 4px 6px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <h1 className="hero-title" style={{ fontSize: '5.5rem', lineHeight: '1', marginBottom: '1.5rem', letterSpacing: '-0.02em', fontWeight: 800 }}>
          Speak your<br />way to<br />fluency
        </h1>
        <div className="platform-description" style={{ fontSize: '1.2rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          <p>1) Select your language & level</p>
          <p>2) Spin to generate a text</p>
          <p>3) Read aloud to build fluency</p>
        </div>
      </aside>

      <section className="right-panel" style={{ position: 'relative' }}>
        {/* Dynamic Content Area based on Tab */}
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '2rem' }}>
          {activeTab === 'practice' && (
            <PracticeView 
              initialLang={initialLang} 
              initialLevelId={initialLevelId} 
              initialTopic={initialTopic} 
            />
          )}

          {activeTab === 'history' && (
            <HistoryTab />
          )}

          {activeTab === 'vocab' && (
            <VocabTab />
          )}

          {activeTab === 'test' && (
            <TestTab />
          )}
        </div>
      </section>
    </div>
  );
}
