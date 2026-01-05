import { UserStats } from '../types';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const LS_KEY_STATS = 'slovnik_stats';

export class StatsService {
  
  // Helper to get local YYYY-MM-DD date to avoid UTC streak issues
  static getTodayDate(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  static getYesterdayDate(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  static getEmptyStats(): UserStats {
    return {
      streak: 0,
      lastActiveDate: null,
      totalActions: 0,
      activityMap: {}
    };
  }

  // Calculate new stats based on current state
  static calculateNewStats(currentStats: UserStats): UserStats {
    const today = this.getTodayDate();
    const yesterday = this.getYesterdayDate();
    
    let newStreak = currentStats.streak;
    
    // Streak Logic
    if (currentStats.lastActiveDate === today) {
      // Already active today, keep streak
      newStreak = currentStats.streak;
    } else if (currentStats.lastActiveDate === yesterday) {
      // Active yesterday, increment streak
      newStreak = currentStats.streak + 1;
    } else {
      // Missed a day (or first time), reset to 1
      newStreak = 1;
    }

    // Activity Map Logic
    const newActivityMap = { ...(currentStats.activityMap || {}) };
    newActivityMap[today] = (newActivityMap[today] || 0) + 1;

    return {
      streak: newStreak,
      lastActiveDate: today,
      totalActions: (currentStats.totalActions || 0) + 1,
      activityMap: newActivityMap
    };
  }

  // --- PERSISTENCE ---

  static async getStats(userId?: string): Promise<UserStats> {
    const empty = this.getEmptyStats();

    if (userId && db) {
      try {
        const docRef = doc(db, 'users', userId, 'stats', 'main');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          // MERGE with default stats to ensure all fields exist (prevents undefined crashes)
          return { ...empty, ...docSnap.data() } as UserStats;
        }
      } catch (e) {
        console.error('Error fetching stats from Firestore', e);
      }
    } 
    
    // Fallback to LocalStorage or if user not logged in
    try {
      const data = localStorage.getItem(LS_KEY_STATS);
      if (data) {
        const parsed = JSON.parse(data);
        // MERGE with default stats here too
        return { ...empty, ...parsed };
      }
      return empty;
    } catch (e) {
      return empty;
    }
  }

  static async saveStats(stats: UserStats, userId?: string): Promise<void> {
    // Always save to LS for offline capability / speed
    localStorage.setItem(LS_KEY_STATS, JSON.stringify(stats));

    if (userId && db) {
      try {
        await setDoc(doc(db, 'users', userId, 'stats', 'main'), stats, { merge: true });
      } catch (e) {
        console.error('Error saving stats to Firestore', e);
      }
    }
  }
}