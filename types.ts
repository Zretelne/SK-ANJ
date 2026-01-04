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

export interface VocabEntry {
  id: string;
  slovak: string;
  english: string;
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