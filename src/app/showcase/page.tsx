"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { useStore } from '@/utils/store';
import BackgroundDecahedron from '@/components/canvas/BackgroundDecahedron';
import AnimatedText from '@/components/ui/AnimatedText';
import ShowcaseHUD from '@/components/hud/ShowcaseHUD';
import ProjectStage from '@/components/external-stage/ProjectStage';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Environment, Preload } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';

export default function ShowcasePage() {
  const { hudMode, setSceneMode, setScrollProgress, setMousePos } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<{ x: string; y: string; tx: string; ty: string; scale: number; speed: number }[]>([]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    setSceneMode('showcase');
    
    // Client-side particle generation to fix hydration errors
    const newParticles = [...Array(6)].map(() => ({
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      tx: `${Math.random() * 100}%`,
      ty: `${Math.random() * 100}%`,
      scale: Math.random() * 0.5 + 0.5,
      speed: Math.random() * 20 + 10
    }));
    setParticles(newParticles);
    
    const handleScroll = () => {
      const scrolled = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      setScrollProgress(scrolled);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePosition({ x, y });
      setMousePos({ x, y });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      setSceneMode('hero');
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [setSceneMode, setScrollProgress]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        background: '#000000', 
        minHeight: '300vh', 
        position: 'relative', 
        overflow: 'hidden' 
      }}
    >
      
      {/* 3D Background Canvas */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          camera={{ position: [0, 0, 6], fov: 50 }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.2} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, 5, -5]} intensity={0.5} color="#B08E68" />
          <Suspense fallback={null}>
            <BackgroundDecahedron />
            <Environment preset="city" />
          </Suspense>
          <EffectComposer>
            <Bloom luminanceThreshold={0.5} intensity={0.8} />
            <Noise opacity={0.02} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
          <Preload all />
        </Canvas>
      </div>

      {/* Mouse-Reactive Gold Gradient */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background: `radial-gradient(circle at ${50 + mousePosition.x * 20}% ${50 + mousePosition.y * 20}%, rgba(176,142,104,0.06) 0%, transparent 55%)`
        }}
      />

      {/* Global Scroll Progress Bar (Aged Gold) */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 z-[1000] origin-left"
        style={{ 
          background: 'linear-gradient(90deg, #7A5C38 0%, #B08E68 40%, #D4A574 75%, #D4B882 100%)',
          scaleX: scrollYProgress
        }}
      />

      {/* Noise Texture Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-[1] opacity-[0.015]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat'
        }}
      />

      {/* HUD Layer */}
      <ShowcaseHUD />

      {/* Content Layer */}
      <div className="relative z-10">
        
        {/* Hero Intro Section */}
        <section className="h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
          
          {/* Animated Grid Background */}
          <motion.div 
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
              x: useTransform(smoothProgress, [0, 0.2], [0, -40]),
              y: useTransform(smoothProgress, [0, 0.2], [0, -40])
            }}
          />

          {/* Radial Glow */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-[#B08E68]/05 via-transparent to-transparent blur-3xl" />
          </motion.div>

          {/* Floating Orbs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((particle, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-white/20 blur-sm"
                initial={{ 
                  x: particle.x,
                  y: particle.y,
                }}
                animate={{
                  x: [particle.x, particle.tx, particle.x],
                  y: [particle.y, particle.ty, particle.y],
                  scale: [particle.scale, particle.scale * 1.5, particle.scale],
                  opacity: [0.2, 0.5, 0.2]
                }}
                transition={{
                  duration: particle.speed,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            ))}
          </div>

          <AnimatePresence>
            {hudMode === 'director' && (
              <motion.div
                key="hero-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="flex flex-col items-center"
              >
                {/* Title with Masked Reveal Animation */}
                <div 
                  className="flex flex-col items-center"
                  style={{ willChange: 'transform', transform: 'translateZ(0)' }}
                >
                  <AnimatedText
                    text="HYBRID"
                    className="text-[#E8E4DE]"
                    stagger={0.025}
                    delay={0.2}
                    style={{
                      fontFamily: "var(--font-raleway), sans-serif",
                      fontWeight: 900,
                      fontSize: 'clamp(56px, 10vw, 120px)',
                      textTransform: 'uppercase',
                      letterSpacing: '-0.03em',
                      lineHeight: 1,
                      display: 'block',
                    }}
                  />
                  
                  <AnimatedText
                    text="PORTFOLIO"
                    stagger={0.02}
                    delay={0.42}
                    style={{
                      fontFamily: "var(--font-raleway), sans-serif",
                      fontWeight: 900,
                      fontSize: 'clamp(56px, 10vw, 120px)',
                      textTransform: 'uppercase',
                      letterSpacing: '-0.03em',
                      lineHeight: 1,
                      display: 'block',
                      // Aged-gold outline
                      WebkitTextStroke: '1.5px rgba(176,142,104,0.5)',
                      color: 'transparent',
                      textShadow: '0 0 40px rgba(176,142,104,0.18)',
                    }}
                  />
                </div>

                {/* Subtitle with Sophisticated Fade-Slide */}
                <motion.p
                  style={{
                    fontFamily: "var(--font-raleway), sans-serif",
                    fontSize: '10px', letterSpacing: '0.42em',
                    textTransform: 'uppercase', color: 'rgba(232,228,222,0.35)',
                    maxWidth: '480px', marginTop: '28px', marginBottom: '40px',
                    willChange: 'transform', transform: 'translateZ(0)',
                  }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                >
                  Digital Artifacts & Interactive Experiences
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tech Stack Pills with Staggered Scale-In */}
          <motion.div 
            className="flex flex-wrap gap-4 mt-4 justify-center"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  delayChildren: 0.8,
                  staggerChildren: 0.08
                }
              }
            }}
          >
            {['React', 'Next.js', 'Three.js', 'GSAP', 'Framer Motion'].map((tech) => (
              <motion.div
                key={tech}
                style={{
                  padding: '8px 18px',
                  borderRadius: '2px',                   // brutalist
                  border: '1px solid rgba(176,142,104,0.18)',
                  background: 'rgba(176,142,104,0.04)',
                  backdropFilter: 'blur(8px)',
                  willChange: 'transform',
                }}
                variants={{
                  hidden: { opacity: 0, scale: 0.8, y: 10 },
                  visible: { opacity: 1, scale: 1, y: 0 }
                }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{
                  scale: 1.04,
                  borderColor: 'rgba(176,142,104,0.45)',
                  backgroundColor: 'rgba(176,142,104,0.09)',
                }}
              >
                <span style={{
                  fontFamily: "var(--font-raleway), sans-serif",
                  fontSize: '9px', letterSpacing: '0.3em',
                  textTransform: 'uppercase', color: 'rgba(176,142,104,0.55)',
                }}>
                  {tech}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Animated Scroll Indicator */}
          <motion.div 
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 1, repeat: Infinity, repeatType: 'reverse' }}
          >
            <div className="flex flex-col items-center space-y-3">
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="text-[#B08E68]/40"
                >
                  <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                </svg>
              </motion.div>
              <span style={{ fontFamily: "var(--font-raleway), sans-serif", fontSize: '8px', letterSpacing: '0.35em', color: 'rgba(176,142,104,0.3)', textTransform: 'uppercase' }}>
                Scroll
              </span>
            </div>
          </motion.div>

          {/* Decorative Lines */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.5, duration: 1.5 }}
          />
        </section>

        {/* Transition Section */}
        <motion.section 
          className="h-[30vh] flex items-center justify-center relative"
          style={{
            opacity: useTransform(smoothProgress, [0.1, 0.15, 0.2], [0, 1, 0])
          }}
        >
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="w-16 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto mb-6"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            />
            <p className="text-white/30 font-mono text-[11px] uppercase tracking-[0.5em]">
              Featured Projects
            </p>
          </motion.div>
        </motion.section>

        {/* Project 1: Agrotoxica */}
        <ProjectStage 
          id="agrotoxica"
          title="Agrotóxica"
          subtitle="Precision Agriculture & Bio Solutions"
          url="https://agrotoxica.com.br/inicio"
          bgColor="#0d1a0d"
        />

        {/* Cinematic Spacer with Parallax Text */}
        <section className="h-[80vh] flex items-center justify-center relative overflow-hidden">
          <motion.div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, transparent 1px, transparent 2px, rgba(255,255,255,0.03) 3px),
                repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, transparent 1px, transparent 2px, rgba(255,255,255,0.03) 3px)
              `,
              backgroundSize: '100px 100px',
              y: useTransform(smoothProgress, [0.3, 0.5], [0, -100])
            }}
          />
          
          <motion.div
            className="text-center z-10"
            style={{
              y: useTransform(smoothProgress, [0.3, 0.5], [100, -100]),
              opacity: useTransform(smoothProgress, [0.35, 0.4, 0.45, 0.5], [0, 1, 1, 0])
            }}
          >
            <h3 className="text-white/20 font-raleway text-3xl md:text-5xl uppercase tracking-[0.5em] font-light">
              Next Legend
            </h3>
            <motion.div
              className="w-32 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mx-auto mt-8"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5 }}
            />
          </motion.div>
        </section>

        {/* Project 2: Myth Ecosystem */}
        <ProjectStage 
          id="vercel-project"
          title="Myth Ecosystem"
          subtitle="Advanced AI Integration & Digital Legends"
          url="https://project-2fjv9.vercel.app/"
          bgColor="#000000"
        />

        {/* Outro Section with Premium CTA */}
        <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
          
          {/* Radial Gradient Background */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-white/05 via-transparent to-transparent"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
          </div>

          <motion.div 
            className="text-center z-10 px-6"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-myth-gold/20 bg-myth-gold/5 mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-myth-gold animate-pulse" />
              <span style={{
                fontFamily: "var(--font-raleway), sans-serif",
                fontSize: '9px', letterSpacing: '0.3em',
                textTransform: 'uppercase', color: '#B08E68',
              }}>
                End of Transmission
              </span>
            </motion.div>

            {/* Main Text */}
            <motion.h3
              style={{
                fontFamily: "var(--font-raleway), sans-serif",
                fontSize: 'clamp(32px, 5vw, 64px)',
                fontWeight: 300, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: '#E8E4DE',
                lineHeight: 1.1,
              }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              More legends
              <br />
              <span style={{ color: 'rgba(232,228,222,0.3)' }}>coming soon.</span>
            </motion.h3>

            {/* Decorative Line */}
            <motion.div
              className="w-24 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto mb-12"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 1 }}
            />

            {/* CTA Button */}
            <motion.button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{
                position: 'relative', padding: '14px 48px',
                background: 'transparent',
                border: '1px solid rgba(176,142,104,0.35)',
                borderRadius: '2px',
                cursor: 'pointer',
                willChange: 'transform',
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.04, borderColor: 'rgba(176,142,104,0.7)' }}
              whileTap={{ scale: 0.96 }}
            >
              {/* Shine sweep */}
              <motion.div
                style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(176,142,104,0.12), transparent)',
                }}
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.55 }}
              />
              <span style={{
                fontFamily: "var(--font-raleway), sans-serif",
                fontSize: '10px', letterSpacing: '0.28em',
                textTransform: 'uppercase', color: 'rgba(176,142,104,0.7)',
                position: 'relative',
              }}>
                Return to Top
              </span>
            </motion.button>

            {/* Footer Info */}
            <motion.div 
              className="mt-16 space-y-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
            >
              <p style={{
                fontFamily: "var(--font-raleway), sans-serif",
                fontSize: '8px', letterSpacing: '0.4em',
                textTransform: 'uppercase', color: 'rgba(232,228,222,0.18)',
              }}>
                Crafted with precision
              </p>
              <div style={{
                display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center',
                fontFamily: "var(--font-raleway), sans-serif",
                fontSize: '8px', letterSpacing: '0.2em',
                color: 'rgba(232,228,222,0.1)',
              }}>
                {['React', 'Next.js', 'Three.js', 'Framer Motion'].map((t, i) => (
                  <React.Fragment key={t}>
                    {i > 0 && <span style={{ color: 'rgba(176,142,104,0.3)' }}>·</span>}
                    <span>{t}</span>
                  </React.Fragment>
                ))}
              </div>
            </motion.div>

          </motion.div>
        </section>

      </div>

      <style jsx global>{`
        .outline-text {
          -webkit-text-stroke: 1.5px rgba(176, 142, 104, 0.4);
          color: transparent;
          text-shadow: 0 0 30px rgba(176, 142, 104, 0.2);
        }

        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}