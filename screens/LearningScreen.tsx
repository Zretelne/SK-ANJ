import React, { useState } from 'react';
import { BookOpen, Play, CheckCircle, RefreshCcw, RotateCcw, Search, Eye, EyeOff } from 'lucide-react';
import { useVocab } from '../context/VocabContext';
import { VocabStatus, VocabEntry } from '../types';
import { TestMode } from '../components/TestMode';
import { SwipeableItem } from '../components/UI/SwipeableItem';
import { SearchBar } from '../components/UI/SearchBar';
import { SpeakerButton } from '../components/UI/SpeakerButton';

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
      <div className="p-4 space-y-3 z-10">
        <div className="flex space-x-3">
          <button
            onClick={() => setIsTesting(true)}
            disabled={words.length === 0}
            className="flex-1 bg-red-600 disabled:bg-neutral-800 disabled:text-neutral-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-900/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 text-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Otestovať všetky</span>
          </button>
        </div>
        
        {words.length > 0 && (
          <>
            <button
              onClick={() => resetAllRevealed()}
              className="w-full py-1 text-[10px] font-medium uppercase tracking-wider text-gray-500 hover:text-red-500 transition-colors flex items-center justify-center space-x-1"
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
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {words.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-gray-600">
            <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <BookOpen className="w-6 h-6 text-neutral-700" />
            </div>
            <h2 className="text-lg font-bold text-gray-300 mb-1">Momentálne sa nič neučíte</h2>
            <p className="max-w-xs text-xs text-gray-500">
              Presuňte slovíčka zo zoznamu "Nové" a začnite sa učiť.
            </p>
          </div>
        ) : filteredWords.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-gray-600">
             <Search className="w-6 h-6 mb-2 opacity-50" />
             <p className="text-xs">Žiadne výsledky pre "{searchQuery}"</p>
          </div>
        ) : (
          filteredWords.map((word) => (
            <SwipeableItem
              key={word.id}
              onSwipeLeft={() => handleMoveToNew(word)}
              onSwipeRight={() => handleMoveToLearned(word)}
              swipeLeftColor="bg-yellow-600"
              rightIcon={<CheckCircle className="text-white w-6 h-6" />}
              leftIcon={<RotateCcw className="text-white w-6 h-6" />}
            >
              <div 
                onClick={() => handleToggle(word)}
                className="bg-neutral-900 border border-neutral-800/50 rounded-xl shadow-sm overflow-hidden active:bg-neutral-800 transition-colors cursor-pointer group"
              >
                <div className="p-3 flex items-center min-h-[4rem]">
                  
                  {/* Left Column: Slovak */}
                  <div className="w-[45%] shrink-0 pr-3 border-r border-neutral-800 flex flex-col justify-center">
                    <span className="text-base font-bold text-white block truncate">{word.slovak}</span>
                  </div>

                  {/* Right Column Container: English + Stats */}
                  <div className="flex-1 pl-3 flex items-center justify-between min-w-0">
                    
                    {/* English Word (Middle) */}
                    <div className="flex-1 min-w-0 mr-2">
                      {word.isRevealed ? (
                        <div className="flex items-center justify-between animate-in fade-in duration-300">
                          <span className="text-red-500 font-bold text-base truncate block">
                            {word.english}
                          </span>
                          <SpeakerButton text={word.english} size={18} className="text-red-500/80 hover:text-red-500 ml-2 shrink-0" />
                        </div>
                      ) : (
                        <div className="flex items-center text-neutral-700 w-full select-none">
                          <div className="flex-1 filter blur-sm truncate opacity-50 block">
                             {word.english}
                          </div>
                          <Eye className="w-4 h-4 ml-2 opacity-50 flex-shrink-0" />
                        </div>
                      )}
                    </div>

                    {/* Stats Column (Right Edge) */}
                    <div className="flex flex-col space-y-1 shrink-0 ml-1">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-green-900/30 text-green-500 rounded-md border border-green-900/30 text-center min-w-[24px]">
                        {word.correctCount}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-red-900/30 text-red-500 rounded-md border border-red-900/30 text-center min-w-[24px]">
                        {word.wrongCount}
                      </span>
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