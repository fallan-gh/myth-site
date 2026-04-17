"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
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
  bgColor: string;
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const unmountTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Advanced Motion Values for Parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const parallaxX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-20, 20]), {
    stiffness: 150,
    damping: 30
  });
  
  const parallaxY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-10, 10]), {
    stiffness: 150,
    damping: 30
  });

  // Sync Hibernation
  useEffect(() => {
    if (localProgress === 1 && isIframeLoaded) {
      setIsScenePaused(true);
    } else {
      setIsScenePaused(false);
    }
  }, [localProgress, isIframeLoaded, setIsScenePaused]);

  // Mouse Movement Handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPointerEnabled) return;
      
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const x = (clientX / innerWidth) - 0.5;
      const y = (clientY / innerHeight) - 0.5;
      
      mouseX.set(x);
      mouseY.set(y);
      setMousePosition({ x: clientX, y: clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isPointerEnabled, mouseX, mouseY]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom+=200", 
          end: "center center-=200",
          scrub: true,
          onEnter: () => {
            if (unmountTimeoutRef.current) clearTimeout(unmountTimeoutRef.current);
            setActiveIframeId(id);
          },
          onLeave: () => {
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
          scale: 0.85,
          rotateX: 10,
          borderRadius: '2rem',
          transformPerspective: 1200
        },
        {
          scale: 1,
          rotateX: 0,
          borderRadius: '0rem',
          ease: "power2.out"
        }
      );
    }, containerRef);

    return () => {
      if (unmountTimeoutRef.current) clearTimeout(unmountTimeoutRef.current);
      ctx.revert();
    };
  }, [id, setActiveIframeId, setShowcaseProject, isPointerEnabled]);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  const isMounted = activeIframeId === id;

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[180vh] flex items-center justify-center overflow-visible z-10"
    >
      <motion.div 
        ref={stageRef}
        className={`relative w-full h-screen sticky top-0 overflow-hidden border border-white/10 
          ${isPointerEnabled ? 'pointer-events-auto' : 'pointer-events-none'}
        `}
        style={{ 
          backgroundColor: bgColor,
          willChange: 'transform',
          transform: 'translateZ(0)',
          boxShadow: '0 0 120px rgba(0,0,0,0.9), inset 0 0 100px rgba(255,255,255,0.02)'
        }}
      >
        
        {/* Animated Grid Overlay */}
        <motion.div 
          className="absolute inset-0 pointer-events-none z-[5]"
          initial={{ opacity: 0 }}
          animate={{ opacity: localProgress > 0.5 ? 0.03 : 0.08 }}
          transition={{ duration: 1 }}
        >
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
              transform: `translate(${parallaxX.get() * 0.5}px, ${parallaxY.get() * 0.5}px)`
            }}
          />
        </motion.div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none z-[4] overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              initial={{ 
                x: Math.random() * 100 + '%',
                y: Math.random() * 100 + '%',
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{
                y: [
                  `${Math.random() * 100}%`,
                  `${Math.random() * 100}%`
                ],
                x: [
                  `${Math.random() * 100}%`,
                  `${Math.random() * 100}%`
                ],
                opacity: [0, 0.6, 0]
              }}
              transition={{
                duration: Math.random() * 10 + 15,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 5
              }}
            />
          ))}
        </div>

        {/* Premium Gradient Borders */}
        <motion.div 
          className="absolute inset-0 pointer-events-none z-[6]"
          initial={{ opacity: 0 }}
          animate={{ opacity: localProgress > 0.8 ? 1 : 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        </motion.div>

        {/* ENTERPRISE JIT IFRAME */}
        <AnimatePresence mode="wait">
          {isMounted && (
            <motion.div
              key={`${id}-iframe-mount`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
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
              
              {/* Enhanced Loader */}
              <AnimatePresence>
                {!isIframeLoaded && (
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center z-10" 
                    style={{ backgroundColor: bgColor }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="flex flex-col items-center space-y-6">
                      {/* Spinning Ring Loader */}
                      <div className="relative w-24 h-24">
                        <motion.div
                          className="absolute inset-0 rounded-full border border-white/5"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.div
                          className="absolute inset-2 rounded-full border-t border-white/40"
                          animate={{ rotate: -360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.div
                          className="absolute inset-4 rounded-full border-r border-white/60"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                        
                        {/* Pulsing Center */}
                        <motion.div
                          className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-white/80"
                          animate={{ 
                            scale: [1, 1.4, 1],
                            opacity: [0.8, 1, 0.8]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                      
                      {/* Loading Text */}
                      <motion.div 
                        className="flex flex-col items-center space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <motion.span 
                          className="text-[11px] text-white/30 font-mono uppercase tracking-[0.5em]"
                          animate={{ opacity: [0.3, 0.8, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          Initializing Portal
                        </motion.span>
                        <span className="text-[9px] text-white/15 font-mono uppercase tracking-[0.3em]">
                          {title}
                        </span>
                      </motion.div>

                      {/* Progress Dots */}
                      <div className="flex space-x-2">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-white/40"
                            animate={{ 
                              scale: [1, 1.4, 1],
                              opacity: [0.4, 1, 0.4]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: i * 0.2
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced HUD with Parallax */}
        <motion.div 
          className="absolute top-10 right-10 z-30 pointer-events-none"
          style={{
            x: parallaxX,
            y: parallaxY
          }}
        >
          <motion.div 
            className="flex flex-col items-end font-mono backdrop-blur-sm bg-black/10 p-4 rounded-lg border border-white/5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 0.6, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="flex items-center space-x-3 mb-2">
              <motion.div 
                className={`w-2 h-2 rounded-full ${isIframeLoaded ? 'bg-emerald-400' : 'bg-red-500'}`}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-[9px] text-white/70 uppercase tracking-[0.25em] font-bold">
                {id}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-32 h-px bg-white/10 mb-2 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-white/40 to-white/80"
                initial={{ width: '0%' }}
                animate={{ width: `${localProgress * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-[7px] text-white/40 uppercase tracking-widest">
                GPU: {useStore.getState().isScenePaused ? 'HIBERNATING' : 'ACTIVE'}
              </span>
              <motion.div
                animate={{ rotate: useStore.getState().isScenePaused ? 0 : 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                </svg>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Project Title Overlay (Only shows when not fully scaled) */}
        <AnimatePresence>
          {localProgress < 0.95 && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 - localProgress }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center">
                <motion.h3 
                  className="text-white font-black text-5xl md:text-7xl uppercase tracking-tighter mb-2"
                  style={{
                    textShadow: '0 0 40px rgba(0,0,0,0.8)'
                  }}
                >
                  {title}
                </motion.h3>
                {subtitle && (
                  <motion.p 
                    className="text-white/50 font-mono text-xs md:text-sm tracking-[0.3em] uppercase"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 0.6, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {subtitle}
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Corner Accents */}
        <div className="absolute inset-0 pointer-events-none z-[7]">
          {/* Top Left */}
          <motion.div 
            className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-white/10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: localProgress > 0.9 ? 0.3 : 0, scale: 1 }}
            transition={{ duration: 0.6 }}
          />
          {/* Top Right */}
          <motion.div 
            className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-white/10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: localProgress > 0.9 ? 0.3 : 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          />
          {/* Bottom Left */}
          <motion.div 
            className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-white/10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: localProgress > 0.9 ? 0.3 : 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />
          {/* Bottom Right */}
          <motion.div 
            className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-white/10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: localProgress > 0.9 ? 0.3 : 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          />
        </div>

      </motion.div>
    </div>
  );
}