import React from 'react';

export enum AppTab {
  NEW = 'new',
  LEARNING = 'learning',
  LEARNED = 'learned'
}

export enum VocabStatus {
  NEW = 'new',
  LEARNING = 'learning',
  LEARNED = 'learned'
}

export interface VocabCollection {
  id: string;
  name: string; // Napr. "Angličtina", "Nemčina - frázy"
  createdAt: number;
}

export interface VocabEntry {
  id: string;
  slovak: string; // Toto chápeme ako "Front side" (Zdrojový jazyk)
  english: string; // Toto chápeme ako "Back side" (Cieľový jazyk)
  sentence?: string; // Vzorová veta pre kontext
  status: VocabStatus;
  correctCount: number;
  wrongCount: number;
  lastReviewed?: number; // timestamp
  isRevealed: boolean;
}

export interface TabConfig {
  id: AppTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  count: number; // Number of actions
}

export interface UserStats {
  streak: number;
  lastActiveDate: string | null; // YYYY-MM-DD
  totalActions: number;
  activityMap: Record<string, number>; // Key: YYYY-MM-DD, Value: count
}