'use client';

import { useState, useEffect } from 'react';
import { getUserStats, UserStats } from '@/utils/userTracker';
import { useSession } from '@/components/Providers';

export default function HistoryTab() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [filterLang, setFilterLang] = useState('all');

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

  const filteredHistory = stats?.history.filter(record => filterLang === 'all' || record.language === filterLang) || [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '800px', margin: '2rem auto 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.5)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--card-border)' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--foreground)' }}>Recent Practice</h3>
        <select 
          className="premium-input" 
          value={filterLang} 
          onChange={e => setFilterLang(e.target.value)}
          style={{ width: 'auto', padding: '0.6rem 1.2rem', fontSize: '1.1rem', fontWeight: 600 }}
        >
          <option value="all">All Languages</option>
          <option value="en">🇺🇸 English</option>
          <option value="zh">🇨🇳 Mandarin</option>
          <option value="es">🇪🇸 Spanish</option>
          <option value="it">🇮🇹 Italian</option>
          <option value="de">🇩🇪 German</option>
        </select>
      </div>

      <div className="scrollbar-hide" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', height: '100%', paddingBottom: '2rem' }}>
        {filteredHistory.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0', fontSize: '1.1rem' }}>No history found for this selection.</p>
        ) : (
          filteredHistory.map(record => (
            <div key={record.id} style={{ 
              padding: '1.5rem', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', 
              borderRadius: '20px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', background: 'rgba(30, 58, 138, 0.1)', padding: '0.4rem 0.8rem', borderRadius: '8px' }}>
                  {getLanguageName(record.language)} • {record.level || 'Beginner'} • {record.topic}
                </span>
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
                  {new Date(record.date).toLocaleDateString()}
                </span>
              </div>
              
              <p style={{ fontSize: '1.2rem', color: 'var(--foreground)', lineHeight: 1.5, margin: '1rem 0', fontStyle: 'italic' }}>
                "{record.prompt}"
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>Accuracy:</span>
                <span style={{ 
                  fontSize: '1.2rem', fontWeight: 700, 
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
  );
}
