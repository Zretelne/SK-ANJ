import React from 'react';
import { User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AppBarProps {
  title: string;
  onProfileClick: () => void;
}

export const AppBar: React.FC<AppBarProps> = ({ title, onProfileClick }) => {
  const { user } = useAuth();

  return (
    <header className="bg-neutral-950 text-white z-10 sticky top-0 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between relative">
        <div className="flex items-center space-x-2">
          {/* Logo imitation */}
          <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
          <h1 className="text-lg font-bold tracking-wide font-sans">{title}</h1>
        </div>
        
        <button 
          onClick={onProfileClick}
          className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
            user 
              ? 'bg-red-900/20 border-red-900/50 text-red-500' 
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
    </header>
  );
};