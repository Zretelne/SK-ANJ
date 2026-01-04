import React, { createContext, useContext, useEffect, useState } from 'react';
import { VocabEntry, VocabStatus } from '../types';
import { VocabRepository } from '../services/VocabRepository';
import { useAuth } from './AuthContext';

interface VocabContextType {
  entries: VocabEntry[];
  isLoading: boolean;
  addEntry: (slovak: string, english: string) => Promise<void>;
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
  const [entries, setEntries] = useState<VocabEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load entries whenever user changes (Login/Logout)
  const loadEntries = async () => {
    setIsLoading(true);
    // If auth is still loading, wait.
    if (authLoading) return;

    const userId = user?.uid;
    const data = await VocabRepository.getAllEntries(userId);
    setEntries(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadEntries();
  }, [user, authLoading]);

  const addEntry = async (slovak: string, english: string) => {
    const newEntry: VocabEntry = {
      id: crypto.randomUUID(),
      slovak,
      english,
      status: VocabStatus.NEW,
      correctCount: 0,
      wrongCount: 0,
      isRevealed: false,
    };
    await VocabRepository.addEntry(newEntry, user?.uid);
    // Optimistic update or reload
    await loadEntries(); 
  };

  const updateEntry = async (entry: VocabEntry) => {
    // Optimistic update for UI speed
    setEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
    await VocabRepository.updateEntry(entry, user?.uid);
  };

  const deleteEntry = async (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    await VocabRepository.deleteEntry(id, user?.uid);
  };

  const getEntriesByStatus = (status: VocabStatus) => {
    return entries.filter(e => e.status === status);
  };

  const toggleReveal = async (id: string) => {
    const entry = entries.find(e => e.id === id);
    if (entry) {
      const updated = { ...entry, isRevealed: !entry.isRevealed };
      await updateEntry(updated);
    }
  };

  const resetAllRevealed = async () => {
    const toUpdate = entries
      .filter(e => e.status === VocabStatus.LEARNING && e.isRevealed)
      .map(e => ({ ...e, isRevealed: false }));

    if (toUpdate.length > 0) {
      // Optimistic
      setEntries(prev => prev.map(e => {
        const match = toUpdate.find(u => u.id === e.id);
        return match || e;
      }));
      await VocabRepository.updateEntries(toUpdate, user?.uid);
    }
  };

  const recordTestResult = async (id: string, isCorrect: boolean) => {
    const entry = entries.find(e => e.id === id);
    if (entry) {
      const updated = {
        ...entry,
        correctCount: entry.correctCount + (isCorrect ? 1 : 0),
        wrongCount: entry.wrongCount + (isCorrect ? 0 : 1),
        lastReviewed: Date.now(),
      };
      await updateEntry(updated);
    }
  };

  return (
    <VocabContext.Provider value={{ 
      entries, 
      isLoading: isLoading || authLoading, 
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
