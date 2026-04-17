"use client";

import React, { useState, useEffect, useRef, useLayoutEffect, memo } from 'react';
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

const ProjectStage = memo(function ProjectStage({ id, url, title, subtitle, bgColor }: ProjectStageProps) {
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const setIsIframeActive  = useStore((s) => s.setIsIframeActive);
  const setShowcaseProject = useStore((s) => s.setShowcaseProject);
  const setIsScenePaused   = useStore((s) => s.setIsScenePaused);
  const activeIframeId     = useStore((s) => s.activeIframeId);
  const setActiveIframeId  = useStore((s) => s.setActiveIframeId);
  
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
          boxShadow: '0 0 120px rgba(0,0,0,0.95), inset 0 0 80px rgba(176,142,104,0.015)',
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
                linear-gradient(rgba(176,142,104,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(176,142,104,0.04) 1px, transparent 1px)
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
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(176,142,104,0.35), transparent)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(176,142,104,0.35), transparent)' }} />
          <div className="absolute top-0 bottom-0 left-0 w-px" style={{ background: 'linear-gradient(180deg, transparent, rgba(176,142,104,0.35), transparent)' }} />
          <div className="absolute top-0 bottom-0 right-0 w-px" style={{ background: 'linear-gradient(180deg, transparent, rgba(176,142,104,0.35), transparent)' }} />
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
              style={{
                backgroundColor: bgColor,
                willChange: 'transform',
                transform: 'translateZ(0)',
              }}
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
                    <div className="flex flex-col items-center" style={{ gap: '28px' }}>
                      {/* Gold ring loader */}
                      <div className="relative w-20 h-20">
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          style={{ border: '1px solid rgba(176,142,104,0.15)' }}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                        />
                        <motion.div
                          className="absolute inset-2 rounded-full"
                          style={{ borderTop: '1px solid rgba(176,142,104,0.7)', borderRight: '1px solid transparent', borderBottom: '1px solid transparent', borderLeft: '1px solid transparent' }}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                        />
                        <motion.div
                          className="absolute inset-0 m-auto w-2 h-2 rounded-full"
                          style={{ background: '#B08E68' }}
                          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                      {/* Typography — Courier Prime enforced via font-mono */}
                      <div className="flex flex-col items-center" style={{ gap: '6px' }}>
                        <motion.span
                          style={{
                            fontFamily: "var(--font-raleway), sans-serif",
                            fontSize: '9px', letterSpacing: '0.5em',
                            textTransform: 'uppercase', color: 'rgba(176,142,104,0.7)',
                          }}
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 2.5, repeat: Infinity }}
                        >
                          Initializing Portal
                        </motion.span>
                        <span style={{
                          fontFamily: "var(--font-raleway), sans-serif",
                          fontSize: '8px', letterSpacing: '0.3em',
                          textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)',
                        }}>
                          {title}
                        </span>
                      </div>
                      {/* Gold progress dots */}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#B08E68' }}
                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18 }}
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
            style={{
              fontFamily: "var(--font-raleway), sans-serif",
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              background: 'rgba(0,0,0,0.55)',
              padding: '14px 16px',
              borderRadius: '4px',                              // brutalist — near-square
              border: '1px solid rgba(176,142,104,0.2)',
              boxShadow: 'none',                                // no soft shadows
              willChange: 'transform',
            }}
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
                  style={{
                    fontFamily: "var(--font-raleway), sans-serif",
                    fontSize: 'clamp(40px, 7vw, 88px)',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '-0.025em',
                    color: '#E8E4DE',
                    textShadow: '0 0 60px rgba(0,0,0,0.9)',
                  }}
                >
                  {title}
                </motion.h3>
                {subtitle && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 0.5, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                      fontFamily: "var(--font-raleway), sans-serif",
                      fontSize: '10px', letterSpacing: '0.38em',
                      textTransform: 'uppercase', color: 'rgba(176,142,104,0.7)',
                      marginTop: '12px',
                    }}
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
            className="absolute top-0 left-0 w-20 h-20"
            style={{ borderTop: '1px solid rgba(176,142,104,0.25)', borderLeft: '1px solid rgba(176,142,104,0.25)' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: localProgress > 0.9 ? 0.3 : 0, scale: 1 }}
            transition={{ duration: 0.6 }}
          />
          {/* Top Right */}
          <motion.div 
            className="absolute top-0 right-0 w-20 h-20"
            style={{ borderTop: '1px solid rgba(176,142,104,0.25)', borderRight: '1px solid rgba(176,142,104,0.25)' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: localProgress > 0.9 ? 0.3 : 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          />
          {/* Bottom Left */}
          <motion.div 
            className="absolute bottom-0 left-0 w-20 h-20"
            style={{ borderBottom: '1px solid rgba(176,142,104,0.25)', borderLeft: '1px solid rgba(176,142,104,0.25)' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: localProgress > 0.9 ? 0.3 : 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />
          {/* Bottom Right */}
          <motion.div 
            className="absolute bottom-0 right-0 w-20 h-20"
            style={{ borderBottom: '1px solid rgba(176,142,104,0.25)', borderRight: '1px solid rgba(176,142,104,0.25)' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: localProgress > 0.9 ? 0.3 : 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          />
        </div>

      </motion.div>
    </div>
  );
});

export default ProjectStage;