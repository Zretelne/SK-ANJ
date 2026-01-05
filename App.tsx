import React, { useState, useEffect } from 'react';
import { AppTab } from './types';
import { BottomNav } from './components/Layout/BottomNav';
import { AppBar } from './components/Layout/AppBar';
import { NewWordsScreen } from './screens/NewWordsScreen';
import { LearningScreen } from './screens/LearningScreen';
import { LearnedScreen } from './screens/LearnedScreen';
import { VocabProvider, useVocab } from './context/VocabContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginScreen } from './screens/LoginScreen';
import { CollectionsModal } from './components/Collections/CollectionsModal';
import { LogOut, User, Flame, Activity, Calendar } from 'lucide-react';
import { ActivityHeatmap } from './components/Stats/ActivityHeatmap';

interface ProfileModalProps {
    onClose: () => void;
    onLoginRequest: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose, onLoginRequest }) => {
    const { user, signOut } = useAuth();
    const { userStats } = useVocab();

    const handleLogout = async () => {
        await signOut();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
           <div className="bg-neutral-900 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl border border-neutral-800 overflow-hidden" onClick={e => e.stopPropagation()}>
              
              {/* Header */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-full flex items-center justify-center mb-3 text-white border border-neutral-700 shadow-inner">
                  {user ? (
                      <span className="text-2xl font-bold">{user.email?.charAt(0).toUpperCase()}</span>
                  ) : (
                      <User className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <h3 className="text-white font-bold text-lg">{user?.email || 'Hosť'}</h3>
                <p className="text-gray-500 text-xs mt-0.5">{user ? 'Prihlásený užívateľ' : 'Lokálny režim'}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-neutral-950/50 p-4 rounded-2xl border border-neutral-800 flex flex-col items-center justify-center">
                      <div className="flex items-center space-x-1.5 text-orange-500 mb-1">
                          <Flame className="w-4 h-4 fill-current" />
                          <span className="text-xs font-bold uppercase tracking-wider">Streak</span>
                      </div>
                      <span className="text-2xl font-bold text-white">{userStats.streak} <span className="text-xs text-gray-500 font-normal">dní</span></span>
                  </div>
                  <div className="bg-neutral-950/50 p-4 rounded-2xl border border-neutral-800 flex flex-col items-center justify-center">
                      <div className="flex items-center space-x-1.5 text-blue-500 mb-1">
                          <Activity className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">Aktivita</span>
                      </div>
                      <span className="text-2xl font-bold text-white">{userStats.totalActions}</span>
                  </div>
              </div>

              {/* Heatmap Section */}
              <div className="bg-neutral-950/50 p-4 rounded-2xl border border-neutral-800 mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">História aktivity</span>
                  </div>
                  <ActivityHeatmap stats={userStats} />
              </div>
              
              {/* Logout */}
              {user ? (
                <button 
                    onClick={handleLogout}
                    className="w-full py-3.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl flex items-center justify-center space-x-2 transition-colors font-medium text-sm"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Odhlásiť sa</span>
                </button>
              ) : (
                  <button 
                    onClick={onLoginRequest}
                    className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm"
                  >
                      Prihlásiť sa pre zálohu
                  </button>
              )}
           </div>
        </div>
    );
};

const MainLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<AppTab>(AppTab.NEW);
  const [showLogin, setShowLogin] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  
  const { user } = useAuth();

  // Detect keyboard (input focus)
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusOut = () => {
      // Small timeout to check if focus moved to another input or cleared completely
      setTimeout(() => {
        const active = document.activeElement as HTMLElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
          return;
        }
        setIsKeyboardOpen(false);
      }, 50);
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  // Helper to determine title based on tab
  const getTitle = (tab: AppTab): string => {
    switch (tab) {
      case AppTab.NEW:
        return 'Nové';
      case AppTab.LEARNING:
        return 'Učím sa';
      case AppTab.LEARNED:
        return 'Naučené';
      default:
        return 'Slovník';
    }
  };

  // Helper to render current screen
  const renderScreen = () => {
    switch (currentTab) {
      case AppTab.NEW:
        return <NewWordsScreen />;
      case AppTab.LEARNING:
        return <LearningScreen />;
      case AppTab.LEARNED:
        return <LearnedScreen />;
      default:
        return <NewWordsScreen />;
    }
  };

  const handleProfileClick = () => {
    setShowProfileMenu(true);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950">
      {/* Top App Bar */}
      <AppBar 
        title={getTitle(currentTab)} 
        onProfileClick={handleProfileClick} 
        onCollectionClick={() => setShowCollections(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative w-full max-w-md mx-auto bg-neutral-950 min-h-0">
        {renderScreen()}
      </main>

      {/* Bottom Navigation - Hidden when keyboard is open */}
      {!isKeyboardOpen && (
        <div className="w-full max-w-md mx-auto bg-neutral-950 animate-in slide-in-from-bottom-5 duration-200">
          <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
        </div>
      )}

      {/* Overlays */}
      {showLogin && (
        <LoginScreen onClose={() => setShowLogin(false)} />
      )}

      {showCollections && (
        <CollectionsModal onClose={() => setShowCollections(false)} />
      )}

      {/* Profile Menu Overlay */}
      {showProfileMenu && (
        <ProfileModal 
            onClose={() => setShowProfileMenu(false)}
            onLoginRequest={() => {
                setShowProfileMenu(false);
                setShowLogin(true);
            }} 
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <VocabProvider>
        <MainLayout />
      </VocabProvider>
    </AuthProvider>
  );
};

export default App;