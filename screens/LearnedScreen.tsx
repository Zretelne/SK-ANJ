import React, { useState } from 'react';
import { CheckCircle, Trash2, AlertTriangle, Play, BookOpen, Search } from 'lucide-react';
import { useVocab } from '../context/VocabContext';
import { VocabStatus, VocabEntry } from '../types';
import { TestMode } from '../components/TestMode';
import { SwipeableItem } from '../components/UI/SwipeableItem';
import { SearchBar } from '../components/UI/SearchBar';
import { SpeakerButton } from '../components/UI/SpeakerButton';

export const LearnedScreen: React.FC = () => {
  const { getEntriesByStatus, deleteEntry, updateEntry, recordTestResult, activeCollection } = useVocab();
  const words = getEntriesByStatus(VocabStatus.LEARNED);
  const targetLang = activeCollection?.targetLang || 'en';
  
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testWords, setTestWords] = useState<VocabEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter Logic
  const filteredWords = words.filter(word => 
    word.slovak.toLowerCase().includes(searchQuery.toLowerCase()) ||
    word.english.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteSwipe = (id: string) => {
    setDeletingId(id);
  };

  const handleMoveBackToLearning = async (word: VocabEntry) => {
    await updateEntry({
        ...word,
        status: VocabStatus.LEARNING
    });
  };

  const confirmDelete = async () => {
    if (deletingId) {
      await deleteEntry(deletingId);
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  const handleStartTest = () => {
    // Shuffle and pick up to 10 words
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 10);
    setTestWords(selected);
    setIsTesting(true);
  };

  if (isTesting) {
    return (
      <TestMode
        words={testWords}
        onComplete={() => setIsTesting(false)}
        onRecordResult={recordTestResult}
        targetLang={targetLang}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-neutral-950">
      {/* Header Actions */}
      <div className="p-4 z-10 space-y-3">
        <button
          onClick={handleStartTest}
          disabled={words.length === 0}
          className="w-full bg-red-600 disabled:bg-neutral-800 disabled:text-neutral-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-900/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 text-sm"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>
            {words.length > 0 
              ? `Otestovať ${Math.min(10, words.length)} náhodných` 
              : 'Otestovať'}
          </span>
        </button>

        {words.length > 0 && (
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Hľadať v naučených..."
          />
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {words.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-600">
            <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <CheckCircle className="w-6 h-6 text-green-700/50" />
            </div>
            <h2 className="text-lg font-bold text-gray-300 mb-1">Zatiaľ žiadne naučené slová</h2>
            <p className="max-w-xs text-gray-500 text-xs">
              Pokračujte v tréningu, výsledky sa dostavia!
            </p>
          </div>
        ) : filteredWords.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-gray-600">
             <Search className="w-6 h-6 mb-2 opacity-50" />
             <p className="text-xs">Žiadne výsledky pre "{searchQuery}"</p>
          </div>
        ) : (
          <div className="pb-20">
            {filteredWords.map((word) => (
              <SwipeableItem
                key={word.id}
                onSwipeLeft={() => handleDeleteSwipe(word.id)}
                onSwipeRight={() => handleMoveBackToLearning(word)}
                swipeRightColor="bg-blue-600"
                rightIcon={<BookOpen className="text-white w-6 h-6" />}
                leftIcon={<Trash2 className="text-white w-6 h-6" />}
              >
                <div className="bg-neutral-900 border border-neutral-800/50 p-3 rounded-xl shadow-sm flex group hover:border-neutral-700 transition-colors">
                  
                  <div className="flex-1 flex min-w-0">
                    {/* Left Column: Slovak + Sentence */}
                    <div className="w-[45%] shrink-0 pr-3 border-r border-neutral-800 flex flex-col justify-center">
                        <p className="font-semibold text-gray-300 line-through decoration-red-600/50 decoration-2 text-base break-words leading-tight">
                            {word.slovak}
                        </p>
                        {word.sentenceFront && (
                            <p className="text-[10px] text-gray-600 italic mt-1 leading-snug break-words">
                                {word.sentenceFront}
                            </p>
                        )}
                    </div>

                    {/* Right Column: English + Sentence */}
                    <div className="flex-1 min-w-0 pl-3 flex flex-col justify-center">
                         <div className="flex items-start justify-between">
                            <p className="text-gray-400 text-sm flex-1 break-words leading-tight">{word.english}</p>
                            <SpeakerButton text={word.english} lang={targetLang} size={14} className="text-gray-600 hover:text-white ml-2 mt-[-2px]" />
                         </div>
                         {word.sentence && (
                            <p className="text-[10px] text-gray-600 italic mt-1 leading-snug break-words">
                                {word.sentence}
                            </p>
                        )}
                    </div>
                  </div>

                  {/* Icon Right */}
                  <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-neutral-800 shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>

                </div>
              </SwipeableItem>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-neutral-900 rounded-2xl w-full max-w-sm p-5 shadow-2xl border border-neutral-800 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-12 h-12 bg-red-900/20 rounded-full flex items-center justify-center mb-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-white">Odstrániť slovíčko?</h3>
              <p className="text-gray-500 text-xs mt-1">
                Naozaj chcete natrvalo odstrániť toto naučené slovíčko? Táto akcia sa nedá vrátiť späť.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={cancelDelete}
                className="flex-1 py-3 bg-neutral-800 text-gray-300 font-bold text-sm rounded-xl hover:bg-neutral-700 transition-colors"
              >
                Zrušiť
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-600 text-white font-bold text-sm rounded-xl hover:bg-red-700 transition-colors"
              >
                Odstrániť
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};