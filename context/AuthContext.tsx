import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth'; // Importing type only

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInLocal: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // DÔLEŽITÉ: Default loading musí byť false, alebo sa musí okamžite prepnúť, 
  // inak ostane "čierna obrazovka" (aplikácia čaká na auth).
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if we have a "fake" user stored in LS to persist login across reloads
    const localUser = localStorage.getItem('slovnik_local_user');
    if (localUser) {
        setUser(JSON.parse(localUser));
    }
    setLoading(false);
  }, []);

  const signInLocal = async () => {
    // Vytvoríme "mock" užívateľa
    const mockUser: any = {
        uid: 'local-user-id',
        email: 'local@user.sk',
        displayName: 'Lokálny Užívateľ',
        emailVerified: true,
        isAnonymous: false,
        metadata: {},
        providerData: [],
        refreshToken: '',
        tenantId: null,
        delete: async () => {},
        getIdToken: async () => '',
        getIdTokenResult: async () => ({} as any),
        reload: async () => {},
        toJSON: () => ({}),
    };
    
    setUser(mockUser);
    localStorage.setItem('slovnik_local_user', JSON.stringify(mockUser));
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('slovnik_local_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInLocal, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};