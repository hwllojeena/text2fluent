export interface PracticeRecord {
  id: string;
  date: string; // ISO string
  language: string;
  topic: string;
  prompt: string;
  score: number;
  level?: string;
}

export interface SavedVocab {
  id: string;
  word: string;
  language: string;
  definition: string;
  dateAdded: string; // ISO string
}

export interface UserStats {
  streak: number;
  lastPracticeDate: string | null;
  history: PracticeRecord[];
  savedVocab?: SavedVocab[]; // Optional for backward compatibility
}

import { supabase } from './supabase';

export const getUserStats = async (userId: string): Promise<UserStats> => {
  const [{ data: stats }, { data: history }, { data: vocab }] = await Promise.all([
    supabase.from('user_stats').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('practice_history').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('saved_vocabulary').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  ]);

  return {
    streak: stats?.streak || 0,
    lastPracticeDate: stats?.last_practice_date || null,
    history: history?.map(h => ({
      id: h.id,
      date: h.created_at,
      language: h.language,
      topic: h.topic,
      prompt: h.prompt,
      score: h.score,
      level: h.level
    })) || [],
    savedVocab: vocab?.map(v => ({
      id: v.id,
      word: v.word,
      language: v.language,
      definition: v.definition,
      dateAdded: v.created_at
    })) || []
  };
};

export const addPracticeRecord = async (userId: string, record: Omit<PracticeRecord, 'id' | 'date'>) => {
  const { data: stats } = await supabase.from('user_stats').select('*').eq('user_id', userId).maybeSingle();
  const now = new Date();
  let newStreak = stats?.streak || 0;
  
  if (stats?.last_practice_date) {
    const lastDate = new Date(stats.last_practice_date);
    const lastDateStr = lastDate.toISOString().split('T')[0];
    const todayStr = now.toISOString().split('T')[0];
    const timeDiff = now.getTime() - lastDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    if (todayStr !== lastDateStr) {
        if (daysDiff <= 1) {
            newStreak += 1;
        } else {
            newStreak = 1;
        }
    }
  } else {
    newStreak = 1;
  }

  await supabase.from('user_stats').upsert({
    user_id: userId,
    streak: newStreak,
    last_practice_date: now.toISOString(),
    updated_at: now.toISOString()
  }, { onConflict: 'user_id' });

  await supabase.from('practice_history').insert({
    user_id: userId,
    language: record.language,
    level: record.level,
    topic: record.topic,
    prompt: record.prompt,
    score: record.score
  });
};

export const clearUserHistory = async (userId: string) => {
  await supabase.from('practice_history').delete().eq('user_id', userId);
};

export const saveVocab = async (userId: string, word: string, language: string, definition: string) => {
  // Using UPSERT to avoid unique constraint matching errors, or we can just ignore errors
  const { error } = await supabase.from('saved_vocabulary').insert({
    user_id: userId,
    language,
    word,
    definition
  });
  if (error && error.code !== '23505') {
    console.error("Failed to save vocab:", error);
  }
};

export const getSavedVocab = async (userId: string): Promise<SavedVocab[]> => {
  const { data: vocab } = await supabase.from('saved_vocabulary').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return vocab?.map(v => ({
    id: v.id,
    word: v.word,
    language: v.language,
    definition: v.definition,
    dateAdded: v.created_at
  })) || [];
};

export const removeVocab = async (userId: string, vocabId: string) => {
  await supabase.from('saved_vocabulary').delete().eq('id', vocabId).eq('user_id', userId);
};
