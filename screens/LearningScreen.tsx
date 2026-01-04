import React, { useState } from 'react';
import { BookOpen, Eye, EyeOff, Play, CheckCircle, RefreshCcw, RotateCcw, Search } from 'lucide-react';
import { useVocab } from '../context/VocabContext';
import { VocabStatus, VocabEntry } from '../types';
import { TestMode } from '../components/TestMode';
import { SwipeableItem } from '../components/UI/SwipeableItem';
import { SearchBar } from '../components/UI/SearchBar';

export const LearningScreen: React.FC = () => {
  const { 
    getEntriesByStatus, 
    toggleReveal, 
    resetAllRevealed, 
    updateEntry,
    recordTestResult 
  } = useVocab();
  
  const words = getEntriesByStatus(VocabStatus.LEARNING);
  const [isTesting, setIsTesting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter Logic
  const filteredWords = words.filter(word => 
    word.slovak.toLowerCase().includes(searchQuery.toLowerCase()) ||
    word.english.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If testing mode is active, show the test component
  if (isTesting) {
    return (
      <TestMode 
        words={words} 
        onComplete={() => setIsTesting(false)} 
        onRecordResult={recordTestResult}
      />
    );
  }

  // Handle move to "Learned"
  const handleMoveToLearned = async (word: VocabEntry) => {
    await updateEntry({
      ...word,
      status: VocabStatus.LEARNED,
      lastReviewed: Date.now()
    });
  };

  // Handle move back to "New" (Reset)
  const handleMoveToNew = async (word: VocabEntry) => {
    await updateEntry({
      ...word,
      status: VocabStatus.NEW,
      isRevealed: false
    });
  }

  // Handle toggle reveal
  const handleToggle = async (word: VocabEntry) => {
    await toggleReveal(word.id);
  };

  return (
    <div className="h-full flex flex-col bg-neutral-950">
      {/* Header Actions */}
      <div className="p-5 space-y-4 z-10">
        <div className="flex space-x-3">
          <button
            onClick={() => setIsTesting(true)}
            disabled={words.length === 0}
            className="flex-1 bg-red-600 disabled:bg-neutral-800 disabled:text-neutral-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-red-900/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Otestovať všetky</span>
          </button>
        </div>
        
        {words.length > 0 && (
          <>
            <button
              onClick={() => resetAllRevealed()}
              className="w-full py-2 text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-red-500 transition-colors flex items-center justify-center space-x-1.5"
            >
              <RefreshCcw className="w-3 h-3" />
              <span>Resetovať odhalené</span>
            </button>
            
            <SearchBar 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Hľadať v učiacich sa..."
            />
          </>
        )}
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {words.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-gray-600">
            <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <BookOpen className="w-8 h-8 text-neutral-700" />
            </div>
            <h2 className="text-xl font-bold text-gray-300 mb-2">Momentálne sa nič neučíte</h2>
            <p className="max-w-xs text-sm text-gray-500">
              Presuňte slovíčka zo zoznamu "Nové" a začnite sa učiť.
            </p>
          </div>
        ) : filteredWords.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-gray-600">
             <Search className="w-8 h-8 mb-2 opacity-50" />
             <p className="text-sm">Žiadne výsledky pre "{searchQuery}"</p>
          </div>
        ) : (
          filteredWords.map((word) => (
            <SwipeableItem
              key={word.id}
              onSwipeLeft={() => handleMoveToNew(word)}
              onSwipeRight={() => handleMoveToLearned(word)}
              swipeLeftColor="bg-yellow-600"
              rightIcon={<CheckCircle className="text-white w-8 h-8" />}
              leftIcon={<RotateCcw className="text-white w-8 h-8" />}
            >
              <div 
                onClick={() => handleToggle(word)}
                className="bg-neutral-900 border border-neutral-800/50 rounded-3xl shadow-sm overflow-hidden active:bg-neutral-800 transition-colors cursor-pointer group"
              >
                <div className="p-5 flex flex-col space-y-3">
                  {/* Top Row: Word and Stats */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xl font-bold text-white block tracking-tight">{word.slovak}</span>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-green-900/30 text-green-500 rounded-full border border-green-900/30">
                          {word.correctCount}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-red-900/30 text-red-500 rounded-full border border-red-900/30">
                          {word.wrongCount}
                        </span>
                      </div>
                    </div>
                    <div className="text-neutral-600 group-hover:text-red-500 transition-colors">
                      {word.isRevealed ? (
                        <EyeOff className="w-6 h-6" />
                      ) : (
                        <Eye className="w-6 h-6" />
                      )}
                    </div>
                  </div>

                  {/* Bottom Row: English Reveal area */}
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${word.isRevealed ? 'max-h-24 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                    <div className="pt-4 border-t border-neutral-800 flex justify-between items-center">
                      <span className="text-red-500 font-bold text-xl">{word.english}</span>
                      <div className="text-xs text-gray-600 font-medium uppercase tracking-wider">
                        Swipe doprava pre naučené →
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwipeableItem>
          ))
        )}
      </div>
    </div>
  );
};