/**
 * PWA INSTALL PROMPT
 * Shows a banner asking user to install the app (FREE!)
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { installPWA } from '@/utils/free-features';

export const InstallPrompt = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      // Check if user already dismissed
      if (!localStorage.getItem('seva_install_dismissed')) {
        setTimeout(() => setShow(true), 5000); // Show after 5 sec
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    const installed = await installPWA();
    if (installed) setShow(false);
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('seva_install_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 max-w-sm mx-auto bg-gradient-to-br from-primary-500 to-primary-400 text-white p-4 rounded-2xl shadow-2xl z-[100] flex items-center gap-3"
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
            📱
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm">Install Seva Setu</p>
            <p className="text-[11px] opacity-90">Add to home screen for quick access</p>
          </div>
          <button
            onClick={handleInstall}
            className="bg-white text-primary-500 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1"
          >
            <Download size={12} />
            Install
          </button>
          <button onClick={handleDismiss} className="text-white/80 p-1">
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
