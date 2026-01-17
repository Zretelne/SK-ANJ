import React, { useState } from 'react';
import { useVocab } from '../context/VocabContext';
import { ArrowRight, Book, Globe } from 'lucide-react';

export const SetupScreen: React.FC = () => {
  const { createCollection } = useVocab();
  const [name, setName] = useState('');
  const [selectedLang, setSelectedLang] = useState('en');
  const [loading, setLoading] = useState(false);

  const presets = [
    { label: 'Angličtina', code: 'en', flag: 'EN', val: 'Angličtina' },
    { label: 'Nemčina', code: 'de', flag: 'DE', val: 'Nemčina' },
    { label: 'Španielčina', code: 'es', flag: 'ES', val: 'Španielčina' },
  ];

  const handlePresetClick = (preset: typeof presets[0]) => {
      setName(preset.val);
      setSelectedLang(preset.code);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    // Artificial delay for better UX feel
    await new Promise(r => setTimeout(r, 600));
    // Default to 'en' if manually typed without selecting preset, unless logic added later
    await createCollection(name.trim(), selectedLang);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 px-6 py-10">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        
        <div className="mb-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-900 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-red-900/30">
                <Book className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Vytvorte si prvý slovník</h1>
            <p className="text-gray-400">
                Vyberte si jazyk, ktorý sa chcete učiť, alebo si pomenujte vlastný slovník.
            </p>
        </div>

        {/* Presets */}
        <div className="grid grid-cols-3 gap-3 mb-8">
            {presets.map((preset) => (
                <button
                    key={preset.code}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 ${
                        name === preset.val 
                            ? 'bg-red-900/20 border-red-500 text-white' 
                            : 'bg-neutral-900 border-neutral-800 text-gray-400 hover:border-neutral-600 hover:bg-neutral-800'
                    }`}
                >
                    <span className="text-2xl font-black opacity-80">{preset.flag}</span>
                    <span className="text-xs font-bold">{preset.label}</span>
                </button>
            ))}
        </div>

        {/* Manual Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1 mb-2 block">
                    Názov slovníka
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Globe className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Napr. Taliančina - Frázy"
                        className="w-full pl-11 pr-4 py-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={!name.trim() || loading}
                className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg shadow-red-900/20 transition-all flex items-center justify-center space-x-2 active:scale-[0.98] mt-6"
            >
                {loading ? (
                    <span>Vytváram...</span>
                ) : (
                    <>
                        <span>Začať sa učiť</span>
                        <ArrowRight className="w-5 h-5" />
                    </>
                )}
            </button>
        </form>

      </div>
    </div>
  );
};