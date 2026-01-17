import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Smartphone, Globe, ShieldCheck } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { signInLocal } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLocalLogin = async () => {
    setError('');
    setLoading(true);

    try {
      // Simulate network delay for effect
      await new Promise(resolve => setTimeout(resolve, 800));
      await signInLocal();
    } catch (err: any) {
      setError('Nepodarilo sa prihlásiť.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 bg-neutral-950 relative overflow-hidden">
        
        {/* Background Accents */}
        <div className="absolute top-[-20%] left-[-10%] w-[300px] h-[300px] bg-red-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[250px] h-[250px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-sm z-10 flex flex-col justify-between h-full max-h-[600px]">
            
            <div className="flex-1 flex flex-col justify-center items-center text-center">
                <div className="w-24 h-24 bg-neutral-900 rounded-[2rem] border border-neutral-800 flex items-center justify-center mb-8 shadow-2xl">
                    <span className="text-4xl font-black text-white">1%</span>
                </div>
                
                <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
                    Zlepšite sa <br />
                    <span className="text-red-600">každý deň</span>
                </h1>
                
                <p className="text-gray-400 text-lg leading-relaxed max-w-xs mx-auto">
                    Jednoduchý a efektívny spôsob, ako si budovať slovnú zásobu v cudzom jazyku.
                </p>
            </div>

            <div className="space-y-4 w-full mt-10">
                {error && (
                    <div className="flex items-center space-x-2 text-red-500 text-xs bg-red-900/20 p-3 rounded-xl border border-red-900/30">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 mb-6 space-y-3">
                    <div className="flex items-center space-x-3 text-sm text-gray-400">
                        <Globe className="w-4 h-4 text-red-500" />
                        <span>Preklady poháňané AI</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-400">
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                        <span>Offline režim (Privacy first)</span>
                    </div>
                </div>

                <button
                    onClick={handleLocalLogin}
                    disabled={loading}
                    className="w-full py-4 bg-white hover:bg-gray-100 disabled:bg-gray-300 text-neutral-900 font-bold rounded-2xl transition-all shadow-lg shadow-white/10 flex items-center justify-center space-x-3 active:scale-[0.98]"
                >
                    {loading ? (
                        <span>Prihlasujem...</span>
                    ) : (
                        <>
                            <Smartphone className="w-5 h-5 text-neutral-900" />
                            <span>Vyskúšať aplikáciu</span>
                        </>
                    )}
                </button>
                
                <p className="text-[10px] text-center text-neutral-600 pt-2">
                    Pokračovaním súhlasíte s podmienkami používania.
                </p>
            </div>
        </div>
    </div>
  );
};