"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedText from '@/components/ui/AnimatedText';
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
    scrollProgress,
    mousePos
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

  // Magnetic Button Wrapper
  const Magnetic = ({ children }: { children: React.ReactNode }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const handleMouse = (e: React.MouseEvent) => {
      const { clientX, clientY, currentTarget } = e;
      const { left, top, width, height } = currentTarget.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      setPosition({ x: (clientX - centerX) * 0.4, y: (clientY - centerY) * 0.4 });
    };
    const reset = () => setPosition({ x: 0, y: 0 });
    return (
      <motion.div
        onMouseMove={handleMouse}
        onMouseLeave={reset}
        animate={{ x: position.x, y: position.y }}
        transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      >
        {children}
      </motion.div>
    );
  };

  // Parallax Text Wrapper
  const Parallax = ({ children, factor = 10 }: { children: React.ReactNode, factor?: number }) => (
    <motion.div
      animate={{ 
        x: mousePos.x * factor, 
        y: mousePos.y * factor 
      }}
      transition={{ type: "spring", stiffness: 100, damping: 30 }}
    >
      {children}
    </motion.div>
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      
      {/* Side Scroll Indicator (Aged Gold) */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 w-px h-64 bg-white/10 hidden md:block">
        <motion.div 
          className="absolute top-0 left-[-1px] w-[3px] bg-[#B08E68]"
          style={{ height: '20%' }}
          animate={{ 
            y: scrollProgress * (256 - 51), // 64px = 256px
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ opacity: { duration: 2, repeat: Infinity } }}
        />
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 font-mono tracking-tighter vertical-text opacity-40">
          <AnimatedText 
            text="PROJECT_FLOW" 
            className="text-[8px] text-[#B08E68]" 
            stagger={0.05}
          />
        </div>
      </div>

      {/* Top Bar: Navigation Context */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="absolute top-0 left-0 w-full h-24 flex items-center justify-between px-8 bg-gradient-to-b from-black/60 to-transparent pointer-events-auto"
      >
        <div className="flex items-center space-x-6">
          <Parallax factor={5}>
            <div className="w-12 h-12 flex items-center justify-center rounded-full border border-white/10 bg-black/20 backdrop-blur-xl group cursor-none">
              <Icons.Globe />
              <div className="absolute inset-0 rounded-full bg-[#B08E68]/0 group-hover:bg-[#B08E68]/5 transition-colors border-0 group-hover:border group-hover:border-[#B08E68]/20" />
            </div>
          </Parallax>
          
          <Parallax factor={8}>
            <div className="flex flex-col">
              <AnimatedText 
                text="Interactive_Layer" 
                className="text-white/40 font-mono text-[9px] uppercase tracking-[0.4em] mb-1" 
                stagger={0.015}
                delay={0.2}
              />
              <h2 className="text-white font-raleway font-bold text-xs uppercase tracking-[0.2em] flex items-center">
                <AnimatedText 
                  text={showcaseProject ? showcaseProject.toUpperCase() : 'MYTH SYSTEM'} 
                  stagger={0.02}
                  delay={0.4}
                />
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: 'spring' }}
                  className="ml-3 w-1.5 h-1.5 rounded-full bg-[#B08E68] shadow-[0_0_10px_#B08E68]" 
                />
              </h2>
            </div>
          </Parallax>
        </div>

        <Magnetic>
          <button 
            onClick={() => setHudMode(hudMode === 'director' ? 'exploration' : 'director')}
            className="group relative px-6 py-2.5 rounded-full overflow-hidden transition-all"
          >
            {/* Liquid Sweep Effect */}
            <div className="absolute inset-0 bg-white/5 border border-white/10 group-hover:border-[#B08E68]/50 transition-colors" />
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[#B08E68]/20 to-transparent"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.8, ease: "circOut" }}
            />
            
            <div className="relative flex items-center space-x-3">
              <motion.span 
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                className={`w-1 h-3 ${hudMode === 'exploration' ? 'bg-[#B08E68]' : 'bg-white/40'}`} 
              />
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-white/80 group-hover:text-white">
                <AnimatedText 
                  text={hudMode === 'director' ? 'Fixed Perspective' : 'Free Exploration'} 
                  stagger={0.01}
                  delay={0.5}
                />
              </span>
            </div>
          </button>
        </Magnetic>
      </motion.div>

      {/* Bottom Status Panel */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center pointer-events-auto"
      >
        <div className="px-8 py-4 bg-black/40 backdrop-blur-2xl rounded-full border border-white/5 flex items-center space-x-10">
          <div className="flex flex-col">
            <AnimatedText 
              text="Stability_Core" 
              className="text-[7px] text-white/20 uppercase font-black tracking-widest mb-2" 
              stagger={0.02}
              delay={0.6}
            />
            <div className="flex space-x-1">
              {[...Array(12)].map((_, i) => (
                <motion.div 
                  key={i}
                  className="w-[2px] h-3 bg-white/10"
                  animate={{ 
                    height: isIframeActive ? [8, 14, 8] : 3,
                    backgroundColor: isIframeActive ? (i < scrollProgress * 12 ? '#B08E68' : '#ffffff20') : '#ffffff10'
                  }}
                  transition={{ duration: 0.5, delay: i * 0.05, repeat: Infinity }}
                />
              ))}
            </div>
          </div>
          
          <div className="h-8 w-px bg-white/5" />

          <Magnetic>
            <div className="group cursor-pointer flex items-center space-x-3">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: 'spring' }}
                className={`w-2 h-2 rounded-full ${isIframeActive ? 'bg-[#B08E68] shadow-[0_0_8px_#B08E68]' : 'bg-red-500/40'}`} 
              />
              <span className="text-[10px] text-white/50 group-hover:text-white font-mono uppercase tracking-widest transition-colors">
                <AnimatedText 
                  text={isIframeActive ? 'Stream_Active' : 'Awaiting_Signal'} 
                  stagger={0.015}
                  delay={1.2}
                />
              </span>
            </div>
          </Magnetic>
        </div>
      </motion.div>

      {/* Exploration Mask */}
      <AnimatePresence>
        {hudMode === 'exploration' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 border border-[#B08E68]/10 pointer-events-none"
          >
            <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-[#B08E68]" />
            <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-[#B08E68]" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-[#B08E68]" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-[#B08E68]" />
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
      `}</style>
    </div>
  );
}
