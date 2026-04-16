"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/utils/store';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ProjectStageProps {
  id: 'agrotoxica' | 'vercel-project';
  url: string;
  title: string;
  subtitle?: string;
  bgColor: string; // Branded fallback color
}

export default function ProjectStage({ id, url, title, subtitle, bgColor }: ProjectStageProps) {
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const setIsIframeActive = useStore((state) => state.setIsIframeActive);
  const setShowcaseProject = useStore((state) => state.setShowcaseProject);
  const setIsScenePaused = useStore((state) => state.setIsScenePaused);
  const activeIframeId = useStore((state) => state.activeIframeId);
  const setActiveIframeId = useStore((state) => state.setActiveIframeId);
  
  const [isMobile, setIsMobile] = useState(false);
  const [isPointerEnabled, setIsPointerEnabled] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const unmountTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync Hibernation: Only pause if scale is 1 AND iframe is loaded
  useEffect(() => {
    if (localProgress === 1 && isIframeLoaded) {
      setIsScenePaused(true);
    } else {
      setIsScenePaused(false);
    }
  }, [localProgress, isIframeLoaded, setIsScenePaused]);

  useLayoutEffect(() => {
    if (isMobile) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          // Buffer Zone: start 200px earlier/later to prevent boundary flickering
          start: "top bottom+=200", 
          end: "center center-=200",
          scrub: true,
          onEnter: () => {
            if (unmountTimeoutRef.current) clearTimeout(unmountTimeoutRef.current);
            setActiveIframeId(id);
          },
          onLeave: () => {
            // Debounced Culling: Wait 500ms before destroying iframe
            unmountTimeoutRef.current = setTimeout(() => {
              setActiveIframeId(null);
              setIsIframeLoaded(false);
            }, 500);
          },
          onEnterBack: () => {
            if (unmountTimeoutRef.current) clearTimeout(unmountTimeoutRef.current);
            setActiveIframeId(id);
          },
          onLeaveBack: () => {
            unmountTimeoutRef.current = setTimeout(() => {
              setActiveIframeId(null);
              setIsIframeLoaded(false);
            }, 500);
          },
          onUpdate: (self) => {
            setLocalProgress(self.progress);
            // Force pointer-events: none during scrub
            if (self.progress > 0 && self.progress < 1) {
              if (isPointerEnabled) setIsPointerEnabled(false);
            }
            if (self.progress === 1) {
              setIsPointerEnabled(true);
            }
          },
          onToggle: (self) => setShowcaseProject(self.isActive ? id : null)
        }
      });

      tl.fromTo(stageRef.current, 
        { 
          scale: 0.8,
          rotateX: 15,
          borderRadius: '2.5rem',
          transformPerspective: 1200
        },
        {
          scale: 1,
          rotateX: 0,
          borderRadius: '0rem',
          ease: "none"
        }
      );
    }, containerRef);

    return () => {
      if (unmountTimeoutRef.current) clearTimeout(unmountTimeoutRef.current);
      ctx.revert();
    };
  }, [isMobile, id, setActiveIframeId, setShowcaseProject, isPointerEnabled]);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  const isMounted = activeIframeId === id;

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[180vh] flex items-center justify-center overflow-visible z-10"
    >
      <div 
        ref={stageRef}
        className={`relative w-full h-screen sticky top-0 overflow-hidden border border-white/5 shadow-[0_0_120px_rgba(0,0,0,0.9)] 
          ${isPointerEnabled ? 'pointer-events-auto' : 'pointer-events-none'}
        `}
        style={{ 
          backgroundColor: bgColor, // Branded Splash Color
          willChange: 'transform',
          transform: 'translateZ(0)' // Hardware Acceleration
        }}
      >
        
        {/* MOBILE FALLBACK: Premium Poster */}
        {isMobile && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-white/10 to-transparent backdrop-blur-3xl z-20">
            <div className="space-y-4 max-w-md">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-white font-raleway font-black text-4xl uppercase tracking-tighter"
              >
                {title}
              </motion.h2>
              {subtitle && (
                <p className="text-white/40 font-mono text-[10px] uppercase tracking-[0.3em]">
                  {subtitle}
                </p>
              )}
              <div className="pt-8">
                <button 
                  onClick={() => window.open(url, '_blank')}
                  className="px-10 py-4 bg-white text-black font-bold rounded-full uppercase tracking-tighter hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                >
                  Explorar Projeto
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ENTERPRISE JIT IFRAME (Strict Mutual Exclusion + No Void) */}
        {!isMobile && (
          <AnimatePresence mode="wait">
            {isMounted && (
              <motion.div
                key={`${id}-iframe-mount`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-0"
                style={{ backgroundColor: bgColor }}
              >
                <iframe
                  src={url}
                  className={`w-full h-full border-none transition-opacity duration-1000 ${isIframeLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setIsIframeLoaded(true)}
                  title={title}
                  loading="eager"
                />
                
                {/* Loader Overlay (Matches bgColor) */}
                {!isIframeLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center z-10" style={{ backgroundColor: bgColor }}>
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-12 h-12 rounded-full border border-white/10 border-t-white/60 animate-spin" />
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-white/20 font-mono uppercase tracking-[0.4em] animate-pulse">Establishing Bridge...</span>
                        <span className="text-[8px] text-white/10 font-mono uppercase tracking-[0.2em]">Safety Buffers Active</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Global HUD Sync Decals */}
        <div className="absolute top-10 right-10 z-30 pointer-events-none opacity-40">
          <div className="flex flex-col items-end font-mono">
            <div className="flex items-center space-x-2">
               <div className={`w-1 h-1 rounded-full ${isIframeLoaded ? 'bg-cyan-500' : 'bg-red-500'} animate-pulse`} />
               <span className="text-[8px] text-white uppercase tracking-[0.2em] font-bold">Instance: {id}</span>
            </div>
            <span className="text-[8px] text-white/50 uppercase tracking-widest leading-none">
              GPU HIBERNATION: {useStore.getState().isScenePaused ? 'LOCKED' : 'READY'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
