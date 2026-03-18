'use client';

import { useState, useEffect } from 'react';
import { getSavedVocab, removeVocab, SavedVocab } from '@/utils/userTracker';
import { useSession } from '@/components/Providers';

export default function VocabTab() {
  const { data: session } = useSession();
  const [savedVocab, setSavedVocab] = useState<SavedVocab[]>([]);
  const [filterLang, setFilterLang] = useState('all');

  useEffect(() => {
    const fetchVocab = async () => {
      if (session && session.user && (session.user as any).id) {
        const userId = (session.user as any).id;
        const vocabData = await getSavedVocab(userId);
        setSavedVocab(vocabData);
      }
    };
    fetchVocab();
  }, [session]);

  const getLanguageName = (id: string) => {
    const map: Record<string, string> = { 
      en: '🇺🇸 English', zh: '🇨🇳 Mandarin', es: '🇪🇸 Spanish', it: '🇮🇹 Italian', de: '🇩🇪 German' 
    };
    return map[id] || id;
  };

  const filteredVocab = savedVocab.filter(v => filterLang === 'all' || v.language === filterLang);

  const handleUnsave = async (vocabId: string) => {
    if (session && session.user && (session.user as any).id) {
      const userId = (session.user as any).id;
      await removeVocab(userId, vocabId);
      setSavedVocab(await getSavedVocab(userId));
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '800px', margin: '2rem auto 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.5)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--card-border)' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--foreground)' }}>Saved Vocabulary</h3>
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
        {filteredVocab.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0', fontSize: '1.1rem' }}>No saved vocabulary found for this selection.</p>
        ) : (
          filteredVocab.map(vocab => (
            <div key={vocab.id} style={{ 
              padding: '1.5rem', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', 
              borderRadius: '20px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'Lexend, sans-serif' }}>
                  {vocab.word}
                </span>
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
                  {getLanguageName(vocab.language)}
                </span>
              </div>
              
              <p style={{ fontSize: '1.1rem', color: 'var(--foreground)', lineHeight: 1.5, margin: 0, fontWeight: 300 }}>
                {vocab.definition}
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button 
                  onClick={() => handleUnsave(vocab.id)}
                  style={{ 
                    background: 'none', border: 'none', color: 'var(--error)', 
                    fontSize: '1rem', cursor: 'pointer', fontWeight: 600, 
                    padding: '0.4rem 0.8rem', borderRadius: '8px', transition: 'background 0.2s' 
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Unsave 🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
