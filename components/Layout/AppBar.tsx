import React from 'react';
import { User as UserIcon, ChevronDown, Layers, Flame } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useVocab } from '../../context/VocabContext';

interface AppBarProps {
  title: string;
  onProfileClick: () => void;
  onCollectionClick: () => void;
}

export const AppBar: React.FC<AppBarProps> = ({ title, onProfileClick, onCollectionClick }) => {
  const { user } = useAuth();
  const { activeCollection, userStats } = useVocab();

  return (
    <header className="bg-neutral-950 text-white z-10 sticky top-0 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between relative">
        
        {/* Left Side: Collection Switcher */}
        <button 
          onClick={onCollectionClick}
          className="flex items-center space-x-2 group active:opacity-70 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center group-hover:border-neutral-700 transition-colors">
             <Layers className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex flex-col items-start">
             <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none mb-0.5">{title}</span>
             <div className="flex items-center space-x-1">
               <h1 className="text-sm font-bold tracking-wide font-sans text-gray-100 max-w-[120px] truncate">
                 {activeCollection ? activeCollection.name : 'Načítavam...'}
               </h1>
               <ChevronDown className="w-3 h-3 text-gray-500" />
             </div>
          </div>
        </button>
        
        {/* Right Side: Stats & Profile */}
        <div className="flex items-center space-x-3">
            
            {/* Streak Indicator */}
            {userStats.streak > 0 && (
                <div className="flex items-center space-x-1 bg-red-900/10 px-2 py-1 rounded-full border border-red-900/30">
                    <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 animate-pulse" />
                    <span className="text-xs font-bold text-orange-400">{userStats.streak}</span>
                </div>
            )}

            {/* Profile Button */}
            <button 
            onClick={onProfileClick}
            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                user 
                ? 'bg-neutral-800 border-neutral-700 text-gray-200' 
                : 'bg-neutral-800 border-neutral-700 text-gray-400 hover:bg-neutral-700'
            }`}
            title={user ? user.email || 'Profil' : 'Prihlásiť sa'}
            >
                {user ? (
                <span className="text-[10px] font-bold">{user.email?.charAt(0).toUpperCase()}</span>
                ) : (
                <UserIcon className="w-3.5 h-3.5" />
                )}
            </button>
        </div>
      </div>
    </header>
  );
};