import React, { useState } from 'react';
import { CheckCircle, Trash2, AlertTriangle, Play, BookOpen, Search } from 'lucide-react';
import { useVocab } from '../context/VocabContext';
import { VocabStatus, VocabEntry } from '../types';
import { TestMode } from '../components/TestMode';
import { SwipeableItem } from '../components/UI/SwipeableItem';
import { SearchBar } from '../components/UI/SearchBar';

export const LearnedScreen: React.FC = () => {
  const { getEntriesByStatus, deleteEntry, updateEntry, recordTestResult } = useVocab();
  const words = getEntriesByStatus(VocabStatus.LEARNED);
  
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
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-neutral-950">
      {/* Header Actions */}
      <div className="p-5 z-10 space-y-4">
        <button
          onClick={handleStartTest}
          disabled={words.length === 0}
          className="w-full bg-red-600 disabled:bg-neutral-800 disabled:text-neutral-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-red-900/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
        >
          <Play className="w-5 h-5 fill-current" />
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

      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {words.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-600">
            <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <CheckCircle className="w-8 h-8 text-green-700/50" />
            </div>
            <h2 className="text-xl font-bold text-gray-300 mb-2">Zatiaľ žiadne naučené slová</h2>
            <p className="max-w-xs text-gray-500 text-sm">
              Pokračujte v tréningu, výsledky sa dostavia!
            </p>
          </div>
        ) : filteredWords.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-gray-600">
             <Search className="w-8 h-8 mb-2 opacity-50" />
             <p className="text-sm">Žiadne výsledky pre "{searchQuery}"</p>
          </div>
        ) : (
          <div className="pb-20">
            {filteredWords.map((word) => (
              <SwipeableItem
                key={word.id}
                onSwipeLeft={() => handleDeleteSwipe(word.id)}
                onSwipeRight={() => handleMoveBackToLearning(word)}
                swipeRightColor="bg-blue-600"
                rightIcon={<BookOpen className="text-white w-8 h-8" />}
                leftIcon={<Trash2 className="text-white w-8 h-8" />}
              >
                <div className="bg-neutral-900 border border-neutral-800/50 p-4 rounded-2xl shadow-sm flex justify-between items-center group hover:border-neutral-700 transition-colors">
                  <div className="flex-1 min-w-0 pr-3 opacity-60 group-hover:opacity-100 transition-opacity">
                    <p className="font-bold text-gray-300 line-through decoration-red-600/50 truncate decoration-2">{word.slovak}</p>
                    <p className="text-sm text-gray-600 truncate">{word.english}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="w-px h-6 bg-neutral-800"></div>
                    <BookOpen className="w-4 h-4 text-gray-700" />
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
          <div className="bg-neutral-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-neutral-800 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-white">Odstrániť slovíčko?</h3>
              <p className="text-gray-500 text-sm mt-2">
                Naozaj chcete natrvalo odstrániť toto naučené slovíčko? Táto akcia sa nedá vrátiť späť.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={cancelDelete}
                className="flex-1 py-3.5 bg-neutral-800 text-gray-300 font-bold rounded-2xl hover:bg-neutral-700 transition-colors"
              >
                Zrušiť
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3.5 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-colors"
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