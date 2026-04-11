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
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { 
  Float, Icosahedron, MeshDistortMaterial, Environment, 
  Sparkles, Stars, PresentationControls, Preload,
  shaderMaterial
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import LottiePreloader from '@/components/ui/LottiePreloader';
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


// [120FPS OPTIMIZATION]: Pre-allocated vector to prevent GC stutters.
const tmpVector = new THREE.Vector3();

// ─────────────────────────────────────────────────────────────────────────────
// [00] HERO SCENE SHADERS & PARTICLES
// ─────────────────────────────────────────────────────────────────────────────

/** Pulsing gold rim shader for the inner icosahedron */
const GoldPulseShaderMaterial = shaderMaterial(
  { uTime: 0, uColor: new THREE.Color('#B08E68'), uRimColor: new THREE.Color('#FFD9A0'), uPulse: 0.0 },
  // vertex
  `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // fragment
  `
    uniform float uTime;
    uniform vec3 uColor;
    uniform vec3 uRimColor;
    uniform float uPulse;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    void main() {
      vec3 viewDir = normalize(-vPosition);
      float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
      rim = pow(rim, 2.2);
      float pulse = 0.5 + 0.5 * sin(uTime * 2.0 + vUv.y * 6.28);
      vec3 col = mix(uColor, uRimColor, rim);
      col += uRimColor * rim * pulse * 0.6;
      float fresnel = pow(rim, 1.2) * (0.6 + uPulse * 0.4);
      gl_FragColor = vec4(col, fresnel + 0.12);
    }
  `
);
extend({ GoldPulseShaderMaterial });

// TypeScript: teach R3F about the custom shader material element
declare module '@react-three/fiber' {
  interface ThreeElements {
    goldPulseShaderMaterial: THREE.ShaderMaterial & {
      uTime?: number;
      uColor?: THREE.Color;
      uRimColor?: THREE.Color;
      uPulse?: number;
    } & JSX.IntrinsicElements['mesh'];
  }
}

/** Orbiting particle that traces an ellipse around the icosahedron */
function OrbitParticle({
  radius = 3, speed = 1, phase = 0, yTilt = 0, size = 0.04, color = '#B08E68'
}: {
  radius?: number; speed?: number; phase?: number;
  yTilt?: number; size?: number; color?: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * speed + phase;
    meshRef.current.position.set(
      Math.cos(t) * radius,
      Math.sin(t * 0.5) * radius * Math.sin(yTilt),
      Math.sin(t) * radius
    );
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 6, 6]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </mesh>
  );
}

/** Thin orbit ring (torus) — rotates independently */
function OrbitRing({
  radius = 2.8, tube = 0.006, color = '#B08E68', rotX = 0, rotY = 0, rotZ = 0, spinSpeed = 0.15, opacity = 0.35
}: {
  radius?: number; tube?: number; color?: string;
  rotX?: number; rotY?: number; rotZ?: number;
  spinSpeed?: number; opacity?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * spinSpeed * 0.4;
    ref.current.rotation.y += delta * spinSpeed;
    ref.current.rotation.z += delta * spinSpeed * 0.2;
  });
  return (
    <mesh ref={ref} rotation={[rotX, rotY, rotZ]}>
      <torusGeometry args={[radius, tube, 6, 80]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

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
  // Split words to manage spacing cleanly during animations
  const words = text.split(' ');
  return (
    <span style={style} className="flex flex-wrap">
      <AnimatePresence mode="popLayout">
        {words.map((word, wIdx) => (
          <span key={`${word}-${wIdx}`} className="inline-flex mr-[0.25em]">
            {word.split('').map((char, i) => (
              <motion.span
                key={`${word}-${wIdx}-${i}`}
                className="hero-char"
                initial={{ y: '110%', opacity: 0, rotate: 6 }}
                animate={{ y: '0%', opacity: 1, rotate: 0 }}
                exit={{ y: '-110%', opacity: 0, rotate: -6 }}
                transition={{ 
                  duration: 0.8, 
                  ease: [0.16, 1, 0.3, 1], 
                  delay: delay + i * 0.03 
                }}
              >
                {char}
              </motion.span>
            ))}
          </span>
        ))}
      </AnimatePresence>
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
      <LottiePreloader onComplete={() => setLoaded(true)} />
      <MythCursor />

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

      <main ref={containerRef} className="relative w-full">

        {/* Preload portfolio hover images */}
        {PROJECTS_DATA.map((p) => (
          <link key={p.index} rel="preload" as="image" href={p.image} />
        ))}

        {/* ═══════════════════════════════ 01 HERO ═══════════════════════════════ */}
        <section id="hero" className="scroll-section hero-section">
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