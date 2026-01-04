import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LogIn, UserPlus, AlertCircle, X } from 'lucide-react';

interface LoginScreenProps {
  onClose: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!auth) {
        setError('Firebase nie je nakonfigurovaný. Skontrolujte lib/firebase.ts');
        setLoading(false);
        return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Nesprávny email alebo heslo.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Tento email sa už používa.');
      } else if (err.code === 'auth/weak-password') {
        setError('Heslo je príliš slabé (min. 6 znakov).');
      } else {
        setError('Nastala chyba: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm animate-in fade-in">
      <div className="bg-neutral-900 w-full max-w-sm p-8 rounded-3xl border border-neutral-800 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            {isLogin ? 'Vitajte späť' : 'Vytvoriť účet'}
          </h2>
          <p className="text-gray-500 text-sm">
            {isLogin ? 'Prihláste sa pre synchronizáciu slovíčok' : 'Začnite si ukladať slovíčka do cloudu'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-2xl focus:ring-1 focus:ring-red-500 focus:outline-none text-white transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Heslo</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-2xl focus:ring-1 focus:ring-red-500 focus:outline-none text-white transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-500 text-xs bg-red-900/20 p-3 rounded-xl border border-red-900/30">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-neutral-800 disabled:text-gray-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-900/20 flex items-center justify-center space-x-2"
          >
            {loading ? (
               <span>Pracujem...</span>
            ) : (
                <>
                    {isLogin ? <LogIn className="w-5 h-5"/> : <UserPlus className="w-5 h-5"/>}
                    <span>{isLogin ? 'Prihlásiť sa' : 'Registrovať sa'}</span>
                </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setError(''); setIsLogin(!isLogin); }}
            className="text-sm text-gray-400 hover:text-white underline decoration-neutral-700 underline-offset-4"
          >
            {isLogin ? 'Nemáte ešte účet? Registrujte sa' : 'Už máte účet? Prihláste sa'}
          </button>
        </div>
      </div>
    </div>
  );
};
