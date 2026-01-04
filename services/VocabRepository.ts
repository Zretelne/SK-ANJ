import { VocabEntry, VocabStatus } from '../types';
import { db } from '../lib/firebase';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  query,
  getDoc
} from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'slovnik_vocab_data';

export class VocabRepository {
  /**
   * Načíta dáta.
   * Ak je userId (prihlásený užívateľ) a máme DB spojenie, ťahá z Firebase.
   * Inak ťahá z LocalStorage.
   */
  static async getAllEntries(userId?: string): Promise<VocabEntry[]> {
    if (userId && db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'users', userId, 'vocab'));
        const entries = querySnapshot.docs.map(doc => doc.data() as VocabEntry);

        // Ak je užívateľ nový vo Firebase, skúsime mu tam nahrať demo dáta, alebo dáta z localstorage?
        // Pre jednoduchosť, ak je prázdny, vrátime prázdne pole (alebo seed ak chceme)
        if (entries.length === 0) {
          // Optional: Migrácia z localstorage pri prvom prihlásení by bola tu.
          return [];
        }
        return entries;
      } catch (e) {
        console.error('Error fetching from Firestore', e);
        return [];
      }
    } else {
      return this.getLocalStorage();
    }
  }

  static async addEntry(entry: VocabEntry, userId?: string): Promise<void> {
    if (userId && db) {
      try {
        await setDoc(doc(db, 'users', userId, 'vocab', entry.id), entry);
      } catch (e) {
        console.error('Error adding to Firestore', e);
      }
    } else {
      const entries = await this.getLocalStorage();
      entries.push(entry);
      await this.saveLocalStorage(entries);
    }
  }

  static async updateEntry(updatedEntry: VocabEntry, userId?: string): Promise<void> {
    if (userId && db) {
      try {
        await setDoc(doc(db, 'users', userId, 'vocab', updatedEntry.id), updatedEntry, { merge: true });
      } catch (e) {
        console.error('Error updating Firestore', e);
      }
    } else {
      const entries = await this.getLocalStorage();
      const index = entries.findIndex(e => e.id === updatedEntry.id);
      if (index !== -1) {
        entries[index] = updatedEntry;
        await this.saveLocalStorage(entries);
      }
    }
  }

  static async updateEntries(updatedEntries: VocabEntry[], userId?: string): Promise<void> {
    if (userId && db) {
      const firestore = db;
      try {
        const batch = writeBatch(firestore);
        updatedEntries.forEach(entry => {
          const ref = doc(firestore, 'users', userId, 'vocab', entry.id);
          batch.set(ref, entry, { merge: true });
        });
        await batch.commit();
      } catch (e) {
        console.error('Error batch updating Firestore', e);
      }
    } else {
      const entries = await this.getLocalStorage();
      const updateMap = new Map(updatedEntries.map(e => [e.id, e]));

      const newEntries = entries.map(entry => {
        if (updateMap.has(entry.id)) {
          return updateMap.get(entry.id)!;
        }
        return entry;
      });
      await this.saveLocalStorage(newEntries);
    }
  }

  static async deleteEntry(id: string, userId?: string): Promise<void> {
    if (userId && db) {
      try {
        await deleteDoc(doc(db, 'users', userId, 'vocab', id));
      } catch (e) {
        console.error('Error deleting from Firestore', e);
      }
    } else {
      const entries = await this.getLocalStorage();
      const filtered = entries.filter(e => e.id !== id);
      await this.saveLocalStorage(filtered);
    }
  }

  // --- Local Storage Helpers ---

  private static async getLocalStorage(): Promise<VocabEntry[]> {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!data) return VocabRepository.seedInitialData();
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading from storage', e);
      return [];
    }
  }

  private static async saveLocalStorage(data: VocabEntry[]): Promise<void> {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to storage', e);
    }
  }

  private static seedInitialData(): VocabEntry[] {
    const initialData: VocabEntry[] = [
      { id: '1', slovak: 'Ahoj', english: 'Hello', status: VocabStatus.NEW, correctCount: 0, wrongCount: 0, isRevealed: false },
      { id: '2', slovak: 'Ďakujem', english: 'Thank you', status: VocabStatus.NEW, correctCount: 0, wrongCount: 0, isRevealed: false },
      { id: '3', slovak: 'Pes', english: 'Dog', status: VocabStatus.LEARNING, correctCount: 1, wrongCount: 0, lastReviewed: Date.now(), isRevealed: false },
    ];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }
}
