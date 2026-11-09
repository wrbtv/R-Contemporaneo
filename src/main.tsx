import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registrar service worker para PWA apenas em produção; em dev, limpa caches para evitar problemas de atualização
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js', { updateViaCache: 'none' })
        .catch((err) => console.warn('PWA Service Worker registration error:', err));
    });
  } else {
    // Desregistra qualquer worker e limpa cache storage em localhost
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) {
        reg.unregister();
      }
    });
    if ('caches' in window) {
      caches.keys().then((keys) => {
        for (const key of keys) {
          caches.delete(key);
        }
      });
    }
  }
}
