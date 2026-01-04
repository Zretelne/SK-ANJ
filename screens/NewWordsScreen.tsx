import React, { useState, useRef } from 'react';
import { Plus, Trash2, Edit2, ArrowRight, AlertCircle, Save, BookOpen, Search } from 'lucide-react';
import { useVocab } from '../context/VocabContext';
import { VocabStatus, VocabEntry } from '../types';
import { SwipeableItem } from '../components/UI/SwipeableItem';
import { SearchBar } from '../components/UI/SearchBar';

export const NewWordsScreen: React.FC = () => {
  const { addEntry, updateEntry, deleteEntry, getEntriesByStatus, entries } = useVocab();
  
  // Data
  const newWords = getEntriesByStatus(VocabStatus.NEW);
  const learningCount = getEntriesByStatus(VocabStatus.LEARNING).length;

  // Add Form State
  const [slovakInput, setSlovakInput] = useState('');
  const [englishInput, setEnglishInput] = useState('');
  const [formError, setFormError] = useState('');
  const slovakInputRef = useRef<HTMLInputElement>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSlovak, setEditSlovak] = useState('');
  const [editEnglish, setEditEnglish] = useState('');

  // General Error/Success Message
  const [feedbackMsg, setFeedbackMsg] = useState<{type: 'error' | 'success', text: string} | null>(null);

  const clearFeedback = () => setFeedbackMsg(null);

  // Filter Logic
  const filteredWords = newWords.filter(word => 
    word.slovak.toLowerCase().includes(searchQuery.toLowerCase()) ||
    word.english.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    clearFeedback();

    const slovak = slovakInput.trim();
    const english = englishInput.trim();

    if (!slovak || !english) {
      setFormError('Vyplňte obe políčka.');
      return;
    }

    // Duplicate Check
    const isDuplicate = entries.some(
      (entry) => entry.english.toLowerCase().trim() === english.toLowerCase()
    );

    if (isDuplicate) {
      setFormError('Toto slovíčko už máš v zozname.');
      return;
    }

    await addEntry(slovak, english);
    setSlovakInput('');
    setEnglishInput('');
    
    // Focus back on first input
    setTimeout(() => {
        slovakInputRef.current?.focus();
    }, 100);
  };

  const handleMoveToLearning = async (word: VocabEntry) => {
    clearFeedback();
    if (learningCount >= 10) {
      setFeedbackMsg({
        type: 'error',
        text: 'Môžeš sa naraz učiť maximálne 10 slovíčok.'
      });
      return;
    }

    await updateEntry({
      ...word,
      status: VocabStatus.LEARNING,
      lastReviewed: Date.now()
    });
  };

  const handleDelete = async (id: string) => {
    await deleteEntry(id);
  };

  const startEditing = (e: React.MouseEvent, word: VocabEntry) => {
    e.stopPropagation();
    setEditingId(word.id);
    setEditSlovak(word.slovak);
    setEditEnglish(word.english);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditSlovak('');
    setEditEnglish('');
  };

  const saveEdit = async () => {
    if (!editingId) return;
    
    if (!editSlovak.trim() || !editEnglish.trim()) {
      alert('Vyplňte obe políčka.');
      return;
    }

    // Find the original word to preserve other fields
    const originalWord = newWords.find(w => w.id === editingId);
    if (originalWord) {
      await updateEntry({
        ...originalWord,
        slovak: editSlovak.trim(),
        english: editEnglish.trim(),
      });
    }
    cancelEditing();
  };

  return (
    <div className="h-full flex flex-col bg-neutral-950">
      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className={`p-4 text-sm text-center text-white font-medium ${feedbackMsg.type === 'error' ? 'bg-red-600' : 'bg-green-600'} animate-in slide-in-from-top shadow-lg z-50`}>
          {feedbackMsg.text}
          <button onClick={clearFeedback} className="ml-3 underline opacity-80 hover:opacity-100">OK</button>
        </div>
      )}

      {/* Add New Word Form */}
      <div className="p-5 bg-neutral-950 z-10 space-y-5">
        <form onSubmit={handleAdd} className="flex flex-col space-y-4">
          <div className="flex space-x-3">
            <div className="flex-1">
              <input
                ref={slovakInputRef}
                type="text"
                placeholder="Slovensky"
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-2xl focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm text-white placeholder-gray-500 transition-all"
                value={slovakInput}
                onChange={(e) => setSlovakInput(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Anglicky"
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-2xl focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm text-white placeholder-gray-500 transition-all"
                value={englishInput}
                onChange={(e) => setEnglishInput(e.target.value)}
              />
            </div>
          </div>
          {formError && (
            <div className="text-red-500 text-xs flex items-center px-1">
              <AlertCircle className="w-3 h-3 mr-1" />
              {formError}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-red-900/20"
          >
            <Plus className="w-5 h-5" />
            <span>Pridať slovíčko</span>
          </button>
        </form>

        {/* Search Bar - only show if there are words */}
        {newWords.length > 0 && (
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Hľadať v nových slovíčkach..."
          />
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {newWords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-600">
            <p className="text-sm uppercase tracking-widest font-medium">Zoznam je prázdny</p>
          </div>
        ) : filteredWords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-600">
            <Search className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">Žiadne výsledky pre "{searchQuery}"</p>
          </div>
        ) : (
          filteredWords.map((word) => (
            <SwipeableItem
              key={word.id}
              onSwipeLeft={() => handleDelete(word.id)}
              onSwipeRight={() => handleMoveToLearning(word)}
              swipeRightColor="bg-blue-600"
              rightIcon={<BookOpen className="text-white w-8 h-8" />}
              leftIcon={<Trash2 className="text-white w-8 h-8" />}
            >
              <div className="p-4 rounded-3xl border border-neutral-800/50 shadow-sm flex items-center justify-between group hover:border-neutral-700 transition-colors bg-neutral-900/80 backdrop-blur-sm">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="font-bold text-gray-100 truncate text-lg">{word.slovak}</div>
                  <div className="text-gray-500 text-sm truncate">{word.english}</div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    type="button"
                    onClick={(e) => startEditing(e, word)}
                    className="p-2 text-gray-500 hover:text-white hover:bg-neutral-800 rounded-full transition-colors"
                    title="Upraviť"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <div className="w-px h-8 bg-neutral-800 mx-1"></div>
                  {/* Visual hint for swipe */}
                  <div className="text-gray-600">
                    <ArrowRight className="w-4 h-4 opacity-30" />
                  </div>
                </div>
              </div>
            </SwipeableItem>
          ))
        )}
      </div>

      {/* Edit Modal Overlay */}
      {editingId && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-neutral-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-neutral-800 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-6">Upraviť slovíčko</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Slovensky</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-2xl focus:ring-1 focus:ring-red-500 focus:outline-none text-white transition-all"
                  value={editSlovak}
                  onChange={(e) => setEditSlovak(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Anglicky</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-2xl focus:ring-1 focus:ring-red-500 focus:outline-none text-white transition-all"
                  value={editEnglish}
                  onChange={(e) => setEditEnglish(e.target.value)}
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-8">
              <button
                onClick={cancelEditing}
                className="flex-1 py-3.5 bg-neutral-800 text-gray-300 font-bold rounded-2xl hover:bg-neutral-700 transition-colors"
              >
                Zrušiť
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 py-3.5 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-colors flex items-center justify-center shadow-lg shadow-red-900/20"
              >
                <Save className="w-4 h-4 mr-2" />
                Uložiť
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};