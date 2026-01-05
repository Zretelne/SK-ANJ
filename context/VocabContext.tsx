import React, { createContext, useContext, useEffect, useState } from 'react';
import { VocabEntry, VocabStatus, VocabCollection, UserStats } from '../types';
import { VocabRepository } from '../services/VocabRepository';
import { StatsService } from '../services/StatsService';
import { useAuth } from './AuthContext';

interface VocabContextType {
  collections: VocabCollection[];
  activeCollection: VocabCollection | null;
  entries: VocabEntry[];
  isLoading: boolean;
  userStats: UserStats;
  
  createCollection: (name: string) => Promise<void>;
  setActiveCollectionId: (id: string) => void;
  deleteCollection: (id: string) => Promise<void>;

  addEntry: (slovak: string, english: string, sentence?: string) => Promise<void>;
  updateEntry: (entry: VocabEntry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  getEntriesByStatus: (status: VocabStatus) => VocabEntry[];
  toggleReveal: (id: string) => Promise<void>;
  resetAllRevealed: () => Promise<void>;
  recordTestResult: (id: string, isCorrect: boolean) => Promise<void>;
}

const VocabContext = createContext<VocabContextType | undefined>(undefined);

export const VocabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  
  const [collections, setCollections] = useState<VocabCollection[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [entries, setEntries] = useState<VocabEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Gamification Stats
  const [userStats, setUserStats] = useState<UserStats>(StatsService.getEmptyStats());

  // 1. Load Collections & Stats on Init/User Change
  useEffect(() => {
    const initData = async () => {
      if (authLoading) return;
      setIsLoading(true);
      
      // Load Collections
      const cols = await VocabRepository.getCollections(user?.uid);
      if (cols.length > 0) {
        setCollections(cols);
        if (!activeCollectionId || !cols.find(c => c.id === activeCollectionId)) {
          setActiveCollectionId(cols[0].id);
        }
      } else {
        const defaultCol: VocabCollection = {
            id: crypto.randomUUID(),
            name: 'SK - ANJ',
            createdAt: Date.now()
        };
        await VocabRepository.createCollection(defaultCol, user?.uid);
        setCollections([defaultCol]);
        setActiveCollectionId(defaultCol.id);
      }

      // Load Stats
      const stats = await StatsService.getStats(user?.uid);
      setUserStats(stats);

      setIsLoading(false);
    };

    initData();
  }, [user, authLoading]);

  // 2. Load Entries when Active Collection Changes
  useEffect(() => {
    const loadEntries = async () => {
      if (!activeCollectionId) return;
      const data = await VocabRepository.getAllEntries(activeCollectionId, user?.uid);
      setEntries(data);
    };

    loadEntries();
  }, [activeCollectionId, user]);

  // --- Helper to log activity ---
  const logActivity = async () => {
    const newStats = StatsService.calculateNewStats(userStats);
    setUserStats(newStats);
    await StatsService.saveStats(newStats, user?.uid);
  };

  // --- Actions ---

  const createCollection = async (name: string) => {
    const newCol: VocabCollection = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now()
    };
    
    setCollections(prev => [newCol, ...prev]);
    setActiveCollectionId(newCol.id);
    await VocabRepository.createCollection(newCol, user?.uid);
  };

  const deleteCollection = async (id: string) => {
    const newCollections = collections.filter(c => c.id !== id);
    setCollections(newCollections);
    
    if (activeCollectionId === id) {
        setActiveCollectionId(newCollections.length > 0 ? newCollections[0].id : null);
    }
    
    await VocabRepository.deleteCollection(id, user?.uid);
  };

  const addEntry = async (slovak: string, english: string, sentence?: string) => {
    if (!activeCollectionId) return;

    const newEntry: VocabEntry = {
      id: crypto.randomUUID(),
      slovak,
      english,
      sentence: sentence || '',
      status: VocabStatus.NEW,
      correctCount: 0,
      wrongCount: 0,
      isRevealed: false,
    };

    setEntries(prev => [...prev, newEntry]);
    await VocabRepository.addEntry(activeCollectionId, newEntry, user?.uid);
    await logActivity(); // Track activity
  };

  const updateEntry = async (entry: VocabEntry) => {
    if (!activeCollectionId) return;
    setEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
    await VocabRepository.updateEntry(activeCollectionId, entry, user?.uid);
  };

  const deleteEntry = async (id: string) => {
    if (!activeCollectionId) return;
    setEntries(prev => prev.filter(e => e.id !== id));
    await VocabRepository.deleteEntry(activeCollectionId, id, user?.uid);
  };

  const getEntriesByStatus = (status: VocabStatus) => {
    return entries.filter(e => e.status === status);
  };

  const toggleReveal = async (id: string) => {
    if (!activeCollectionId) return;
    const entry = entries.find(e => e.id === id);
    if (entry) {
      const updated = { ...entry, isRevealed: !entry.isRevealed };
      await updateEntry(updated);
      
      // Log activity only if revealing (learning action)
      if (!entry.isRevealed) {
        await logActivity();
      }
    }
  };

  const resetAllRevealed = async () => {
    if (!activeCollectionId) return;
    const toUpdate = entries
      .filter(e => e.status === VocabStatus.LEARNING && e.isRevealed)
      .map(e => ({ ...e, isRevealed: false }));

    if (toUpdate.length > 0) {
      setEntries(prev => prev.map(e => {
        const match = toUpdate.find(u => u.id === e.id);
        return match || e;
      }));
      await VocabRepository.updateEntries(activeCollectionId, toUpdate, user?.uid);
    }
  };

  const recordTestResult = async (id: string, isCorrect: boolean) => {
    if (!activeCollectionId) return;
    const entry = entries.find(e => e.id === id);
    if (entry) {
      const updated = {
        ...entry,
        correctCount: entry.correctCount + (isCorrect ? 1 : 0),
        wrongCount: entry.wrongCount + (isCorrect ? 0 : 1),
        lastReviewed: Date.now(),
      };
      await updateEntry(updated);
      await logActivity(); // Track activity
    }
  };

  const activeCollection = collections.find(c => c.id === activeCollectionId) || null;

  return (
    <VocabContext.Provider value={{ 
      collections,
      activeCollection,
      entries, 
      isLoading: isLoading || authLoading, 
      userStats,
      createCollection,
      setActiveCollectionId,
      deleteCollection,
      addEntry, 
      updateEntry, 
      deleteEntry, 
      getEntriesByStatus,
      toggleReveal,
      resetAllRevealed,
      recordTestResult
    }}>
      {children}
    </VocabContext.Provider>
  );
};

export const useVocab = () => {
  const context = useContext(VocabContext);
  if (!context) {
    throw new Error('useVocab must be used within a VocabProvider');
  }
  return context;
};