import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Načítame environment premenné (aj tie bez VITE_ prefixu, vďaka tretiemu parametru '')
  // Fix: Cast process to any to avoid TS error about missing cwd()
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Toto nahradí 'process.env.API_KEY' v kóde za reálnu hodnotu (string) počas buildu
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    build: {
      outDir: 'dist',
    },
    server: {
      host: true // Toto umožní prístup z mobilu cez lokálnu Wi-Fi
    }
  };
});