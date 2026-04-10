"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useStore } from '@/utils/store';

export default function WhatsAppConcierge() {
  const [isHovered, setIsHovered] = useState(false);
  const setCursorMode = useStore(state => state.setCursorMode);

  return (
    <div 
      className="fixed bottom-6 left-6 z-[100] flex items-center justify-center p-2 isolate mix-blend-difference"
      onMouseEnter={() => {
        setIsHovered(true);
        setCursorMode('magnetic');
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setCursorMode('default');
      }}
    >
      <motion.a 
        href="https://wa.me/1234567890" // Replace with actual number
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center h-12 rounded-full bg-white text-black overflow-hidden cursor-none origin-left border border-white/20 shadow-2xl transition-all duration-500 ease-out"
        initial={{ width: 48 }}
        animate={{ width: isHovered ? 240 : 48 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Pulsing Dot */}
        <div className="absolute left-[18px] w-3 h-3 rounded-full bg-[#128C7E] shadow-[0_0_10px_rgba(18,140,126,0.8)] z-10">
          <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-75" />
        </div>

        {/* Text Reveal */}
        <AnimatePresence>
          {isHovered && (
            <motion.span
              className="absolute left-10 whitespace-nowrap font-sans text-xs font-bold uppercase tracking-widest text-[#111]"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              Falar com o Diretor
            </motion.span>
          )}
        </AnimatePresence>
      </motion.a>
    </div>
  );
}
