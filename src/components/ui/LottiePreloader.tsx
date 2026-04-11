"use client";

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import animationData from '../../../public/animacao.json';

interface LottiePreloaderProps {
  onComplete: () => void;
}

export default function LottiePreloader({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Wait for the animation to play once or for a fixed duration
    // The animation is ~5 seconds (300 frames at 60fps)
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Give some time for the exit animation before firing onComplete
      setTimeout(onComplete, 800);
    }, 5500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={containerRef}
          className="fixed inset-0 z-[99999] bg-[#050505] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ 
            scaleY: 0,
            transition: { duration: 1.1, ease: [0.76, 0, 0.24, 1] }
          }}
          style={{ contain: 'layout paint style', transformOrigin: 'top center' }}
        >
          {/* Brutalist Entrance Backdrop */}
          <div className="absolute inset-0 bg-radial-[circle_at_center,_var(--tw-gradient-stops)] from-[#111] to-[#050505] opacity-50" />
          
          <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px]">
            <Lottie 
              animationData={animationData}
              loop={false}
              autoplay={true}
              style={{ width: '100%', height: '100%' }}
            />
          </div>

          {/* Decorative Elements for "Premium" feel */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
             <div className="w-[1px] h-12 bg-white/20 animate-pulse" />
             <span className="font-mono text-[10px] tracking-[0.4em] text-white/30 uppercase">
                Initializing Legend
             </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
