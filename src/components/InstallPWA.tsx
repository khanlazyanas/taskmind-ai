'use client';
import { useEffect, useState } from 'react';
import { Download, Sparkles } from 'lucide-react'; // Chat Assistant ki tarah Lucide icons

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstall(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!showInstall) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <div className="relative group">
        <button 
          onClick={handleInstall}
          className="flex items-center gap-2.5 px-6 py-3.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.1)] transition-all duration-300 hover:scale-105 active:scale-95 border border-zinc-200/50 dark:border-zinc-700/50 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:shadow-2xl font-bold text-sm tracking-wide z-50 relative"
        >
          <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform duration-300" />
          Install App
        </button>

        {/* Premium Floating Sparkle Badge - Chat assistant ke design ko match karne ke liye */}
        <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white rounded-full p-1.5 shadow-sm animate-pulse z-50 border-2 border-white dark:border-zinc-950">
          <Sparkles className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}