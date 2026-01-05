import React from 'react';
import { AppTab, TabConfig } from '../../types';
import { PlusCircle, BookOpen, CheckCircle } from 'lucide-react';

interface BottomNavProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const TABS: TabConfig[] = [
  { id: AppTab.NEW, label: 'Nové', icon: PlusCircle },
  { id: AppTab.LEARNING, label: 'Učím sa', icon: BookOpen },
  { id: AppTab.LEARNED, label: 'Naučené', icon: CheckCircle },
];

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  return (
    <nav className="bg-neutral-900/90 backdrop-blur-md border-t border-neutral-800 pb-safe pt-1 px-4">
      <div className="flex justify-around items-center h-14">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-label={tab.label}
              className="flex items-center justify-center w-14 h-14 group"
            >
              <div className={`p-3 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' 
                  : 'text-gray-500 hover:bg-neutral-800 hover:text-gray-300'
              }`}>
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-2' : 'stroke-[1.5]'}`} />
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};