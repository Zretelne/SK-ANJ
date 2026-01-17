import React, { useState } from 'react';
import { VocabEntry } from '../types';
import { CheckCircle, XCircle, ArrowRight, Trophy, X } from 'lucide-react';
import { SpeakerButton } from './UI/SpeakerButton';

interface TestModeProps {
  words: VocabEntry[];
  onComplete: () => void;
  onRecordResult: (id: string, isCorrect: boolean) => Promise<void>;
  targetLang?: string;
}

export const TestMode: React.FC<TestModeProps> = ({ words, onComplete, onRecordResult, targetLang = 'en' }) => {
  // Inicializujeme testovací zoznam (queue) iba raz pri prvom načítaní komponentu.
  const [queue] = useState<VocabEntry[]>(() => {
    return [...words].sort(() => Math.random() - 0.5);
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  const [isFinished, setIsFinished] = useState(false);

  // Safety check pre prázdny zoznam
  if (!queue || queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-6 text-gray-500">
        <p>Žiadne slovíčka na testovanie.</p>
        <button onClick={onComplete} className="text-red-500 font-bold underline">Späť</button>
      </div>
    );
  }

  const currentWord = queue[currentIndex];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback !== null) return; 

    const cleanInput = input.trim().toLowerCase();
    const cleanAnswer = currentWord.english.trim().toLowerCase();
    const isCorrect = cleanInput === cleanAnswer;

    setFeedback(isCorrect ? 'correct' : 'wrong');
    
    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1)
    }));

    await onRecordResult(currentWord.id, isCorrect);
  };

  const handleNext = () => {
    setInput('');
    setFeedback(null);
    
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-neutral-950">
        <div className="bg-neutral-900 p-8 rounded-[2rem] shadow-2xl w-full max-w-sm text-center border border-neutral-800">
          <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-12 h-12 text-yellow-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Test dokončený!</h2>
          <p className="text-gray-500 mb-8 font-medium">Tu je tvoj výsledok:</p>
          
          <div className="flex justify-center space-x-4 mb-10">
            <div className="bg-green-500/10 p-4 rounded-3xl w-36 border border-green-500/20">
              <div className="text-4xl font-bold text-green-500">{stats.correct}</div>
              <div className="text-[10px] font-bold text-green-600 uppercase tracking-widest mt-1">Správne</div>
            </div>
            <div className="bg-red-500/10 p-4 rounded-3xl w-36 border border-red-500/20">
              <div className="text-4xl font-bold text-red-500">{stats.wrong}</div>
              <div className="text-[10px] font-bold text-red-600 uppercase tracking-widest mt-1">Nesprávne</div>
            </div>
          </div>

          <button
            onClick={onComplete}
            className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
          >
            Späť na učenie
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 bg-neutral-950">
      {/* Header: Progress Bar & Close Button */}
      <div className="flex items-center justify-between mb-8 space-x-4">
        <div className="flex-1 bg-neutral-900 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-red-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex) / queue.length) * 100}%` }}
          ></div>
        </div>
        <button
          onClick={onComplete}
          className="p-2 -mr-2 text-neutral-500 hover:text-white hover:bg-neutral-900 rounded-full transition-colors"
          title="Ukončiť test"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center max-w-md mx-auto w-full pt-4">
        <div className="mb-3 text-xs text-red-500 font-bold uppercase tracking-widest">
          Slovíčko {currentIndex + 1} z {queue.length}
        </div>
        
        <div className="w-full bg-neutral-900 rounded-[2rem] shadow-sm border border-neutral-800 p-10 text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">{currentWord.slovak}</h1>
          <p className="text-gray-500 text-sm font-medium">Zadajte preklad</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="relative">
            <input
              type="text"
              autoFocus
              disabled={feedback !== null}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Napíšte preklad..."
              className={`w-full p-5 rounded-3xl border-2 outline-none text-xl transition-all font-medium ${
                feedback === null
                  ? 'bg-neutral-900 border-neutral-800 focus:border-red-500 focus:bg-neutral-900 text-white placeholder-gray-600'
                  : feedback === 'correct'
                    ? 'border-green-500 bg-green-500/10 text-green-500'
                    : 'border-red-500 bg-red-500/10 text-red-500'
              }`}
            />
            {feedback === 'correct' && (
              <CheckCircle className="absolute right-5 top-1/2 -translate-y-1/2 text-green-500 w-7 h-7" />
            )}
            {feedback === 'wrong' && (
              <XCircle className="absolute right-5 top-1/2 -translate-y-1/2 text-red-500 w-7 h-7" />
            )}
          </div>

          {feedback === 'wrong' && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-5 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
              <div className="text-left">
                <span className="text-red-400 text-xs font-bold uppercase tracking-wide">Správna odpoveď</span>
                <span className="font-bold text-red-200 text-xl block mt-1">{currentWord.english}</span>
              </div>
              <SpeakerButton text={currentWord.english} lang={targetLang} className="text-red-500 hover:bg-red-900/20" size={24} />
            </div>
          )}

          {feedback === null ? (
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-full py-4 bg-red-600 disabled:bg-neutral-800 disabled:text-neutral-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-red-900/20 transition-all hover:scale-[1.02]"
            >
              Skontrolovať
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center space-x-2 ${
                feedback === 'correct' 
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-900/20'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/20'
              }`}
            >
              <span>Pokračovať</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};