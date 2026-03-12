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

const getStorageKey = (email: string) => `text2fluent_stats_${email}`;

export const getUserStats = (email: string): UserStats => {
  if (typeof window === 'undefined') return { streak: 0, lastPracticeDate: null, history: [] };
  
  const data = localStorage.getItem(getStorageKey(email));
  if (data) {
    const parsed = JSON.parse(data);
    // Ensure backwards compatibility
    if (!parsed.savedVocab) parsed.savedVocab = [];
    return parsed;
  }
  return { streak: 0, lastPracticeDate: null, history: [], savedVocab: [] };
};

export const addPracticeRecord = (email: string, record: Omit<PracticeRecord, 'id' | 'date'>) => {
  if (typeof window === 'undefined') return;

  const stats = getUserStats(email);
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  // Calculate Streak
  let newStreak = stats.streak;
  if (stats.lastPracticeDate) {
    const lastDate = new Date(stats.lastPracticeDate);
    const lastDateStr = lastDate.toISOString().split('T')[0];
    
    // Check if the difference is exactly 1 day
    const timeDiff = now.getTime() - lastDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    if (todayStr !== lastDateStr) {
        if (daysDiff <= 1) {
            newStreak += 1; // Continued streak
        } else {
            newStreak = 1; // Broken streak, reset
        }
    }
  } else {
    // First time practicing
    newStreak = 1;
  }

  const newRecord: PracticeRecord = {
    ...record,
    id: Date.now().toString(),
    date: now.toISOString(),
  };

  const newStats: UserStats = {
    streak: newStreak,
    lastPracticeDate: now.toISOString(),
    history: [newRecord, ...stats.history], // Prepend new record
  };

  localStorage.setItem(getStorageKey(email), JSON.stringify(newStats));
};

export const clearUserHistory = (email: string) => {
  if (typeof window === 'undefined') return;
  const stats = getUserStats(email);
  localStorage.setItem(getStorageKey(email), JSON.stringify({ ...stats, history: [] }));
};

export const saveVocab = (email: string, word: string, language: string, definition: string) => {
  if (typeof window === 'undefined') return;

  const stats = getUserStats(email);
  
  // Check if word already exists for this language
  const exists = stats.savedVocab?.some(v => v.word === word && v.language === language);
  if (exists) return; // Don't save duplicates

  const newVocab: SavedVocab = {
    id: Date.now().toString(),
    word,
    language,
    definition,
    dateAdded: new Date().toISOString()
  };

  const newStats: UserStats = {
    ...stats,
    savedVocab: [newVocab, ...(stats.savedVocab || [])]
  };

  localStorage.setItem(getStorageKey(email), JSON.stringify(newStats));
};

export const getSavedVocab = (email: string): SavedVocab[] => {
  return getUserStats(email).savedVocab || [];
};
