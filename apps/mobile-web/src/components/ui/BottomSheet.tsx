/**
 * BottomSheet — iOS-style modal
 * -------------------------------------------------
 * Slide-up from bottom with backdrop blur
 */

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const BottomSheet = ({ isOpen, onClose, title, children }: BottomSheetProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 rounded-t-[28px] p-5 pt-3 pb-7 max-h-[80%] overflow-y-auto"
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-slate-300 dark:bg-zinc-600 rounded-full mx-auto mb-5" />

            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-5">
              {title}
            </h3>

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
