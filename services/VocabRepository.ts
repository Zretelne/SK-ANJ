import { VocabEntry, VocabStatus, VocabCollection } from '../types';
import { db } from '../lib/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch,
  query,
  orderBy
} from 'firebase/firestore';

const LS_KEY_DATA_PREFIX = 'slovnik_data_';
const LS_KEY_COLLECTIONS = 'slovnik_collections';

export class VocabRepository {
  
  // --- COLLECTIONS MANAGEMENT ---

  static async getCollections(userId?: string): Promise<VocabCollection[]> {
    if (userId && db) {
      try {
        const q = query(collection(db, 'users', userId, 'collections'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as VocabCollection);
      } catch (e) {
        console.error('Error fetching collections', e);
        return [];
      }
    } else {
      return this.getLocalStorageCollections();
    }
  }

  static async createCollection(col: VocabCollection, userId?: string): Promise<void> {
    if (userId && db) {
      await setDoc(doc(db, 'users', userId, 'collections', col.id), col);
    } else {
      const cols = await this.getLocalStorageCollections();
      cols.unshift(col);
      localStorage.setItem(LS_KEY_COLLECTIONS, JSON.stringify(cols));
    }
  }

  static async deleteCollection(colId: string, userId?: string): Promise<void> {
    if (userId && db) {
      // Note: Firestore subcollections are not automatically deleted. 
      // In a production app, we should use a Cloud Function to recursive delete.
      // Here we just delete the metadata doc for simplicity in frontend.
      await deleteDoc(doc(db, 'users', userId, 'collections', colId));
    } else {
      const cols = await this.getLocalStorageCollections();
      const filtered = cols.filter(c => c.id !== colId);
      localStorage.setItem(LS_KEY_COLLECTIONS, JSON.stringify(filtered));
      localStorage.removeItem(LS_KEY_DATA_PREFIX + colId);
    }
  }

  // --- ENTRIES MANAGEMENT ---

  static async getAllEntries(collectionId: string, userId?: string): Promise<VocabEntry[]> {
    if (userId && db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'users', userId, 'collections', collectionId, 'vocab'));
        return querySnapshot.docs.map(doc => doc.data() as VocabEntry);
      } catch (e) {
        console.error('Error fetching entries', e);
        return [];
      }
    } else {
      return this.getLocalStorageEntries(collectionId);
    }
  }

  static async addEntry(collectionId: string, entry: VocabEntry, userId?: string): Promise<void> {
    if (userId && db) {
      try {
        await setDoc(doc(db, 'users', userId, 'collections', collectionId, 'vocab', entry.id), entry);
      } catch (e) {
        console.error('Error adding to Firestore', e);
      }
    } else {
      const entries = await this.getLocalStorageEntries(collectionId);
      entries.push(entry);
      await this.saveLocalStorageEntries(collectionId, entries);
    }
  }

  static async updateEntry(collectionId: string, updatedEntry: VocabEntry, userId?: string): Promise<void> {
    if (userId && db) {
      try {
        await setDoc(doc(db, 'users', userId, 'collections', collectionId, 'vocab', updatedEntry.id), updatedEntry, { merge: true });
      } catch (e) {
        console.error('Error updating Firestore', e);
      }
    } else {
      const entries = await this.getLocalStorageEntries(collectionId);
      const index = entries.findIndex(e => e.id === updatedEntry.id);
      if (index !== -1) {
        entries[index] = updatedEntry;
        await this.saveLocalStorageEntries(collectionId, entries);
      }
    }
  }

  static async updateEntries(collectionId: string, updatedEntries: VocabEntry[], userId?: string): Promise<void> {
    if (userId && db) {
      const firestore = db;
      try {
        const batch = writeBatch(firestore);
        updatedEntries.forEach(entry => {
          const ref = doc(firestore, 'users', userId, 'collections', collectionId, 'vocab', entry.id);
          batch.set(ref, entry, { merge: true });
        });
        await batch.commit();
      } catch (e) {
        console.error('Error batch updating Firestore', e);
      }
    } else {
      const entries = await this.getLocalStorageEntries(collectionId);
      const updateMap = new Map(updatedEntries.map(e => [e.id, e]));
      
      const newEntries = entries.map(entry => {
        if (updateMap.has(entry.id)) {
          return updateMap.get(entry.id)!;
        }
        return entry;
      });
      await this.saveLocalStorageEntries(collectionId, newEntries);
    }
  }

  static async deleteEntry(collectionId: string, id: string, userId?: string): Promise<void> {
    if (userId && db) {
      try {
        await deleteDoc(doc(db, 'users', userId, 'collections', collectionId, 'vocab', id));
      } catch (e) {
        console.error('Error deleting from Firestore', e);
      }
    } else {
      const entries = await this.getLocalStorageEntries(collectionId);
      const filtered = entries.filter(e => e.id !== id);
      await this.saveLocalStorageEntries(collectionId, filtered);
    }
  }

  // --- Local Storage Helpers ---

  private static getLocalStorageCollections(): VocabCollection[] {
    try {
      const data = localStorage.getItem(LS_KEY_COLLECTIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  private static getLocalStorageEntries(collectionId: string): VocabEntry[] {
    try {
      const data = localStorage.getItem(LS_KEY_DATA_PREFIX + collectionId);
      if (!data) return [];
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }

  private static async saveLocalStorageEntries(collectionId: string, data: VocabEntry[]): Promise<void> {
    try {
      localStorage.setItem(LS_KEY_DATA_PREFIX + collectionId, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to storage', e);
    }
  }
}