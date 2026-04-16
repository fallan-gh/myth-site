"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/utils/store';

// Inline SVG Icons
const Icons = {
  Globe: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
  ),
  MousePointer2: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="m13 13 6 6"/></svg>
  ),
  MoveDown: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 18L12 22L16 18"/><path d="M12 2V22"/></svg>
  )
};

export default function ShowcaseHUD() {
  const { 
    hudMode, 
    setHudMode, 
    showcaseProject, 
    isIframeActive,
    scrollProgress 
  } = useStore();

  const [lastSentScroll, setLastSentScroll] = useState(0);

  // Sync scroll with iframe via postMessage
  useEffect(() => {
    if (isIframeActive && Math.abs(scrollProgress - lastSentScroll) > 0.005) {
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach((iframe) => {
        iframe.contentWindow?.postMessage({
          type: 'MYTH_SCROLL_SYNC',
          velocity: scrollProgress,
          targetY: scrollProgress * document.body.scrollHeight
        }, '*');
      });
      setLastSentScroll(scrollProgress);
    }
  }, [scrollProgress, isIframeActive, lastSentScroll]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {/* Top Bar: Navigation Context */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="absolute top-0 left-0 w-full h-20 flex items-center justify-between px-8 bg-gradient-to-b from-black/80 to-transparent pointer-events-auto"
      >
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md">
            <Icons.Globe />
          </div>
          <div>
            <h1 className="text-white font-raleway font-bold text-xs uppercase tracking-[0.3em]">Showcase Mode</h1>
            <p className="text-[10px] text-white/40 font-mono italic">
              {showcaseProject ? `Tuned to: ${showcaseProject}` : 'Awaiting Selection'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setHudMode(hudMode === 'director' ? 'exploration' : 'director')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all ${
              hudMode === 'exploration' 
                ? 'bg-white text-black border-white' 
                : 'bg-white/5 text-white/60 border-white/10 hover:border-white/40'
            }`}
          >
            {hudMode === 'director' ? <Icons.MoveDown /> : <Icons.MousePointer2 />}
            <span className="text-[10px] uppercase font-bold tracking-widest">
              {hudMode === 'director' ? 'Director Mode' : 'Exploration Mode'}
            </span>
          </button>
        </div>
      </motion.div>

      {/* Bottom Status Panel */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center space-x-3 pointer-events-auto"
      >
        <div className="px-6 py-3 glass-container rounded-full flex items-center space-x-6">
          <div className="flex flex-col items-center">
            <span className="text-[8px] text-white/30 uppercase font-bold">Sync Level</span>
            <div className="w-24 h-1 bg-white/10 mt-1 overflow-hidden relative">
              <motion.div 
                className="absolute inset-0 bg-white/40"
                animate={{ width: `${scrollProgress * 100}%` }}
              />
            </div>
          </div>
          
          <div className="h-6 w-[1px] bg-white/10" />

          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isIframeActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[9px] text-white/60 font-mono uppercase">
              {isIframeActive ? 'Iframe Hooked' : 'Searching Site...'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Exploration Mask (Only visible in Exploration mode) */}
      <AnimatePresence>
        {hudMode === 'exploration' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 border-[2px] border-white/20 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
