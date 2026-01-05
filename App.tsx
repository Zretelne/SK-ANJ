import React, { useState, useEffect } from 'react';
import { AppTab } from './types';
import { BottomNav } from './components/Layout/BottomNav';
import { AppBar } from './components/Layout/AppBar';
import { NewWordsScreen } from './screens/NewWordsScreen';
import { LearningScreen } from './screens/LearningScreen';
import { LearnedScreen } from './screens/LearnedScreen';
import { VocabProvider } from './context/VocabContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginScreen } from './screens/LoginScreen';
import { LogOut, User } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<AppTab>(AppTab.NEW);
  const [showLogin, setShowLogin] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  
  const { user, signOut } = useAuth();

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
    if (user) {
      setShowProfileMenu(true);
    } else {
      setShowLogin(true);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setShowProfileMenu(false);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950">
      {/* Top App Bar */}
      <AppBar title={getTitle(currentTab)} onProfileClick={handleProfileClick} />

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

      {/* Login Overlay */}
      {showLogin && (
        <LoginScreen onClose={() => setShowLogin(false)} />
      )}

      {/* Profile Menu Overlay (Simple) */}
      {showProfileMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm" onClick={() => setShowProfileMenu(false)}>
           <div className="bg-neutral-900 rounded-3xl p-6 w-full max-w-xs shadow-2xl border border-neutral-800" onClick={e => e.stopPropagation()}>
              <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mb-3 text-red-500 border border-red-900/30">
                  <User className="w-8 h-8" />
                </div>
                <h3 className="text-white font-bold">{user?.email}</h3>
                <p className="text-gray-500 text-xs mt-1">Prihlásený užívateľ</p>
              </div>
              
              <button 
                onClick={handleLogout}
                className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-2xl flex items-center justify-center space-x-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Odhlásiť sa</span>
              </button>
           </div>
        </div>
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