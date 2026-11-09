import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export const InstallPwaModal: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detecta iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIosDevice);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    // Captura evento beforeinstallprompt no Android/Chrome
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Exibe banner discretamente após 3 segundos
      setTimeout(() => setShowModal(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Se for iOS no Safari e não for standalone, mostra após 4 segundos
    if (isIosDevice && !isStandalone) {
      const dismissed = localStorage.getItem('rc_pwa_dismissed');
      if (!dismissed) {
        setTimeout(() => setShowModal(true), 4000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowModal(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      alert('Para instalar no iPhone:\n1. Toque no ícone de Compartilhar (no rodapé do Safari)\n2. Role para baixo e toque em "Adicionar à Tela de Início"\n3. Confirme em "Adicionar"');
      setShowModal(false);
    }
  };

  const handleDismiss = () => {
    setShowModal(false);
    localStorage.setItem('rc_pwa_dismissed', 'true');
  };

  if (!showModal) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 p-4 rounded-xl bg-[#17100c] border border-[#8b632c] shadow-2xl text-white animate-slideUp">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <img src="/assets/logo.png" alt="Logo" className="w-9 h-9 rounded-full border border-[#d8a84e]" />
          <div>
            <h4 className="font-serif text-sm font-bold text-[#f5d38b]">Instale Nosso Aplicativo</h4>
            <span className="text-[11px] text-zinc-400">Acesse o cardápio com 1 toque na tela inicial</span>
          </div>
        </div>
        <button onClick={handleDismiss} className="text-zinc-400 hover:text-white p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={handleInstallClick}
          className="flex-1 py-2 px-3 bg-gradient-to-r from-[#f1d18b] to-[#c7953d] text-[#1a100a] text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center gap-1.5 hover:brightness-110"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instalar Agora</span>
        </button>
        <button
          onClick={handleDismiss}
          className="px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200"
        >
          Agora Não
        </button>
      </div>
    </div>
  );
};
