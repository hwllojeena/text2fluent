'use client';

import { useState, useEffect } from 'react';
import { getUserStats, getSavedVocab, UserStats, SavedVocab } from '@/utils/userTracker';
import { useSession } from 'next-auth/react';
import TestModal from './TestModal';

interface UserProfileModalProps {
  onClose: () => void;
}

export default function UserProfileModal({ onClose }: UserProfileModalProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'account' | 'history' | 'vocab' | 'test'>('account');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [savedVocab, setSavedVocab] = useState<SavedVocab[]>([]);
  
  // Test Modal State
  const [activeTest, setActiveTest] = useState<{ languageId: string, level: string } | null>(null);
  
  // Account Form States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  // History Filters
  const [filterLang, setFilterLang] = useState('all');

  useEffect(() => {
    if (session?.user?.email) {
      setStats(getUserStats(session.user.email));
      setSavedVocab(getSavedVocab(session.user.email));
    }
  }, [session, activeTab]);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      setMessage("Please fill all fields.");
      return;
    }
    // Mock successful password change
    localStorage.setItem(`text2fluent_pwd_${session?.user?.email}`, newPassword);
    setMessage("Password updated successfully!");
    setTimeout(() => setMessage(''), 3000);
    setOldPassword('');
    setNewPassword('');
  };

  const getLanguageName = (id: string) => {
    const map: Record<string, string> = { 
      en: '🇺🇸 English', 
      zh: '🇨🇳 Mandarin', 
      es: '🇪🇸 Spanish', 
      it: '🇮🇹 Italian', 
      de: '🇩🇪 German' 
    };
    return map[id] || id;
  };

  const getLevelName = (id: string) => {
    const map: Record<string, string> = {
      '1': 'Beginner', // Starter -> Beginner for test mapping
      '2': 'Beginner', 
      '3': 'Intermediate', 
      '4': 'Advanced', 
      '5': 'Advanced' // Fluent -> Advanced for test mapping
    };
    return map[id] || 'Beginner';
  };

  const filteredHistory = stats?.history.filter(record => filterLang === 'all' || record.language === filterLang) || [];

  // Group history by language and level to calculate test progress
  const getTestProgress = () => {
    if (!stats?.history) return [];
    
    const progress: Record<string, { count: number, language: string, level: string }> = {};
    
    stats.history.forEach(record => {
      // To determine level, we can infer it roughly from scores or topics, or simplify by assuming tests are per language
      // Here we group by language since we didn't track "level" in history. 
      // For simplicity, Test unlocks per Language if they have >= 5 total practices in that language.
      const key = `${record.language}`;
      if (!progress[key]) {
        progress[key] = { count: 0, language: record.language, level: 'Beginner' }; // Defaulting test level
      }
      progress[key].count += 1;
      
      // Upgrade test level based on practice count
      if (progress[key].count >= 15) progress[key].level = 'Advanced';
      else if (progress[key].count >= 10) progress[key].level = 'Intermediate';
    });
    
    return Object.values(progress);
  };

  const testProgress = getTestProgress();

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000
    }} onClick={onClose}>
      
      <div 
        className="premium-card animate-fade-in scrollbar-hide" 
        style={{ 
          width: '90%', maxWidth: '800px', maxHeight: '85vh', 
          overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column' 
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--foreground)' }}>Your Profile</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--card-border)' }}>
          {(['account', 'history', 'vocab', 'test'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none', border: 'none',
                padding: '0.8rem 1rem', fontSize: '1rem', fontWeight: 600,
                color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                textTransform: 'capitalize', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', minWidth: '100px' }}>
                <div style={{ fontSize: '2.5rem', lineHeight: 1, marginBottom: '0.2rem' }}>🔥</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f97316' }}>{stats?.streak || 0}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Streak</div>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.2rem', fontWeight: 500 }}>
                  {stats?.streak && stats.streak > 0 
                    ? "You're on fire! Keep it up." 
                    : "Complete an exercise to start your streak!"}
                </p>
              </div>
            </div>

            <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textTransform: 'uppercase', fontWeight: 600 }}>Name</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--foreground)', marginBottom: '1rem' }}>{session?.user?.name || 'User'}</p>
              
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textTransform: 'uppercase', fontWeight: 600 }}>Email</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--foreground)' }}>{session?.user?.email || 'No email'}</p>
            </div>

            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--foreground)' }}>Change Password</h3>
              <input 
                type="password" 
                placeholder="Current Password" 
                value={oldPassword} 
                onChange={e => setOldPassword(e.target.value)}
                className="premium-input"
              />
              <input 
                type="password" 
                placeholder="New Password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)}
                className="premium-input"
              />
              <button type="submit" className="btn-primary" style={{ padding: '0.8rem', fontSize: '1rem' }}>Update Password</button>
              {message && <p style={{ color: message.includes('success') ? 'var(--success)' : 'var(--error)', fontSize: '0.9rem', textAlign: 'center' }}>{message}</p>}
            </form>
          </div>
        )}

        {/* Streak Tab is merged into Account Tab */}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Recent Practice</h3>
              <select 
                className="premium-input" 
                value={filterLang} 
                onChange={e => setFilterLang(e.target.value)}
                style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '1.1rem', fontWeight: 600 }}
              >
                <option value="all">All Languages</option>
                <option value="en">🇺🇸 English</option>
                <option value="zh">🇨🇳 Mandarin</option>
                <option value="es">🇪🇸 Spanish</option>
                <option value="it">🇮🇹 Italian</option>
                <option value="de">🇩🇪 German</option>
              </select>
            </div>

            <div className="scrollbar-hide" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
              {filteredHistory.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>No history found for this selection.</p>
              ) : (
                filteredHistory.map(record => (
                  <div key={record.id} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', background: 'rgba(30, 58, 138, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                        {getLanguageName(record.language)} • {record.level || 'Beginner'} • {record.topic}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {new Date(record.date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p style={{ fontSize: '1rem', color: 'var(--foreground)', lineHeight: 1.5, margin: '0.5rem 0', fontStyle: 'italic' }}>
                      "{record.prompt}"
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>Accuracy:</span>
                      <span style={{ 
                        fontSize: '1rem', fontWeight: 700, 
                        color: record.score > 80 ? 'var(--success)' : record.score > 50 ? 'var(--secondary)' : 'var(--error)' 
                      }}>
                        {record.score}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Vocab Tab */}
        {activeTab === 'vocab' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Saved Vocabulary</h3>
              <select 
                className="premium-input" 
                value={filterLang} 
                onChange={e => setFilterLang(e.target.value)}
                style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '1.1rem', fontWeight: 600 }}
              >
                <option value="all">All Languages</option>
                <option value="en">🇺🇸 English</option>
                <option value="zh">🇨🇳 Mandarin</option>
                <option value="es">🇪🇸 Spanish</option>
                <option value="it">🇮🇹 Italian</option>
                <option value="de">🇩🇪 German</option>
              </select>
            </div>

            <div className="scrollbar-hide" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
              {savedVocab.filter(v => filterLang === 'all' || v.language === filterLang).length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>No saved vocabulary found for this selection.</p>
              ) : (
                savedVocab
                  .filter(v => filterLang === 'all' || v.language === filterLang)
                  .map(vocab => (
                  <div key={vocab.id} style={{ padding: '1.2rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'Lexend, sans-serif' }}>
                        {vocab.word}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {getLanguageName(vocab.language)}
                      </span>
                    </div>
                    
                    <p style={{ fontSize: '1rem', color: 'var(--foreground)', lineHeight: 1.5, margin: 0, fontWeight: 300 }}>
                      {vocab.definition}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Test Tab */}
        {activeTab === 'test' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.5rem' }}>Language Proficiency Tests</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                Complete at least 5 practice exercises in a language to unlock its Beginner test. Keep practicing to unlock higher level tests!
              </p>
            </div>

            <div className="scrollbar-hide" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
              {(['en', 'zh', 'es', 'it', 'de'] as const).map(langId => {
                const progressData = testProgress.find(p => p.language === langId);
                const count = progressData?.count || 0;
                const level = progressData?.level || 'Beginner';
                const isUnlocked = count >= 5;
                const progressPercentage = Math.min(100, (count / 5) * 100);

                return (
                  <div key={langId} style={{ 
                    padding: '1.5rem', 
                    background: isUnlocked ? 'linear-gradient(to right, #f8fafc, #f1f5f9)' : '#f8fafc',
                    borderRadius: '16px', 
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    opacity: isUnlocked ? 1 : 0.7
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'Lexend, sans-serif' }}>
                        {getLanguageName(langId)} Test
                      </span>
                      {isUnlocked && (
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', background: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                          {level} Level Available
                        </span>
                      )}
                    </div>
                    
                    {!isUnlocked ? (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                          <span>Practice Progress</span>
                          <span>{count} / 5</span>
                        </div>
                        <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${progressPercentage}%`, height: '100%', background: 'var(--primary)' }} />
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                          Complete {5 - count} more practices to unlock this test.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--foreground)' }}>
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
          </div>
        )}

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
