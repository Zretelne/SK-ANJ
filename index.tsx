import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("Index.tsx: Script started");

const rootElement = document.getElementById('root');

// Globálny handler pre chyby, ktoré nastanú pred React renderom
window.addEventListener('error', (event) => {
  console.error("Global Error caught:", event.error);
  if (rootElement && !rootElement.innerHTML) {
      rootElement.innerHTML = `<div style="color: white; padding: 20px; font-family: sans-serif; text-align: center;">
        <h3 style="color: #ef4444; margin-bottom: 10px;">Kritická chyba pri načítaní</h3>
        <p style="color: #ccc; font-size: 14px;">${event.message}</p>
        <pre style="text-align:left; font-size:10px; color:#666; overflow:auto; margin-top:10px;">${event.error?.stack || ''}</pre>
      </div>`;
  }
});

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Index.tsx: React root rendered");
  } catch (error: any) {
    console.error("Chyba pri štarte aplikácie:", error);
    rootElement.innerHTML = `<div style="color: white; padding: 20px; text-align: center; font-family: sans-serif;">
      <h3 style="color: #ef4444; margin-bottom: 10px;">Nepodarilo sa načítať aplikáciu</h3>
      <p style="color: #a3a3a3; font-size: 14px; margin-bottom: 20px;">Vyskytla sa chyba pri inicializácii.</p>
      <div style="background: #171717; padding: 15px; border-radius: 8px; text-align: left; overflow: auto; font-family: monospace; font-size: 12px; border: 1px solid #333;">
        ${error?.message || String(error)}
      </div>
    </div>`;
  }
} else {
  console.error("Nepodarilo sa nájsť root element");
}