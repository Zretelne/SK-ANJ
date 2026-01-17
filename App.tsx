import React, { useState, useEffect, ErrorInfo, ReactNode, Component } from 'react';
import { AppTab } from './types';
import { BottomNav } from './components/Layout/BottomNav';
import { AppBar } from './components/Layout/AppBar';
import { NewWordsScreen } from './screens/NewWordsScreen';
import { LearningScreen } from './screens/LearningScreen';
import { LearnedScreen } from './screens/LearnedScreen';
import { SetupScreen } from './screens/SetupScreen';
import { VocabProvider, useVocab } from './context/VocabContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginScreen } from './screens/LoginScreen';
import { CollectionsModal } from './components/Collections/CollectionsModal';
import { LogOut, User, Flame, Activity, Calendar, Loader2, AlertTriangle } from 'lucide-react';
import { ActivityHeatmap } from './components/Stats/ActivityHeatmap';

// --- Error Boundary Component ---
interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-neutral-950 text-white">
          <AlertTriangle className="w-12 h-12 text-red-600 mb-4" />
          <h2 className="text-xl font-bold mb-2">Nastala chyba</h2>
          <pre className="text-xs text-gray-500 bg-neutral-900 p-4 rounded-lg overflow-auto max-w-full text-left mb-4">
            {this.state.error?.message}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold"
          >
            Reštartovať aplikáciu
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

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
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  
  const { user, loading: authLoading } = useAuth();
  const { isLoading: vocabLoading, collections } = useVocab();

  // Detect keyboard (input focus)
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusOut = () => {
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

  // Show loading screen
  if (authLoading || vocabLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-neutral-950 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-red-600 mb-4" />
        <p className="text-gray-500 text-sm font-medium">Načítavam dáta...</p>
      </div>
    );
  }

  // --- 1. Step: Login / Welcome ---
  if (!user) {
    return <LoginScreen />;
  }

  // --- 2. Step: Onboarding / Create First Dictionary ---
  if (collections.length === 0) {
    return <SetupScreen />;
  }

  // --- 3. Step: Main Application ---
  
  // Helper to determine title based on tab
  const getTitle = (tab: AppTab): string => {
    switch (tab) {
      case AppTab.NEW: return 'Nové';
      case AppTab.LEARNING: return 'Učím sa';
      case AppTab.LEARNED: return 'Naučené';
      default: return 'Slovník';
    }
  };

  const renderScreen = () => {
    switch (currentTab) {
      case AppTab.NEW: return <NewWordsScreen />;
      case AppTab.LEARNING: return <LearningScreen />;
      case AppTab.LEARNED: return <LearnedScreen />;
      default: return <NewWordsScreen />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950">
      <AppBar 
        title={getTitle(currentTab)} 
        onProfileClick={() => setShowProfileMenu(true)} 
        onCollectionClick={() => setShowCollections(true)}
      />

      <main className="flex-1 overflow-y-auto overflow-x-hidden relative w-full max-w-md mx-auto bg-neutral-950 min-h-0">
        <ErrorBoundary>
          {renderScreen()}
        </ErrorBoundary>
      </main>

      {!isKeyboardOpen && (
        <div className="w-full max-w-md mx-auto bg-neutral-950 animate-in slide-in-from-bottom-5 duration-200">
          <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
        </div>
      )}

      {showCollections && <CollectionsModal onClose={() => setShowCollections(false)} />}
      
      {showProfileMenu && (
        <ProfileModal 
            onClose={() => setShowProfileMenu(false)}
            onLoginRequest={() => {
                // In a real app this might trigger a dedicated cloud login
                // For now, user is already 'locally' logged in if they see this.
                setShowProfileMenu(false);
            }} 
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <VocabProvider>
          <MainLayout />
        </VocabProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;