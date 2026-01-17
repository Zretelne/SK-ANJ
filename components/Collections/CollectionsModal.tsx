import React, { useState } from 'react';
import { X, Plus, Check, Trash2, Globe } from 'lucide-react';
import { useVocab } from '../../context/VocabContext';

interface CollectionsModalProps {
  onClose: () => void;
}

export const CollectionsModal: React.FC<CollectionsModalProps> = ({ onClose }) => {
  const { collections, activeCollection, setActiveCollectionId, createCollection, deleteCollection } = useVocab();
  const [isCreating, setIsCreating] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColLang, setNewColLang] = useState('en');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    
    await createCollection(newColName.trim(), newColLang);
    setNewColName('');
    setNewColLang('en');
    setIsCreating(false);
    onClose();
  };

  const handleSelect = (id: string) => {
    setActiveCollectionId(id);
    onClose();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (deleteConfirmId === id) {
        await deleteCollection(id);
        setDeleteConfirmId(null);
    } else {
        setDeleteConfirmId(id);
        // Reset confirmation after 3 seconds
        setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  const langs = [
    { code: 'en', label: 'EN Angličtina' },
    { code: 'de', label: 'DE Nemčina' },
    { code: 'es', label: 'ES Španielčina' },
    { code: 'fr', label: 'FR Francúzština' },
    { code: 'it', label: 'IT Taliančina' },
    { code: 'ru', label: 'RU Ruština' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral-950 animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950 sticky top-0 z-10">
        <h2 className="text-xl font-bold text-white flex items-center">
            <Globe className="w-5 h-5 mr-2 text-red-600" />
            Vaše slovníky
        </h2>
        <button 
            onClick={onClose} 
            className="p-2 bg-neutral-900 rounded-full text-gray-400 hover:text-white transition-colors"
        >
            <X className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* List */}
        <div className="grid gap-3">
            {collections.map(col => {
                const isActive = activeCollection?.id === col.id;
                const isConfirmingDelete = deleteConfirmId === col.id;

                return (
                    <div 
                        key={col.id}
                        onClick={() => handleSelect(col.id)}
                        className={`group relative p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isActive 
                                ? 'bg-red-900/10 border-red-900/50 shadow-[0_0_15px_-3px_rgba(220,38,38,0.2)]' 
                                : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                        }`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${isActive ? 'bg-red-600 text-white' : 'bg-neutral-800 text-gray-400'}`}>
                                {col.targetLang?.toUpperCase() || 'EN'}
                            </div>
                            <div>
                                <h3 className={`font-bold text-lg ${isActive ? 'text-white' : 'text-gray-300'}`}>
                                    {col.name}
                                </h3>
                                <p className="text-xs text-gray-600">
                                    Vytvorené {new Date(col.createdAt).toLocaleDateString('sk-SK')}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center">
                            {isActive && <Check className="w-5 h-5 text-red-500 mr-4" />}
                            
                            {/* Can't delete the last remaining collection */}
                            {collections.length > 1 && (
                                <button
                                    onClick={(e) => handleDelete(e, col.id)}
                                    className={`p-2 rounded-xl transition-all ${
                                        isConfirmingDelete 
                                            ? 'bg-red-600 text-white w-24 text-xs font-bold' 
                                            : 'text-gray-600 hover:bg-neutral-800 hover:text-red-500'
                                    }`}
                                >
                                    {isConfirmingDelete ? 'Potvrdiť' : <Trash2 className="w-4 h-4" />}
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Add New Button (or Form) */}
        {!isCreating ? (
            <button
                onClick={() => setIsCreating(true)}
                className="w-full py-4 border-2 border-dashed border-neutral-800 rounded-2xl text-gray-500 font-bold hover:border-neutral-700 hover:text-gray-300 transition-all flex items-center justify-center space-x-2 mt-4"
            >
                <Plus className="w-5 h-5" />
                <span>Vytvoriť nový slovník</span>
            </button>
        ) : (
            <div className="bg-neutral-900 p-5 rounded-2xl border border-neutral-800 mt-4 animate-in fade-in zoom-in-95">
                <h3 className="text-white font-bold mb-3">Nový slovník</h3>
                <form onSubmit={handleCreate}>
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
                        {langs.map(l => (
                            <button
                                key={l.code}
                                type="button"
                                onClick={() => setNewColLang(l.code)}
                                className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors whitespace-nowrap ${
                                    newColLang === l.code 
                                    ? 'bg-red-600 text-white border-red-500' 
                                    : 'bg-neutral-950 text-gray-400 border-neutral-800 hover:bg-neutral-800'
                                }`}
                            >
                                {l.label}
                            </button>
                        ))}
                    </div>
                    <input
                        autoFocus
                        type="text"
                        placeholder="Názov (napr. Francúzština - Základy)"
                        className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-red-500 mb-3"
                        value={newColName}
                        onChange={(e) => setNewColName(e.target.value)}
                    />
                    <div className="flex space-x-3">
                        <button 
                            type="button"
                            onClick={() => setIsCreating(false)}
                            className="flex-1 py-3 bg-neutral-800 text-gray-400 font-bold rounded-xl"
                        >
                            Zrušiť
                        </button>
                        <button 
                            type="submit"
                            disabled={!newColName.trim()}
                            className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Vytvoriť
                        </button>
                    </div>
                </form>
            </div>
        )}

      </div>
    </div>
  );
};