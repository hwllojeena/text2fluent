'use client';

import { useState, useEffect } from 'react';
import { getUserStats, UserStats } from '@/utils/userTracker';
import { useSession } from '@/components/Providers';
import TestModal from './TestModal';

export default function TestTab() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activeTest, setActiveTest] = useState<{ languageId: string, level: string } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (session && session.user && (session.user as any).id) {
        const userId = (session.user as any).id;
        const statsData = await getUserStats(userId);
        setStats(statsData);
      }
    };
    fetchStats();
  }, [session]);

  const getLanguageName = (id: string) => {
    const map: Record<string, string> = { 
      en: '🇺🇸 English', zh: '🇨🇳 Mandarin', es: '🇪🇸 Spanish', it: '🇮🇹 Italian', de: '🇩🇪 German' 
    };
    return map[id] || id;
  };

  const getTestProgress = () => {
    if (!stats?.history) return [];
    
    const progress: Record<string, { count: number, language: string, level: string }> = {};
    
    stats.history.forEach(record => {
      const key = `${record.language}`;
      if (!progress[key]) {
        progress[key] = { count: 0, language: record.language, level: 'Beginner' };
      }
      progress[key].count += 1;
      
      if (progress[key].count >= 15) progress[key].level = 'Advanced';
      else if (progress[key].count >= 10) progress[key].level = 'Intermediate';
    });
    
    return Object.values(progress);
  };

  const testProgress = getTestProgress();

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '800px', margin: '2rem auto 0' }}>
      <div style={{ background: 'rgba(255, 255, 255, 0.5)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--card-border)' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.5rem' }}>Language Proficiency Tests</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.5 }}>
          Complete at least 5 practice exercises in a language to unlock its Beginner test. Keep practicing to unlock higher level tests!
        </p>
      </div>

      <div className="scrollbar-hide" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', overflowY: 'auto', height: '100%', paddingBottom: '2rem' }}>
        {(['en', 'zh', 'es', 'it', 'de'] as const).map(langId => {
          const progressData = testProgress.find(p => p.language === langId);
          const count = progressData?.count || 0;
          const level = progressData?.level || 'Beginner';
          const isUnlocked = count >= 5;
          const progressPercentage = Math.min(100, (count / 5) * 100);

          return (
            <div key={langId} style={{ 
              padding: '1.5rem', 
              background: isUnlocked ? 'linear-gradient(to right, rgba(255,255,255,0.9), rgba(241,245,249,0.9))' : 'rgba(248,250,252,0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px', 
              border: '1px solid var(--card-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              opacity: isUnlocked ? 1 : 0.7,
              boxShadow: isUnlocked ? '0 4px 6px rgba(0,0,0,0.02)' : 'none'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'Lexend, sans-serif' }}>
                  {getLanguageName(langId)} Test
                </span>
                {isUnlocked && (
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white', background: 'var(--primary)', padding: '0.3rem 0.8rem', borderRadius: '20px' }}>
                    {level} Level Available
                  </span>
                )}
              </div>
              
              {!isUnlocked ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    <span>Practice Progress</span>
                    <span>{count} / 5</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(226,232,240,0.8)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${progressPercentage}%`, height: '100%', background: 'var(--primary)' }} />
                  </div>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.8rem', fontStyle: 'italic' }}>
                    Complete {5 - count} more practices to unlock this test.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <p style={{ fontSize: '1.05rem', color: 'var(--foreground)' }}>
                    Ready to test your conversational skills?
                  </p>
                  <button 
                    className="btn-primary"
                    onClick={() => setActiveTest({ languageId: langId, level })}
                    style={{ padding: '0.6rem 1.5rem', fontSize: '1rem' }}
                  >
                    Start Test
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {activeTest && (
        <TestModal 
          languageId={activeTest.languageId} 
          level={activeTest.level} 
          onClose={() => setActiveTest(null)} 
        />
      )}
    </div>
  );
}
