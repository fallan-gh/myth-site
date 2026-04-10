"use client";

import { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react';
import {
  motion, useMotionValue, useSpring, AnimatePresence, useTransform, Variants
} from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useStore } from '@/utils/store';
import Image from 'next/image';
import { dict } from '@/utils/i18n';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Float, Icosahedron, MeshDistortMaterial, Environment, 
  Sparkles, Stars, PresentationControls, Preload 
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import './myth.css';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface Project {
  index: string;
  name: string;
  category: string;
  year: string;
  image: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const PROJECTS_DATA = [
  { index: 'I', name: 'Agrotóxica', year: '2026', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format' },
  { index: 'II', name: 'Digital Embassy', year: '2025', image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format' },
  { index: 'III', name: 'Mass Mantle', year: '2023', image: 'https://images.unsplash.com/photo-1542382257-8024cb5877f2?q=80&w=1200&auto=format' },
];

// ─────────────────────────────────────────────────────────────────────────────
// [01] CINEMATIC PRELOADER — MASTER OF MOTION (120fps ZERO-RERENDER)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * CinematicPreloader — Awwwards Jury-Level Choreography
 *
 * [120FPS ARCHITECTURE]
 * After mount, this component triggers ZERO React re-renders.
 * All visual transitions are driven by:
 *  - requestAnimationFrame (liquid fill, stroke fade)
 *  - Web Animations API (logo implode, curtain lift)
 *  - CSS class toggles (glow filter removal)
 *  - Direct SVG DOM setAttribute (clipPath expansion)
 *
 * 4-act performance:
 *  ACT I   — Calligraphy Draw: Staggered path stroke via Framer Motion variants
 *            (locked on mount, no re-render). Molten copper gradient + glow filter.
 *  ACT II  — Liquid Fill: rAF-driven clipPath rect expansion from center.
 *            Stroke paths fade via rAF opacity interpolation.
 *  ACT III — Hold: No-op. CSS steady state for 800ms.
 *  ACT IV  — Brutalist Curtain Lift: Web Animations API for logo implode (spring
 *            approximation via cubic-bezier) + curtain translateY.
 */

// Easing tokens
const EASE_EXPO: [number, number, number, number] = [0.87, 0, 0.13, 1];

// Path data extracted from Artboard 3 copy 2teste.svg
const MYTH_PATHS = [
  "M642.08,1135.33c14.54-7.4,21.42-17.6,21.42-40.81v-180.07c-7.14,9.44-14.54,19.13-22.19,28.57-26.78,34.18-50.5,69.88-50.5,105.08,0,8.16,1.28,16.32,4.08,24.48,8.16,22.44,15.05,53.05,38.51,62.74h-44.63c-41.83,0-77.28-25-91.56-64.27l-71.67-199.45v222.4c0,23.21,6.63,33.67,21.42,41.06l-67.84.26c14.54-7.4,21.17-17.6,21.17-40.81v-279.54c0-7.91-.76-14.28-2.29-19.64l-1.79-4.85c-3.32-7.65-8.93-13.01-17.09-17.09l67.84.25c-.25,0-.51,0-.77.26,26.27,2.3,47.95,18.87,57.13,44.12l71.92,199.7c10.71-39.79,58.66-89.78,83.91-126.5,13.52-19.64,22.44-41.06,22.44-61.21,0-21.93-10.97-42.34-39.53-56.37h132.63c-14.54,7.14-21.17,17.34-21.17,40.55v280.3c0,23.21,6.63,33.41,21.17,40.81h-132.63Z",
  "M788.99,1179.97c3.06.25,6.38.25,9.69.25,35.71,0,85.95-13.52,118.6-39.28l-.51-1.28-103.81-182.11c-6.63-11.99-17.09-24.23-31.37-26.78l90.54-43.1,86.72,159.15,53.31-103.55c6.63-11.73,11.99-22.19,11.99-32.14,0-8.16-3.83-15.81-13.77-23.46h54.84c-5.61,13.52-19.89,36.47-33.41,62.74l-90.29,173.94c-2.29,5.87-1.53,3.06-5.1,9.69l-35.96,69.12c-10.46,20.15-29.33,31.12-49.22,31.12-24.74,0-50.5-17.09-62.23-54.33Z",
  "M1104.74,1052.19v-133.39c0-23.46-4.08-30.61-22.19-41.06l105.59-84.17v78.56h65.29l.25,14.28h-65.55v178.03c0,26.02,8.16,38.77,23.21,38.77,8.16,0,18.36-3.83,30.35-10.97-11.99,28.82-38.26,43.36-64.78,43.36-35.96,0-72.18-27.04-72.18-83.4Z",
  "M1425.34,1088.15v-106.36c0-45.65-18.62-67.84-45.91-67.84-5.36,0-10.97.77-16.83,2.55v171.14c0,36.22-32.9,47.95-65.29,47.95-12.24,0-24.74-1.53-34.94-4.34,11.99-3.57,16.83-18.62,16.83-32.14v-241.53c0-23.72-3.83-30.61-22.19-41.32l105.59-43.1v134.16c20.4-13.77,41.32-19.89,60.96-19.89,46.93,0,85.44,35.45,85.44,85.19v126.76c0,13.52,4.59,28.31,16.58,31.88-10.46,2.81-22.7,4.34-34.94,4.34-32.39,0-65.29-11.48-65.29-47.44Z"
] as const;

/** ACT I: Stagger container — locks on mount, never re-triggers */
const pathContainerVariants: Variants = {
  hidden: {},
  drawing: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const pathDrawVariants: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
  },
  drawing: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.8, ease: EASE_EXPO },
      opacity: { duration: 0.4, ease: 'easeOut' },
    },
  },
};

/**
 * [120FPS] Custom cubic-bezier spring approximation for Web Animations API.
 * Computed from stiffness:300 damping:20 mass:0.8 → underdamped response.
 * Approximate overshooting with an ease-out-back-like curve.
 */
const SPRING_APPROX_EASE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const CURTAIN_EASE = 'cubic-bezier(0.76, 0, 0.24, 1)';

function CinematicPreloader({ onComplete }: { onComplete: () => void }) {
  // [120FPS]: Refs instead of state — ZERO re-renders after mount.
  const curtainRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const strokeGroupRef = useRef<SVGGElement>(null);
  const fillGroupRef = useRef<SVGGElement>(null);
  const fillClipRef = useRef<SVGRectElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const curtain = curtainRef.current;
    const stage = stageRef.current;
    const strokeGroup = strokeGroupRef.current;
    const fillGroup = fillGroupRef.current;
    const fillClip = fillClipRef.current;
    const root = rootRef.current;
    if (!curtain || !stage || !strokeGroup || !fillGroup || !fillClip || !root) return;

    // Gather stroke path elements for direct manipulation
    const strokePaths = strokeGroup.querySelectorAll<SVGPathElement>('path');
    const fillPaths = fillGroup.querySelectorAll<SVGPathElement>('path');

    // ──────────────────────────────────────────────────────────────
    // ACT II (t=2800ms): Liquid Fill + Stroke Fade
    // All rAF-driven, zero React.
    // ──────────────────────────────────────────────────────────────
    const tFill = setTimeout(() => {
      // Remove SVG glow filter (prevent compositing overhead during fill)
      strokeGroup.removeAttribute('filter');

      // Fade fill paths in immediately (CSS transition handles it)
      fillPaths.forEach((p, i) => {
        p.style.transition = `opacity 0.3s ease ${i * 0.04}s`;
        p.style.opacity = '1';
      });

      // Animate clipPath rect + stroke opacity via single rAF loop
      const fillStart = performance.now();
      const fillDuration = 1200;
      const strokeFadeDuration = 600;

      const tick = (now: number) => {
        const elapsed = now - fillStart;
        const t = Math.min(elapsed / fillDuration, 1);
        // ease-out-expo
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

        // Expand clipPath from center
        const fullH = 1920;
        const h = fullH * eased;
        const y = (fullH - h) / 2;
        fillClip.setAttribute('y', y as unknown as string);
        fillClip.setAttribute('height', h as unknown as string);

        // Simultaneaously fade stroke paths (faster, 600ms)
        const strokeT = Math.min(elapsed / strokeFadeDuration, 1);
        const strokeOpacity = 1 - strokeT; // linear is fine for fade
        strokePaths.forEach((p) => {
          p.style.opacity = String(strokeOpacity);
        });

        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    }, 2800);

    // ──────────────────────────────────────────────────────────────
    // ACT III: Hold (t=4200ms → t=5000ms) — No-op. Steady state.
    // ──────────────────────────────────────────────────────────────

    // ──────────────────────────────────────────────────────────────
    // ACT IV-A (t=5000ms): Logo Implode — Web Animations API
    // Runs on compositor thread, bypasses React + Framer Motion.
    // ──────────────────────────────────────────────────────────────
    const tImplode = setTimeout(() => {
      stage.animate(
        [
          { transform: 'scale(1)', opacity: 1, filter: 'blur(0px)' },
          { transform: 'scale(0.8)', opacity: 0, filter: 'blur(10px)' },
        ],
        {
          duration: 500,
          easing: SPRING_APPROX_EASE,
          fill: 'forwards',
        }
      );
    }, 5000);

    // ──────────────────────────────────────────────────────────────
    // ACT IV-B (t=5500ms): Curtain Lift — Web Animations API
    // translateY runs 100% on compositor thread (GPU).
    // ──────────────────────────────────────────────────────────────
    const tCurtain = setTimeout(() => {
      curtain.animate(
        [
          { transform: 'translateY(0%) translateZ(0)' },
          { transform: 'translateY(-100%) translateZ(0)' },
        ],
        {
          duration: 900,
          easing: CURTAIN_EASE,
          fill: 'forwards',
        }
      );
    }, 5500);

    // ──────────────────────────────────────────────────────────────
    // COMPLETE (t=6400ms): Remove from DOM + fire callback
    // Single setState to unmount.
    // ──────────────────────────────────────────────────────────────
    const tComplete = setTimeout(() => {
      root.style.display = 'none';
      onCompleteRef.current();
    }, 6400);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(tFill);
      clearTimeout(tImplode);
      clearTimeout(tCurtain);
      clearTimeout(tComplete);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // [120FPS]: Entire render happens ONCE. No conditional props,
  // no ternary operators in JSX that depend on state.
  return (
    <div ref={rootRef} className="fixed inset-0 z-[999]" style={{ contain: 'layout paint style' }}>
      {/* ═══ CURTAIN BACKDROP ═══
          [GPU]: will-change + translateZ(0) promotes to own compositor layer.
          No paint invalidation on translate. */}
      <div
        ref={curtainRef}
        className="fixed inset-0 z-[999] bg-[#050505] pointer-events-none"
        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
      />

      {/* ═══ LOGO STAGE ═══
          [GPU]: will-change: transform, opacity, filter.
          All three are compositor-safe when the element has its own layer. */}
      <div
        ref={stageRef}
        className="fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden pointer-events-none"
        style={{ willChange: 'transform, opacity, filter', transform: 'translateZ(0)' }}
      >
        <motion.svg
          viewBox="0 0 1920 1920"
          className="w-[45vw] max-w-[600px] h-auto"
          variants={pathContainerVariants}
          initial="hidden"
          animate="drawing"
        >
          <defs>
            {/* ── Molten Copper Glow Filter ── */}
            <filter id="molten-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1.2 0 0 0 0.1
                        0 0.7 0 0 0.02
                        0 0 0.3 0 0
                        0 0 0 0.6 0"
                result="glow"
              />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* ── Liquid Fill ClipPath (animated via rAF) ── */}
            <clipPath id="liquid-fill-clip">
              <rect
                ref={fillClipRef}
                x="0"
                y="960"
                width="1920"
                height="0"
              />
            </clipPath>

            {/* ── Gradient for stroke: oxidized copper → white ── */}
            <linearGradient id="copper-to-white" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#B87333" />
              <stop offset="60%" stopColor="#D4A574" />
              <stop offset="100%" stopColor="#E8E4DE" />
            </linearGradient>
          </defs>

          {/* ── LAYER 1: Glowing stroke paths (The Calligraphy) ──
              [120FPS]: filter is set once via attribute, removed via
              direct DOM in ACT II. No React re-render needed. */}
          <g ref={strokeGroupRef} filter="url(#molten-glow)">
            {MYTH_PATHS.map((d, i) => (
              <motion.path
                key={`stroke-${i}`}
                d={d}
                fill="none"
                stroke="url(#copper-to-white)"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                variants={pathDrawVariants}
              />
            ))}
          </g>

          {/* ── LAYER 2: Filled paths behind a liquid-reveal clipPath ──
              [120FPS]: opacity starts at 0 via inline style.
              Transition to 1 is triggered by direct DOM style.opacity
              set in the ACT II setTimeout. No animate prop needed. */}
          <g ref={fillGroupRef} clipPath="url(#liquid-fill-clip)">
            {MYTH_PATHS.map((d, i) => (
              <path
                key={`fill-${i}`}
                d={d}
                fill="#E8E4DE"
                stroke="none"
                style={{ opacity: 0 }}
              />
            ))}
          </g>
        </motion.svg>
      </div>
    </div>
  );
}

// [120FPS OPTIMIZATION]: Pre-allocated vector to prevent GC stutters.
const tmpVector = new THREE.Vector3();

// [00] HERO SCENE
const HeroScene = memo(function HeroScene() {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      const targetX = state.pointer.y * 0.5;
      const targetY = state.pointer.x * 0.5;
      meshRef.current.rotation.x += 0.05 * (targetX - meshRef.current.rotation.x) + delta * 0.15;
      meshRef.current.rotation.y += 0.05 * (targetY - meshRef.current.rotation.y) + delta * 0.2;
    }
    if (wireframeRef.current) {
      wireframeRef.current.rotation.x -= delta * 0.1;
      wireframeRef.current.rotation.y -= delta * 0.15;
    }
  });

  return (
    <group position={[0, -0.5, 0]}>
      <Icosahedron ref={meshRef} args={[2, 0]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#B08E68" roughness={0.15} metalness={0.9} flatShading={true} />
      </Icosahedron>
      <Icosahedron ref={wireframeRef} args={[2.2, 1]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#B08E68" wireframe={true} transparent opacity={0.2} />
      </Icosahedron>
    </group>
  );
});

// [00-B] ARCHIVAL PORTFOLIO LIST
const ARCHIVAL_PROJECTS = [
  { id: '1', name: 'AGROTÓXICA', refCode: '[REF. 001-26]', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format' },
  { id: '2', name: 'DIGITAL EMBASSY', refCode: '[REF. 014-25]', image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format' },
  { id: '3', name: 'MASS MANTLE', refCode: '[REF. 089-23]', image: 'https://images.unsplash.com/photo-1542382257-8024cb5877f2?q=80&w=1200&auto=format' },
  { id: '4', name: 'LUMINA', refCode: '[REF. 102-24]', image: 'https://images.unsplash.com/photo-1506744626753-1fa44f48ea92?q=80&w=1200&auto=format' },
];

const ArchivalPortfolioList = memo(function ArchivalPortfolioList() {
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cursorX = useSpring(mouseX, { damping: 25, stiffness: 200, mass: 0.5 });
  const cursorY = useSpring(mouseY, { damping: 25, stiffness: 200, mass: 0.5 });

  return (
    <section className="relative w-full min-h-screen bg-[#000000] flex items-center py-24 cursor-none" onMouseMove={(e) => { mouseX.set(e.clientX); mouseY.set(e.clientY); }}>
      <div className="w-full max-w-[90vw] mx-auto px-4 md:px-8">
        <ul className="flex flex-col w-full border-t border-white/10">
          {ARCHIVAL_PROJECTS.map((project) => (
            <li key={project.id} className="group relative border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between py-10 overflow-hidden cursor-none" onMouseEnter={() => setHoveredImage(project.image)} onMouseLeave={() => setHoveredImage(null)}>
              <div className="absolute inset-0 bg-[#ffffff03] scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-500 ease-out z-0 pointer-events-none" />
              <div className="relative z-10 font-serif text-[clamp(3.5rem,7vw,8rem)] leading-[0.8] font-black uppercase text-white transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-[#B87333] group-hover:translate-x-6 tracking-tight tracking-tighter">
                {project.name}
              </div>
              <div className="relative z-10 mt-6 md:mt-0 font-mono text-[10px] tracking-[0.3em] text-white/40 uppercase transition-all duration-700 ease-out group-hover:text-[#B87333]">
                {project.refCode}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <AnimatePresence>
        {hoveredImage && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -2 }} 
            animate={{ opacity: 1, scale: 1, rotate: 0 }} 
            exit={{ opacity: 0, scale: 0.85, rotate: 2 }} 
            transition={{ type: "spring", stiffness: 220, damping: 22 }} 
            className="fixed top-0 left-0 pointer-events-none z-[99] w-64 md:w-[28rem] aspect-[3/4] overflow-hidden" 
            style={{ x: cursorX, y: cursorY, translateX: '-30%', translateY: '-40%', transform: 'translateZ(0)', willChange: 'transform, opacity' }}
          >
            <motion.img 
              initial={{ scale: 1.2 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 1.1 }} 
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} 
              src={hoveredImage} 
              alt="Preview" 
              className="w-full h-full object-cover grayscale-[20%] contrast-125 mix-blend-luminosity" 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
});

// [00-C] LANGUAGE SWITCHER
function SwitcherShape() {
  const language = useStore(state => state.language);
  const meshRef = useRef<THREE.Group>(null);
  const targetRotationZ = useRef(0);
  useEffect(() => { targetRotationZ.current += Math.PI; }, [language]);
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.4;
      meshRef.current.rotation.z = THREE.MathUtils.damp(meshRef.current.rotation.z, targetRotationZ.current, 5, delta);
    }
  });
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={meshRef}>
        <Icosahedron args={[1, 0]}>
          <MeshDistortMaterial color={language === 'en' ? "#B08E68" : "#A0A0A0"} clearcoat={1} clearcoatRoughness={0.1} metalness={0.9} roughness={0.1} distort={0.3} speed={2} />
        </Icosahedron>
        <mesh rotation={[-Math.PI/2, 0, 0]}>
           <ringGeometry args={[1.3, 1.4, 32]} />
           <meshStandardMaterial color={language === 'en' ? "#B08E68" : "#A0A0A0"} metalness={1} roughness={0} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </Float>
  );
}

const LanguageSwitcher3D = memo(function LanguageSwitcher3D() {
  const { language, setLanguage, setCursorMode } = useStore();
  const toggle = () => setLanguage(language === 'en' ? 'pt' : 'en');
  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-8 lg:bottom-12 lg:right-12 z-[100] w-14 h-14 sm:w-20 sm:h-20 cursor-none" onMouseEnter={() => setCursorMode('magnetic')} onMouseLeave={() => setCursorMode('default')} onClick={toggle}>
      <div className="absolute inset-0 pointer-events-none">
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 4.5], fov: 45 }} gl={{ alpha: true }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
          <SwitcherShape />
          <Environment preset="city" />
        </Canvas>
      </div>
      <div className="absolute top-[105%] left-1/2 -translate-x-1/2 font-mono text-[9px] tracking-widest font-bold text-white/50 w-24 text-center pointer-events-none uppercase transition-colors">
        <span className={language === 'pt' ? 'text-[var(--gold)] opacity-100' : ''}>PT</span>{' / '}<span className={language === 'en' ? 'text-[var(--gold)] opacity-100' : ''}>EN</span>
      </div>
    </div>
  );
});

// [00-D] MENU SYSTEM
function MenuShape({ hoveredIndex }: { hoveredIndex: number | null }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2; meshRef.current.rotation.y += delta * 0.3;
      const targetScale = hoveredIndex !== null ? 1.8 : 1.2;
      tmpVector.set(targetScale, targetScale, targetScale);
      meshRef.current.scale.lerp(tmpVector, 0.05);
    }
  });
  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.5, Math.max(2, hoveredIndex !== null ? hoveredIndex * 8 : 4)]} />
        <MeshDistortMaterial color={hoveredIndex !== null ? "#B08E68" : "#222222"} envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.9} roughness={0.1} distort={hoveredIndex !== null ? 0.5 : 0.2} speed={hoveredIndex !== null ? 4 : 2} />
      </mesh>
    </Float>
  );
}

const Menu3D = memo(function Menu3D({ hoveredIndex }: { hoveredIndex: number | null }) {
  return (
    <div className="absolute inset-0 z-0 pointer-events-auto">
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 6], fov: 45 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#B08E68" />
        <PresentationControls global rotation={[0, 0, 0]} polar={[-Math.PI / 3, Math.PI / 3]} azimuth={[-Math.PI / 1.4, Math.PI / 2]}><MenuShape hoveredIndex={hoveredIndex} /></PresentationControls>
        <Sparkles count={150} scale={12} size={2} speed={0.4} opacity={hoveredIndex !== null ? 0.8 : 0.1} color="#B08E68" />
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
});

const Menu = memo(function Menu() {
  const { language, setCursorMode } = useStore();
  const t = dict[language];
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0); const mouseY = useMotionValue(0);
  const tiltX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 120, damping: 25 });
  const tiltY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 120, damping: 25 });
  useEffect(() => { document.body.style.overflow = isOpen ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [isOpen]);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!menuContainerRef.current) return;
    const rect = menuContainerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5); mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const navTargets = ['#contact', '#services', '#portfolio'];
  const navItems = [t.nav_work, t.nav_services, t.nav_portfolio];
  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} data-link className="fixed top-8 right-8 z-[100] p-4 group mix-blend-difference cursor-none">
        <div className="flex flex-col gap-[6px] w-8">
          <div className={`h-[2px] bg-white transition-transform duration-500 ${isOpen ? 'rotate-45 translate-y-[8px]' : ''}`} />
          <div className={`h-[2px] bg-white transition-opacity duration-300 ${isOpen ? 'opacity-0' : ''}`} />
          <div className={`h-[2px] bg-white transition-transform duration-500 ${isOpen ? '-rotate-45 -translate-y-[8px]' : ''}`} />
        </div>
      </button>
      <div className="fixed inset-0 z-[89] pointer-events-none flex w-full">
        <AnimatePresence>{isOpen && Array.from({ length: 5 }).map((_, i) => (
          <motion.div key={i} custom={i} variants={{ closed: { scaleY: 0 }, open: (i) => ({ scaleY: 1, transition: { duration: 0.8, delay: i * 0.06 } }) }} initial="closed" animate="open" exit="closed" className="h-full bg-[var(--black)] origin-top border-r border-white/5" style={{ width: '20%' }} />
        ))}</AnimatePresence>
      </div>
      <AnimatePresence mode="wait">{isOpen && (
        <motion.div ref={menuContainerRef} onMouseMove={handleMouseMove} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] flex flex-col md:flex-row overflow-hidden bg-transparent">
          <div className="relative w-full md:w-[55%] h-full flex flex-col items-center justify-center px-[var(--gutter)] pt-20 pb-10 z-10 perspective-[1000px]">
            <motion.nav className="flex flex-col items-center gap-1 md:gap-3 relative z-20" style={{ rotateX: tiltX, rotateY: tiltY }}>
              {navItems.map((name, index) => (
                <div key={name} className="overflow-hidden p-1 relative" onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)}>
                  <motion.a href={navTargets[index]} onClick={(e) => { e.preventDefault(); setIsOpen(false); setTimeout(() => document.querySelector(navTargets[index])?.scrollIntoView({ behavior: 'smooth' }), 600); }} data-link className={`group relative block w-full uppercase font-serif font-black leading-[0.85] tracking-tight cursor-none text-center text-[clamp(4rem,7vw,9rem)] transition-all duration-500 ${hoveredIndex !== null && hoveredIndex !== index ? 'opacity-20 blur-[3px]' : 'opacity-100'} ${hoveredIndex === index ? 'z-10 text-[var(--gold)] scale-[1.03]' : 'text-transparent'}`} style={{ WebkitTextStroke: hoveredIndex === index ? 'none' : '1.5px rgba(255,255,255,0.85)' }}>{name}</motion.a>
                </div>
              ))}
            </motion.nav>
          </div>
          <div className="hidden md:block absolute right-0 top-0 w-[45%] h-full border-l border-white/10 overflow-hidden z-[5] bg-[#020202]">
            <Menu3D hoveredIndex={hoveredIndex} />
          </div>
        </motion.div>
      )}</AnimatePresence>
    </>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// [01] WEBGL PARTICLES ENGINE
// ─────────────────────────────────────────────────────────────────────────────

function useWebGL(canvasRef: React.RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; gl.viewport(0, 0, canvas.width, canvas.height); };
    resize();
    window.addEventListener('resize', resize);

    const vSrc = `
      attribute vec2 aPos; attribute float aPhase; attribute float aAmpl;
      uniform float uT; uniform vec2 uMouse;
      void main() {
        float t = uT * 0.38 + aPhase;
        vec2 p = aPos;
        p.y += sin(t) * aAmpl;
        p.x += cos(t * 0.71) * aAmpl * 0.55;
        vec2 d = p - uMouse; float len = length(d);
        if (len < 0.28) p += normalize(d) * (0.28 - len) * 0.2;
        gl_Position = vec4(p, 0.0, 1.0);
        gl_PointSize = mix(1.5, 4.5, aAmpl * 6.0);
      `;
    const fSrc = `
      precision mediump float;
      void main() {
        vec2 c = gl_PointCoord - 0.5; float r = length(c);
        if (r > 0.5) discard;
        float a = (1.0 - r * 2.0) * 0.48;
        gl_FragColor = vec4(0.69, 0.55, 0.40, a);
      `;

    const mkShader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src); gl.compileShader(s); return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, vSrc));
    gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, fSrc));
    gl.linkProgram(prog); gl.useProgram(prog);

    const N = 260;
    const pos = new Float32Array(N * 2), phase = new Float32Array(N), ampl = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      pos[i * 2] = (Math.random() - 0.5) * 2; pos[i * 2 + 1] = (Math.random() - 0.5) * 2;
      phase[i] = Math.random() * Math.PI * 2; ampl[i] = 0.01 + Math.random() * 0.08;
    }

    const mkBuf = (data: Float32Array) => {
      const b = gl.createBuffer()!; gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); return b;
    };
    const bindAttr = (buf: WebGLBuffer, name: string, size: number) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      const loc = gl.getAttribLocation(prog, name);
      gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    };
    bindAttr(mkBuf(pos), 'aPos', 2); bindAttr(mkBuf(phase), 'aPhase', 1); bindAttr(mkBuf(ampl), 'aAmpl', 1);

    const uT = gl.getUniformLocation(prog, 'uT');
    const uMse = gl.getUniformLocation(prog, 'uMouse');
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    let mx = 0, my = 0;
    const onMove = (e: MouseEvent) => { mx = (e.clientX / window.innerWidth) * 2 - 1; my = -((e.clientY / window.innerHeight) * 2 - 1); };
    document.addEventListener('mousemove', onMove);

    let raf: number;
    const t0 = Date.now();
    const tick = () => {
      if (window.scrollY > window.innerHeight * 0.85) { raf = requestAnimationFrame(tick); return; }
      const t = (Date.now() - t0) / 1000;
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uT, t); gl.uniform2f(uMse, mx, my);
      gl.drawArrays(gl.POINTS, 0, N);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); document.removeEventListener('mousemove', onMove); };
  }, [canvasRef]);
}

// ─────────────────────────────────────────────────────────────────────────────
// [02] CURSOR
// ─────────────────────────────────────────────────────────────────────────────

function MythCursor() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 150, damping: 15, mass: 0.5 });
  const sy = useSpring(my, { stiffness: 150, damping: 15, mass: 0.5 });
  const cursorMode = useStore((s) => s.cursorMode);
  const setCursorMode = useStore((s) => s.setCursorMode);

  const previewX = useMotionValue(0);
  const previewY = useMotionValue(0);
  const [previewSrc, setPreviewSrc] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => { mx.set(e.clientX); my.set(e.clientY); };
    window.addEventListener('mousemove', move);

    const bind = (sel: string, enter: (e?: Event) => void, leave: () => void, mover?: (e: MouseEvent) => void) => {
      document.querySelectorAll(sel).forEach(el => {
        el.addEventListener('mouseenter', enter as EventListener);
        el.addEventListener('mouseleave', leave);
        if (mover) el.addEventListener('mousemove', mover as EventListener);
      });
    };

    bind('a:not([data-project]):not([data-cta]), button, [data-link], .nav-link, .footer-socials a', () => setCursorMode('link'), () => setCursorMode('default'));

    bind('[data-project]', (e) => {
      setCursorMode('project');
      const t = (e as MouseEvent).currentTarget as HTMLElement;
      setPreviewSrc(t.dataset.image || '');
      setShowPreview(true);
    }, () => { setCursorMode('default'); setShowPreview(false); },
      (e) => { previewX.set(e.clientX); previewY.set(e.clientY); });

    bind('[data-cta]', () => setCursorMode('cta'), () => setCursorMode('default'));
    bind('[data-magnetic]', () => setCursorMode('magnetic'), () => setCursorMode('default'));

    return () => window.removeEventListener('mousemove', move);
  }, [mx, my, setCursorMode]);

  return (
    <>
      <motion.div className={`myth-cursor${cursorMode !== 'default' ? ` cursor-state-${cursorMode}` : ''}`} style={{ x: sx, y: sy }}>
        <AnimatePresence>
          {cursorMode === 'project' && (
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              style={{ fontFamily: 'var(--sans)', fontSize: '0.45rem', letterSpacing: '0.25em', color: '#000', fontWeight: 600 }}
            >
              VIEW
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showPreview && previewSrc && (
          <motion.div
            className="project-preview"
            initial={{ opacity: 0, scale: 0.82, rotate: -4 }}
            animate={{ opacity: 0.55, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.88, rotate: 4 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            // [120FPS OPTIMIZATION]: Removed top/left binding which causes layout thrashing
            // and replaced with hardware-accelerated translateX/Y strings via motion values.
            style={{ x: previewX, y: previewY, marginLeft: -200, marginTop: -250, willChange: 'transform, opacity' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewSrc} alt="preview" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// [04] ENTRANCE REVEAL
// ─────────────────────────────────────────────────────────────────────────────

function HeroChars({ text, delay = 0, style }: { text: string; delay?: number; style?: React.CSSProperties }) {
  return (
    <span style={style}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          className="hero-char"
          initial={{ y: '110%', opacity: 0, rotate: 6 }}
          animate={{ y: '0%', opacity: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: delay + i * 0.05 }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// [03] 3D CARD TILT
// ─────────────────────────────────────────────────────────────────────────────

function Card3D({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotX = (y - 0.5) * -12;
    const rotY = (x - 0.5) * 12;

    el.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`;
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
  }, []);

  const onMouseLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)';
    el.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)';
    setTimeout(() => { if (el) el.style.transition = ''; }, 650);
  }, []);

  return (
    <div
      ref={cardRef}
      className={`service-card ${className}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// [02] MAGNETIC BUTTON
// ─────────────────────────────────────────────────────────────────────────────

function MagneticWrap({ children, strength = 0.35 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const xMot = useMotionValue(0);
  const yMot = useMotionValue(0);
  const xSpring = useSpring(xMot, { stiffness: 200, damping: 20 });
  const ySpring = useSpring(yMot, { stiffness: 200, damping: 20 });

  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    xMot.set((e.clientX - cx) * strength);
    yMot.set((e.clientY - cy) * strength);
  }, [xMot, yMot, strength]);

  const onLeave = useCallback(() => { xMot.set(0); yMot.set(0); }, [xMot, yMot]);

  return (
    <motion.div
      ref={ref}
      style={{ x: xSpring, y: ySpring, display: 'inline-block' }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      data-magnetic
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MARQUEE
// ─────────────────────────────────────────────────────────────────────────────

function Marquee({ items, reverse = false, isGold = false }: { items: string[]; reverse?: boolean; isGold?: boolean }) {
  const rep = [...items, ...items, ...items, ...items];
  return (
    <div className="marquee-track">
      <div className={`marquee-inner${reverse ? ' reverse' : ''}`}>
        {rep.map((item, i) => (
          <span key={`${i}-${item}`} style={{ display: 'contents' }}>
            <span className={`marquee-item${isGold ? ' marquee-item-gold' : ''}`}>{item}</span>
            <span className={`marquee-item${isGold ? '' : ' marquee-item-gold'}`}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE CURTAIN
// ─────────────────────────────────────────────────────────────────────────────

function PageCurtain() {
  const [visible, setVisible] = useState(true);
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="myth-curtain"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          exit={{ scaleY: 0 }}
          transition={{ duration: 1.4, ease: [0.25, 1, 0.5, 1], delay: 0.1 }}
          style={{ transformOrigin: 'top center', zIndex: 99998 }}
          onAnimationComplete={() => setVisible(false)}
        />
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// [05] MICRO: click ripple hook
// ─────────────────────────────────────────────────────────────────────────────

function useRipple(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
      el.style.position = 'relative';
      el.style.overflow = 'hidden';
      el.appendChild(ripple);
      setTimeout(() => ripple.remove(), 900);
    };
    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler);
  }, [ref]);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const language = useStore((s) => s.language);
  const t = dict[language];

  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const spineFillRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  const setScrollProgress = useStore((s) => s.setScrollProgress);
  const setActiveSection = useStore((s) => s.setActiveSection);

  const [loaded, setLoaded] = useState(false);

  // WebGL Particles
  useWebGL(canvasRef as React.RefObject<HTMLCanvasElement>);

  // CTA ripple
  useRipple(ctaRef as React.RefObject<HTMLElement>);

  // GSAP
  useEffect(() => {
    if (typeof window === 'undefined' || !loaded) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top', end: 'bottom bottom',
        onUpdate: (self) => setScrollProgress(self.progress),
      });

      gsap.utils.toArray('.scroll-section').forEach((sec, i) => {
        ScrollTrigger.create({
          trigger: sec as Element, start: 'top center', end: 'bottom center',
          onEnter: () => setActiveSection(i), onEnterBack: () => setActiveSection(i),
        });
      });

      gsap.fromTo('.hero-subtitle',
        { opacity: 0, filter: 'blur(18px)', y: 18 },
        { opacity: 1, filter: 'blur(0px)', y: 0, duration: 2, ease: 'power3.out', delay: 1.6 }
      );
      gsap.fromTo('.scroll-cue',
        { opacity: 0 },
        { opacity: 1, duration: 1.5, ease: 'power2.out', delay: 2.5 }
      );

      gsap.utils.toArray('.service-card').forEach((el, i) => {
        gsap.fromTo(el as Element,
          { opacity: 0, y: 50 },
          {
            opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: i * 0.15,
            scrollTrigger: { trigger: el as Element, start: 'top 85%' }
          }
        );
      });

      gsap.utils.toArray('.project-row').forEach((el, i) => {
        gsap.fromTo(el as Element,
          { opacity: 0, y: 40, rotateX: -8, transformOrigin: 'top center' },
          {
            opacity: 1, y: 0, rotateX: 0, duration: 1.2, ease: 'power3.out', delay: i * 0.1,
            scrollTrigger: { trigger: el as Element, start: 'top 90%' }
          }
        );
      });

      ScrollTrigger.create({
        trigger: '#portfolio', start: 'top bottom', end: 'bottom top', scrub: true,
        onUpdate: (self) => {
          const el = document.getElementById('portfolio');
          if (el) el.style.transform = `perspective(1400px) rotateX(${(1 - self.progress) * 4}deg)`;
        },
      });

      // Spine progress
      ScrollTrigger.create({
        trigger: '#process', start: 'top center', end: 'bottom center', scrub: true,
        onUpdate: (self) => {
          if (spineFillRef.current) spineFillRef.current.style.height = `${self.progress * 100}%`;
        }
      });

      gsap.utils.toArray('.process-step').forEach((el, i) => {
        gsap.fromTo(el as Element,
          { opacity: 0, x: 30 },
          {
            opacity: 1, x: 0, duration: 1.2, ease: 'power3.out', delay: i * 0.1,
            scrollTrigger: { trigger: el as Element, start: 'top 88%' }
          }
        );
      });

      gsap.fromTo('.cta-title',
        { scale: 0.9, opacity: 0, filter: 'blur(12px)' },
        {
          scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.5, ease: 'power3.out',
          scrollTrigger: { trigger: '#contact', start: 'top 75%' }
        }
      );

      gsap.utils.toArray('.portfolio-heading').forEach(el => {
        gsap.to(el as Element, {
          y: '-10vh', ease: 'none',
          scrollTrigger: { trigger: el as Element, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });

      gsap.utils.toArray('.section-label').forEach(el => {
        gsap.fromTo(el as Element,
          { opacity: 0, x: -20 },
          {
            opacity: 1, x: 0, duration: 1, ease: 'power2.out',
            scrollTrigger: { trigger: el as Element, start: 'top 90%' }
          }
        );
      });

      // Hero Parallax Setup
      gsap.to(heroContentRef.current, {
        y: 200, opacity: 0, filter: 'blur(10px)', ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
      });

    }, containerRef);

    return () => ctx.revert();
  }, [loaded, setScrollProgress, setActiveSection]);

  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal-up, .reveal-clip, .reveal-scale').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <CinematicPreloader onComplete={() => setLoaded(true)} />
      <MythCursor />
      <PageCurtain />

      {/* Grain overlay */}
      <div className="myth-grain" />

      <Menu />
      <LanguageSwitcher3D />

      {/* Global Fixed Navigation */}
      <nav>
        <a href="#hero" className="nav-logo z-[101]" data-link>
          <Image src="/logo/white.png" alt="Myth Agency Logo" width={120} height={40} className="w-24 md:w-28 h-auto object-contain cursor-none" />
        </a>
      </nav>

      <main ref={containerRef} className="relative w-full z-10">

        {/* Preload portfolio hover images */}
        {PROJECTS_DATA.map((p) => (
          <link key={p.index} rel="preload" as="image" href={p.image} />
        ))}

        {/* ═══════════════════════════════ 01 HERO ═══════════════════════════════ */}
        <section id="hero" className="scroll-section hero-section">
          {/* 3D Geometric Background */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            {/* [120FPS OPTIMIZATION]: Added dpr limit to prevent high pixel ratio calculations bottleneck */}
            <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 45 }} gl={{ alpha: true }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
              <HeroScene />
            </Canvas>
          </div>

          {/* WebGL particles */}
          <canvas ref={canvasRef} className="gl-canvas z-10" />

          {/* Background Letter M */}
          <div className="hero-bg-letter">M</div>

          <div ref={heroContentRef} className="hero-content">
            <h1 className="hero-title">
              <span className="hero-title-line">
                <HeroChars text={t.hero_create} delay={0.6} />
              </span>
              <span className="hero-title-line" style={{ marginLeft: 'clamp(2rem, 15vw, 18rem)' }}>
                <HeroChars text={t.hero_your} delay={0.7} style={{ color: 'var(--gold)' }} />
              </span>
              <span className="hero-title-line">
                <HeroChars text={t.hero_legend} delay={0.8} style={{ fontStyle: 'italic' }} />
              </span>
            </h1>

            <div className="hero-subtitle">
              <p dangerouslySetInnerHTML={{ __html: t.hero_desc }} />
            </div>
          </div>

          <a href="#services" className="scroll-cue" onClick={(e) => { e.preventDefault(); document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth' }); }}>
            <span className="scroll-cue-text">{t.hero_scroll}</span>
            <motion.div
              className="scroll-cue-bar"
              animate={{ scaleY: [0, 1, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ height: '40px' }}
            />
          </a>
        </section>

        <Marquee items={t.marquee_words} />

        {/* ═══════════════════════════════ 02 SERVICES ═══════════════════════════ */}
        <section id="services" className="scroll-section services-section">
          <p className="section-label">{t.sec_pillars}</p>

          <h2 className="services-heading" dangerouslySetInnerHTML={{ __html: t.svc_heading1 + '<em>' + t.svc_heading2 + '</em>' + t.svc_heading3 }} />

          <div className="services-grid">
            {t.svc_cards.map((card) => (
              <Card3D key={card.num}>
                <div className="service-num">{card.num} // {t.svc_domain}</div>
                <h3 className="service-title">{card.title}</h3>
                <p className="service-desc">{card.desc}</p>
              </Card3D>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════ 03 PHILOSOPHY ═════════════════════════ */}
        <section id="philosophy" className="scroll-section philosophy-section">
          <h2 className="philosophy-text" dangerouslySetInnerHTML={{ __html: t.phil_text }} />
        </section>

        <Marquee items={t.marquee_projects} reverse isGold />

        {/* ═══════════════════════════════ 04 PORTFOLIO ══════════════════════════ */}
        <section id="portfolio" className="scroll-section w-full">
          <ArchivalPortfolioList />
        </section>

        {/* ═══════════════════════════════ 05 PROCESS ════════════════════════════ */}
        <section id="process" className="scroll-section process-section">
          <p className="section-label" style={{ marginBottom: '4rem' }}>{t.proc_label}</p>

          <div className="process-grid">
            <div className="process-left">
              <h2 className="process-heading" dangerouslySetInnerHTML={{ __html: t.proc_forge }} />
              <p className="process-subtext">
                {t.proc_sub}
              </p>
            </div>

            <div className="process-right">
              <div className="process-spine">
                <div ref={spineFillRef} className="process-spine-fill" style={{ height: '0%' }} />
              </div>
              {t.proc_steps.map((step) => (
                <div key={step.num} className="process-step">
                  <div className="process-dot" />
                  <div className="step-num">{step.num}</div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-body">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════ 06 CONTACT ════════════════════════════ */}
        <section id="contact" className="scroll-section contact-section">
          <p className="contact-label">{t.contact_next}</p>

          <MagneticWrap strength={0.4}>

            <a ref={ctaRef} href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer"
              className="cta-link"
              data-cta
            >
              <h2 className="cta-title">
                <span dangerouslySetInnerHTML={{ __html: t.cta_title1 }} />
                <em style={{ fontStyle: 'italic' }}>{t.cta_title2}</em>
              </h2>
              <div className="cta-sub">
                <span className="cta-rule" />
                {t.cta_start}
                <span className="cta-rule" />
              </div>
            </a>
          </MagneticWrap>

          <div className="contact-footer w-full">
            <div className="flex items-center gap-4 opacity-50">
              <Image src="/logo/white.png" alt="Myth Agency Logo" width={80} height={20} className="w-16 h-auto object-contain" />
              <span>{t.nav_rights}</span>
            </div>
            <div className="footer-socials">
              <MagneticWrap strength={0.3}><a href="#" className="hover:text-white transition-colors" data-link>INSTAGRAM</a></MagneticWrap>
              <MagneticWrap strength={0.3}><a href="#" className="hover:text-white transition-colors" data-link>TWITTER</a></MagneticWrap>
              <MagneticWrap strength={0.3}><a href="#" className="hover:text-white transition-colors" data-link>LINKEDIN</a></MagneticWrap>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}