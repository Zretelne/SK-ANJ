import { VocabEntry, VocabCollection } from '../types';

const LS_KEY_DATA_PREFIX = 'slovnik_data_';
const LS_KEY_COLLECTIONS = 'slovnik_collections';

export class VocabRepository {
  
  // --- COLLECTIONS MANAGEMENT ---

  static async getCollections(userId?: string): Promise<VocabCollection[]> {
    return this.getLocalStorageCollections();
  }

  static async createCollection(col: VocabCollection, userId?: string): Promise<void> {
    const cols = await this.getLocalStorageCollections();
    cols.unshift(col);
    localStorage.setItem(LS_KEY_COLLECTIONS, JSON.stringify(cols));
  }

  static async deleteCollection(colId: string, userId?: string): Promise<void> {
    const cols = await this.getLocalStorageCollections();
    const filtered = cols.filter(c => c.id !== colId);
    localStorage.setItem(LS_KEY_COLLECTIONS, JSON.stringify(filtered));
    localStorage.removeItem(LS_KEY_DATA_PREFIX + colId);
  }

  // --- ENTRIES MANAGEMENT ---

  static async getAllEntries(collectionId: string, userId?: string): Promise<VocabEntry[]> {
    return this.getLocalStorageEntries(collectionId);
  }

  static async addEntry(collectionId: string, entry: VocabEntry, userId?: string): Promise<void> {
    const entries = await this.getLocalStorageEntries(collectionId);
    entries.push(entry);
    await this.saveLocalStorageEntries(collectionId, entries);
  }

  static async updateEntry(collectionId: string, updatedEntry: VocabEntry, userId?: string): Promise<void> {
    const entries = await this.getLocalStorageEntries(collectionId);
    const index = entries.findIndex(e => e.id === updatedEntry.id);
    if (index !== -1) {
      entries[index] = updatedEntry;
      await this.saveLocalStorageEntries(collectionId, entries);
    }
  }

  static async updateEntries(collectionId: string, updatedEntries: VocabEntry[], userId?: string): Promise<void> {
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

  static async deleteEntry(collectionId: string, id: string, userId?: string): Promise<void> {
    const entries = await this.getLocalStorageEntries(collectionId);
    const filtered = entries.filter(e => e.id !== id);
    await this.saveLocalStorageEntries(collectionId, filtered);
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