"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

export const Toast = ({ message, type, isVisible, onClose }: ToastProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success" />,
    error: <AlertCircle className="w-5 h-5 text-danger" />,
    info: <Info className="w-5 h-5 text-accent" />,
  };

  const borders = {
    success: 'border-success/20',
    error: 'border-danger/20',
    info: 'border-accent/20',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 glass rounded-2xl border ${borders[type]} shadow-2xl min-w-[300px]`}
        >
          {icons[type]}
          <p className="text-sm font-medium text-text-main flex-grow">{message}</p>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-4 h-4 text-text-dim" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
