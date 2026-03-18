//page.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  motion, useMotionValue, useSpring, AnimatePresence,
  useTransform, useScroll,
} from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useStore } from '@/utils/store';
import Menu from '@/components/ui/Menu';
import Image from 'next/image';
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

const PROJECTS: Project[] = [
  { index: 'I', name: 'Agrotóxica', category: 'Identidade Visual · Atlética', year: '2026', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format' },
  { index: 'II', name: 'Embaixada Digital', category: 'Web Design · Landing Page', year: '2025', image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format' },
  { index: 'III', name: 'Manto da Massa', category: 'Design de Camisa · Atlético', year: '2023', image: 'https://images.unsplash.com/photo-1542382257-8024cb5877f2?q=80&w=1200&auto=format' },
];

const MARQUEE_WORDS = [
  'DESIGN ESPORTIVO',
  'IDENTIDADE VISUAL',
  'MOTION DESIGN',
  'DIREÇÃO CRIATIVA'
];
const MARQUEE_PROJECTS = [
  'AGROTÓXICA',
  'MANTO DA MASSA',
  'EMBAIXADA DIGITAL',
  'MYTH STUDIO'
];

const PROCESS_STEPS = [
  {
    num: 'I',
    title: 'Estratégia',
    body: 'Entendemos o projeto, o público e o objetivo da marca. Toda criação começa com clareza.'
  },
  {
    num: 'II',
    title: 'Conceito',
    body: 'Desenvolvemos a ideia central do projeto. Linguagem visual, direção estética e identidade.'
  },
  {
    num: 'III',
    title: 'Design',
    body: 'Transformamos o conceito em peças visuais: identidade, interfaces, motion e sistemas gráficos.'
  },
  {
    num: 'IV',
    title: 'Entrega',
    body: 'Publicação, implementação e acompanhamento. O projeto entra em campo.'
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// [01] SMOOTH LOADER — Plasma Ring
// ─────────────────────────────────────────────────────────────────────────────

function SmoothLoader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let current = 0;
    const intervals = [
      { target: 30, duration: 600 },
      { target: 70, duration: 500 },
      { target: 92, duration: 400 },
      { target: 100, duration: 300 },
    ];

    let idx = 0;
    const step = () => {
      if (idx >= intervals.length) return;
      const { target, duration } = intervals[idx++];
      const start = current;
      const t0 = Date.now();

      const tick = () => {
        const elapsed = Date.now() - t0;
        const p = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        current = start + (target - start) * ease;
        const val = Math.floor(current);
        setProgress(current);
        setPct(val);
        if (p < 1) { requestAnimationFrame(tick); }
        else { current = target; step(); }
      };
      requestAnimationFrame(tick);
    };
    step();

    const completeTimer = setTimeout(() => {
      setDone(true);
      setTimeout(onComplete, 800);
    }, 2000);

    return () => clearTimeout(completeTimer);
  }, [onComplete]);

  // SVG ring math
  const radius = 54;
  const circumference = 2 * Math.PI * radius; // ~339.3
  const dashOffset = circumference - (circumference * progress) / 100;

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="loader-wrap"
          exit={{ scaleY: 0, transformOrigin: 'top center' }}
          transition={{ duration: 1.4, ease: [0.25, 1, 0.5, 1] }}
        >
          <div className="loader-scanlines" />

          {/* Big background M */}
          <div className="loader-bg-letter">M</div>

          {/* ── [SCI-FI] Plasma Orbital Ring ── */}
          <div className="scifi-loader-ring">
            <svg viewBox="0 0 120 120" width="180" height="180" style={{ overflow: 'visible' }}>
              {/* Outer energy orbit */}
              <circle
                cx="60" cy="60" r={radius}
                fill="none"
                stroke="rgba(200,160,80,0.12)"
                strokeWidth="1"
              />
              {/* Plasma fill arc */}
              <circle
                cx="60" cy="60" r={radius}
                fill="none"
                stroke="var(--gold)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: '60px 60px',
                  filter: 'drop-shadow(0 0 6px var(--gold))',
                  transition: 'stroke-dashoffset 0.05s linear',
                }}
              />
              {/* Inner orbit ring */}
              <circle
                cx="60" cy="60" r="36"
                fill="none"
                stroke="rgba(200,160,80,0.07)"
                strokeWidth="0.6"
              />
              {/* Orbiting plasma dot */}
              <circle
                cx="60" cy="6" r="2.8"
                fill="var(--gold)"
                style={{
                  transformOrigin: '60px 60px',
                  animation: 'orbit-dot 1.6s linear infinite',
                  filter: 'drop-shadow(0 0 4px var(--gold))',
                }}
              />
              {/* Counter-orbit dim dot */}
              <circle
                cx="60" cy="114" r="1.6"
                fill="rgba(200,160,80,0.4)"
                style={{
                  transformOrigin: '60px 60px',
                  animation: 'orbit-dot 2.4s linear infinite reverse',
                }}
              />
            </svg>

            {/* Percentage inside ring */}
            <div className="scifi-pct">
              <span className="scifi-pct-num">{pct}</span>
              <span className="scifi-pct-sym">%</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="loader-bar-wrap">
            <div className="loader-bar" style={{ width: `${progress}%` }} />
          </div>

          {/* [SCI-FI] Energy pulse text — no "system" labels */}
          <motion.div
            className="scifi-loader-label"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            ◈ MYTH ◈
          </motion.div>

          {/* Vertical plasma line */}
          <motion.div
            style={{
              position: 'absolute', top: 0, left: '50%',
              width: 1, height: '100%', transform: 'translateX(-50%)',
              background: 'linear-gradient(to bottom, transparent, var(--gold), transparent)',
              opacity: 0.15,
            }}
            animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.05, 0.2, 0.05] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WEBGL PARTICLES
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
      }`;
    const fSrc = `
      precision mediump float;
      void main() {
        vec2 c = gl_PointCoord - 0.5; float r = length(c);
        if (r > 0.5) discard;
        float a = (1.0 - r * 2.0) * 0.48;
        gl_FragColor = vec4(0.78, 0.66, 0.43, a);
      }`;

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
// [02] CURSOR with all states
// ─────────────────────────────────────────────────────────────────────────────

function MythCursor() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const sx = mx;
  const sy = my;

  const [state, setState] = useState<'default' | 'link' | 'project' | 'cta' | 'magnetic'>('default');
  const [previewSrc, setPreviewSrc] = useState('');
  const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 });
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

    bind('a:not([data-project]):not([data-cta]), button, [data-link], .nav-link, .footer-socials a', () => setState('link'), () => setState('default'));

    bind('[data-project]', (e) => {
      setState('project');
      const t = (e as MouseEvent).currentTarget as HTMLElement;
      setPreviewSrc(t.dataset.image || '');
      setShowPreview(true);
    }, () => { setState('default'); setShowPreview(false); },
      (e) => setPreviewPos({ x: e.clientX, y: e.clientY }));

    bind('[data-cta]', () => setState('cta'), () => setState('default'));
    bind('[data-magnetic]', () => setState('magnetic'), () => setState('default'));

    return () => window.removeEventListener('mousemove', move);
  }, [mx, my]);

  return (
    <>
      <motion.div className={`myth-cursor${state !== 'default' ? ` cursor-state-${state}` : ''}`} style={{ x: sx, y: sy }}>
        <AnimatePresence>
          {state === 'project' && (
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              style={{ fontFamily: 'var(--mono)', fontSize: '0.42rem', letterSpacing: '0.25em', color: '#000', fontWeight: 400 }}
            >
              VISUALIZAR
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
            style={{ left: previewPos.x, top: previewPos.y, marginLeft: -190, marginTop: -230 }}
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
// [04] ENTRANCE REVEAL — hero chars
// ─────────────────────────────────────────────────────────────────────────────

function HeroChars({ text, delay = 0, style }: { text: string; delay?: number; style?: React.CSSProperties }) {
  return (
    <span style={style}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          className="hero-char"
          initial={{ y: '110%', opacity: 0, rotate: 4 }}
          animate={{ y: '0%', opacity: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: delay + i * 0.055 }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// [05] MICRO: animated counter
// ─────────────────────────────────────────────────────────────────────────────

function AnimatedCounter({ to, suffix = '', duration = 1800 }: { to: number; suffix?: string; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      const t0 = Date.now();
      const tick = () => {
        const p = Math.min((Date.now() - t0) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setValue(Math.floor(ease * to));
        if (p < 1) requestAnimationFrame(tick);
        else setValue(to);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, duration]);

  return <span ref={ref}>{value}{suffix}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// [07] SCI-FI: Typewriter effect
// ─────────────────────────────────────────────────────────────────────────────

function Typewriter({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { obs.disconnect(); setTimeout(() => setStarted(true), delay * 1000); }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, ++i));
      if (i >= text.length) clearInterval(timer);
    }, 42);
    return () => clearInterval(timer);
  }, [started, text]);

  return (
    <span ref={ref}>
      {displayed}
      {displayed.length < text.length && <span className="typewriter-cursor" />}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// [03] 3D CARD TILT (service cards)
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

    el.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`;
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
  }, []);

  const onMouseLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)';
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
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px;`;
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
          transition={{ duration: 1.6, ease: [0.25, 1, 0.5, 1], delay: 0.1 }}
          style={{ transformOrigin: 'top center', zIndex: 99998 }}
          onAnimationComplete={() => setVisible(false)}
        >
          <motion.div
            style={{ position: 'absolute', top: 0, left: '50%', width: 1, height: '100%', transform: 'translateX(-50%)', background: 'linear-gradient(to bottom, transparent, var(--gold), transparent)' }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: [0, 1, 0] }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// [SCI-FI] PLASMA CORNER EMITTERS — replaces .hud-corner
// ─────────────────────────────────────────────────────────────────────────────

function PlasmaCorners() {
  return (
    <>
      <div className="plasma-corner plasma-corner--tl">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M1 27 L1 1 L27 1" stroke="var(--gold)" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="1" cy="1" r="2.2" fill="var(--gold)" style={{ filter: 'drop-shadow(0 0 4px var(--gold))' }} />
        </svg>
        <span className="plasma-corner-beam plasma-corner-beam--h" />
        <span className="plasma-corner-beam plasma-corner-beam--v" />
      </div>

      <div className="plasma-corner plasma-corner--tr">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M27 27 L27 1 L1 1" stroke="var(--gold)" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="27" cy="1" r="2.2" fill="var(--gold)" style={{ filter: 'drop-shadow(0 0 4px var(--gold))' }} />
        </svg>
        <span className="plasma-corner-beam plasma-corner-beam--h plasma-corner-beam--right" />
        <span className="plasma-corner-beam plasma-corner-beam--v" />
      </div>

      <div className="plasma-corner plasma-corner--bl">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M1 1 L1 27 L27 27" stroke="var(--gold)" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="1" cy="27" r="2.2" fill="var(--gold)" style={{ filter: 'drop-shadow(0 0 4px var(--gold))' }} />
        </svg>
        <span className="plasma-corner-beam plasma-corner-beam--h" />
        <span className="plasma-corner-beam plasma-corner-beam--v plasma-corner-beam--bottom" />
      </div>

      <div className="plasma-corner plasma-corner--br">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M27 1 L27 27 L1 27" stroke="var(--gold)" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="27" cy="27" r="2.2" fill="var(--gold)" style={{ filter: 'drop-shadow(0 0 4px var(--gold))' }} />
        </svg>
        <span className="plasma-corner-beam plasma-corner-beam--h plasma-corner-beam--right" />
        <span className="plasma-corner-beam plasma-corner-beam--v plasma-corner-beam--bottom" />
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// [SCI-FI] WARP SCAN — hero entrance line effect
// ─────────────────────────────────────────────────────────────────────────────

function WarpScan({ delay = 0.8 }: { delay?: number }) {
  return (
    <motion.div
      className="warp-scan-wrap"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
    >
      {/* Horizontal energy line */}
      <motion.div
        className="warp-scan-line"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: [0, 1, 1, 0], opacity: [0, 1, 0.6, 0] }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay, times: [0, 0.3, 0.7, 1] }}
      />
      {/* Glow pulse at start */}
      <motion.div
        className="warp-scan-node"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0, 1.4, 0] }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: delay + 0.1 }}
      />
      {/* Data fragments flying right */}
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="warp-scan-frag"
          initial={{ x: 0, opacity: 0 }}
          animate={{ x: [0, 40 + i * 20], opacity: [0, 0.7, 0] }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: delay + 0.2 + i * 0.08 }}
          style={{ left: `${18 + i * 6}%` }}
        />
      ))}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// [SCI-FI] HOLOGRAPHIC BADGE — replaces hud-chip
// ─────────────────────────────────────────────────────────────────────────────

function HoloBadge({ delay = 0.6 }: { delay?: number }) {
  return (
    <motion.div
      className="holo-badge"
      initial={{ opacity: 0, y: -12, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {/* Left plasma dot */}
      <motion.span
        className="holo-badge-dot"
        animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Shimmer line */}
      <span className="holo-badge-shimmer" />
      {/* Text */}
      <span className="holo-badge-text">MYTH · V2</span>
      {/* Right energy bar */}
      <span className="holo-badge-bar">
        <motion.span
          className="holo-badge-bar-fill"
          animate={{ scaleX: [0.2, 1, 0.2] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: 'left center' }}
        />
      </span>
      {/* Corner accent */}
      <span className="holo-badge-corner" />
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroMRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const spineFillRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  const setScrollProgress = useStore((s) => s.setScrollProgress);
  const setActiveSection = useStore((s) => s.setActiveSection);

  const [loaded, setLoaded] = useState(false);

  // [03] Hero 3D mouse tilt
  const heroMouseX = useMotionValue(0);
  const heroMouseY = useMotionValue(0);
  const tiltX = useSpring(useTransform(heroMouseY, [-0.5, 0.5], [12, -12]), { stiffness: 160, damping: 35 });
  const tiltY = useSpring(useTransform(heroMouseX, [-0.5, 0.5], [-12, 12]), { stiffness: 160, damping: 35 });

  const handleHeroMouseMove = useCallback((e: React.MouseEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    heroMouseX.set((e.clientX - r.left) / r.width - 0.5);
    heroMouseY.set((e.clientY - r.top) / r.height - 0.5);
  }, [heroMouseX, heroMouseY]);

  // WebGL
  useWebGL(canvasRef as React.RefObject<HTMLCanvasElement>);

  // CTA ripple
  useRipple(ctaRef as React.RefObject<HTMLElement>);

  // [06] Scroll-driven parallax (raw, no GSAP)
  useEffect(() => {
    const heroM = heroMRef.current;
    const heroCont = heroContentRef.current;
    const spine = spineFillRef.current;
    const orb1 = orb1Ref.current;
    const orb2 = orb2Ref.current;

    const onScroll = () => {
      const sy = window.scrollY;
      const vh = window.innerHeight;

      if (heroM) heroM.style.transform = `translate(-50%, calc(-50% + ${sy * 0.22}px))`;

      if (heroCont) {
        const prog = Math.min(sy / vh, 1);
        heroCont.style.transform = `translateY(${-sy * 0.28}px)`;
        heroCont.style.opacity = String(Math.max(0, 1 - prog * 1.65));
      }

      if (orb1) orb1.style.transform = `translateY(${sy * 0.18}px)`;
      if (orb2) orb2.style.transform = `translateY(${-sy * 0.12}px)`;

      if (spine) {
        const processEl = document.getElementById('process');
        if (processEl) {
          const rect = processEl.getBoundingClientRect();
          const pct = 1 - Math.max(0, Math.min(1, rect.bottom / (vh + processEl.offsetHeight)));
          spine.style.height = `${pct * 100}%`;
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
        { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.8, ease: 'power3.out', delay: 1.5 }
      );
      gsap.fromTo('.scroll-cue',
        { opacity: 0 },
        { opacity: 0.45, duration: 1.2, ease: 'power2.out', delay: 2.4 }
      );
      gsap.fromTo('.hero-stats',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 2 }
      );

      gsap.utils.toArray('.service-card').forEach((el, i) => {
        gsap.fromTo(el as Element,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', delay: i * 0.1,
            scrollTrigger: { trigger: el as Element, start: 'top 88%' }
          }
        );
      });

      gsap.utils.toArray('.project-row').forEach((el, i) => {
        gsap.fromTo(el as Element,
          { opacity: 0, y: 32, rotateX: -8, transformOrigin: 'top center' },
          {
            opacity: 1, y: 0, rotateX: 0, duration: 1.1, ease: 'power3.out', delay: i * 0.12,
            scrollTrigger: { trigger: el as Element, start: 'top 90%' }
          }
        );
      });

      ScrollTrigger.create({
        trigger: '#portfolio', start: 'top bottom', end: 'bottom top', scrub: true,
        onUpdate: (self) => {
          const el = document.getElementById('portfolio');
          if (el) el.style.transform = `perspective(1400px) rotateX(${(1 - self.progress) * 3.2}deg)`;
        },
      });

      gsap.utils.toArray('.process-step').forEach((el, i) => {
        gsap.fromTo(el as Element,
          { opacity: 0, x: 24 },
          {
            opacity: 1, x: 0, duration: 1, ease: 'power3.out', delay: i * 0.14,
            scrollTrigger: { trigger: el as Element, start: 'top 88%' }
          }
        );
      });

      gsap.fromTo('.cta-title',
        { scale: 0.88, opacity: 0, filter: 'blur(12px)' },
        {
          scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.4, ease: 'power3.out',
          scrollTrigger: { trigger: '#contact', start: 'top 75%' }
        }
      );

      gsap.to('.contact-rays', { rotation: 360, duration: 90, ease: 'none', repeat: -1 });

      gsap.utils.toArray('.portfolio-heading').forEach(el => {
        gsap.to(el as Element, {
          y: '-8vh', ease: 'none',
          scrollTrigger: { trigger: el as Element, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });

      gsap.utils.toArray('.section-label').forEach(el => {
        gsap.fromTo(el as Element,
          { opacity: 0, x: -16 },
          {
            opacity: 1, x: 0, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: el as Element, start: 'top 90%' }
          }
        );
      });

    }, containerRef);

    return () => ctx.revert();
  }, [loaded, setScrollProgress, setActiveSection]);

  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.07, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal-up, .reveal-clip, .reveal-scale').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* [01] Smooth Loader — plasma ring variant */}
      <SmoothLoader onComplete={() => setLoaded(true)} />

      <MythCursor />
      <PageCurtain />

      {/* [07] Scanlines overlay */}
      <div className="myth-scanlines" />
      {/* Grain */}
      <div className="myth-grain" />

      <Menu />

      {/* Global Fixed Navigation */}
      <nav>
        <a href="#hero" className="nav-logo z-[101]" data-link>
          <Image src="/logo/white.png" alt="Myth Agency Logo" width={120} height={40} className="w-24 md:w-28 h-auto object-contain cursor-none" />
        </a>
      </nav>

      <main ref={containerRef} className="relative w-full z-10" style={{ background: 'var(--black)', color: 'var(--white)' }}>

        {/* ═══════════════════════════════ 01 HERO ═══════════════════════════════ */}
        <section
          id="hero"
          className="scroll-section hero-section"
          onMouseMove={handleHeroMouseMove}
        >
          {/* [SCI-FI] Plasma corner emitters */}
          <PlasmaCorners />

          {/* WebGL particles */}
          <canvas ref={canvasRef} className="gl-canvas" />

          {/* [06] Parallax orbs */}
          <div ref={orb1Ref} className="hero-orb hero-orb--1" />
          <div ref={orb2Ref} className="hero-orb hero-orb--2" />

          {/* [SCI-FI] Quantum energy grid lines */}
          <div className="quantum-grid" aria-hidden="true">
            <div className="quantum-grid-h" />
            <div className="quantum-grid-h quantum-grid-h--2" />
            <div className="quantum-grid-v" />
          </div>

          {/* [03] 3D tilt on background M */}
          <motion.div
            ref={heroMRef}
            className="hero-bg-letter"
            style={{ rotateX: tiltX, rotateY: tiltY }}
          >
            M
          </motion.div>

          {/* [07] Sci-fi glitch line */}
          <div className="hero-glitch-line" />

          <div ref={heroContentRef} className="hero-content">

            {/* [SCI-FI] Holographic badge — replaces hud-chip */}
            <div style={{ marginBottom: '1.5rem' }}>
              <HoloBadge delay={0.6} />
            </div>

            {/* [SCI-FI] Warp scan entrance — replaces eyebrow with location text */}
            <WarpScan delay={0.9} />

            {/* [04] Char-by-char entrance reveal */}
            <h1 className="hero-title">
              <span className="hero-title-line">
                <HeroChars text="Myth" delay={0.7} style={{ color: 'var(--gold)', fontStyle: 'italic' }} />
              </span>
              <span className="hero-title-line" style={{ marginLeft: 'clamp(3rem, 10vw, 12rem)' }}>
                <HeroChars text="Agency" delay={0.82} />
              </span>
            </h1>

            {/* Subtitle */}
            <div className="hero-subtitle">
              <p>
                Arquitetura digital de alto contraste.<br />
                Forjamos experiências estéticas absolutas,<br />
                desafiando a gravidade e o ordinário.<br />
                Para marcas que desejam transcender.
              </p>
            </div>

            {/* [05] Micro: animated stats */}
            <div className="hero-stats">
              {[
                { n: 2, suffix: '+', label: 'Projetos' },
                { n: 100, suffix: '%', label: 'Custom' },
                { n: 1, suffix: ' Sites', label: 'Desenvolvidos' }
              ].map((s) => (
                <div key={s.label} className="stat-item">
                  <span className="stat-number">
                    <AnimatedCounter to={s.n} suffix={s.suffix} />
                  </span>
                  <span className="stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll cue */}
          <div className="scroll-cue">
            <span className="scroll-cue-text">Rolar</span>
            <motion.div
              className="scroll-cue-bar"
              animate={{ scaleY: [0, 1, 0], y: [0, 0, 22] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </section>

        <Marquee items={MARQUEE_WORDS} />

        {/* ═══════════════════════════════ 02 SERVICES ═══════════════════════════ */}
        <section id="services" className="scroll-section services-section">
          {/* [SCI-FI] Plasma corners */}
          <div className="plasma-corner plasma-corner--tr">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M27 27 L27 1 L1 1" stroke="var(--gold)" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="27" cy="1" r="2.2" fill="var(--gold)" style={{ filter: 'drop-shadow(0 0 4px var(--gold))' }} />
            </svg>
          </div>

          <p className="section-label">— O Rito / 02</p>

          <h2 className="services-heading">
            Elevando marcas através<br />
            da tensão entre <em>espaço estrutural</em><br />
            e estética brutalista.
          </h2>

          {/* [03] 3D tilt cards */}
          <div className="services-grid">
            {[
              { num: '01', title: ['Identidade', 'Divina'], desc: 'Design de logotipos e sistemas visuais minimalistas com impacto máximo. Cada símbolo é um manifesto.' },
              { num: '02', title: ['Interfaces', '3D'], desc: 'Experiências web imersivas integrando WebGL e geometrias tridimensionais que habitam o espaço digital.' },
              { num: '03', title: ['Motion', 'Cinematic'], desc: 'Interações em tempo real que parecem respirar sob os dedos do usuário. Movimento como linguagem.' },
              { num: '04', title: ['E-Commerce', 'Elevado'], desc: 'Plataformas de venda que convertem através do desejo estético. Beleza a serviço da conversão.' },
            ].map((card) => (
              <Card3D key={card.num}>
                <div className="service-num">{card.num} // SISTEMA</div>
                <h3 className="service-title">
                  {card.title.map((l, i) => <span key={i} style={{ display: 'block' }}>{l}</span>)}
                </h3>
                <p className="service-desc">{card.desc}</p>
              </Card3D>
            ))}
          </div>
        </section>

        <Marquee items={MARQUEE_PROJECTS} reverse isGold />

        {/* ═══════════════════════════════ 03 PORTFOLIO ══════════════════════════ */}
        <section id="portfolio" className="scroll-section portfolio-section">
          <p className="portfolio-count">— Obras / 03</p>

          <h2 className="portfolio-heading" data-text="Port" style={{ position: 'relative' }}>
            <span className="glitch-text" data-text="Port">Port</span>
            <br /><em>fólio</em>
          </h2>

          <div className="project-list">
            {PROJECTS.map((project) => (
              <a
                key={project.index}
                href="#"
                className="project-row"
                data-project
                data-image={project.image}
                style={{ display: 'flex' }}
              >
                <div className="project-row-wash" />
                <div className="project-index">{project.index}</div>
                <div className="project-name">{project.name}</div>
                <div className="project-meta">
                  <span className="project-category">{project.category}</span>
                  <span className="project-year">{project.year}</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════ 04 PROCESS ════════════════════════════ */}
        <section id="process" className="scroll-section process-section">
          {/* [SCI-FI] Plasma corner */}
          <div className="plasma-corner plasma-corner--bl">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M1 1 L1 27 L27 27" stroke="var(--gold)" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="1" cy="27" r="2.2" fill="var(--gold)" style={{ filter: 'drop-shadow(0 0 4px var(--gold))' }} />
            </svg>
          </div>

          <div className="process-grid">
            <div className="process-left">
              <h2 className="process-heading">
                A<br /><em>Forja</em>.
              </h2>
              <p className="process-subtext" style={{ fontStyle: 'italic', fontFamily: 'var(--mono)', fontSize: '0.78rem', letterSpacing: '0.05em' }}>
                <Typewriter text="Nosso processo é um rito. Rejeitamos o template. Exigimos o autêntico." delay={0.3} />
              </p>
            </div>

            <div className="process-right">
              <div className="process-spine">
                <div ref={spineFillRef} className="process-spine-fill" style={{ height: '0%' }} />
              </div>
              {PROCESS_STEPS.map((step) => (
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

        {/* ═══════════════════════════════ 05 CONTACT ════════════════════════════ */}
        <section id="contact" className="scroll-section contact-section">
          {/* [SCI-FI] Plasma corners on contact */}
          <PlasmaCorners />

          <div className="contact-rays" />
          <p className="contact-label">O Próximo Passo</p>

          {/* [02] Magnetic CTA */}
          <MagneticWrap strength={0.4}>
            <a
              ref={ctaRef}
              href="mailto:contato@mythagency.com"
              className="cta-link"
              data-cta
            >
              <h2 className="cta-title">
                Criar<br />
                <em style={{ fontStyle: 'italic' }}>O Mito</em>
              </h2>
              <div className="cta-sub">
                <span className="cta-rule" />
                INICIAR PROJETO
                <span className="cta-rule" />
              </div>
            </a>
          </MagneticWrap>

          <div className="contact-footer flex items-center justify-between w-full px-[var(--gutter)] border-t border-white/10 pt-4">
            <div className="flex items-center gap-4 opacity-50">
              <Image src="/logo/white.png" alt="Myth Agency Logo" width={80} height={20} className="w-16 h-auto object-contain" />
              <span style={{ fontFamily: 'var(--sans)', fontSize: '0.5rem', letterSpacing: '0.3em' }}>
                © 2026
              </span>
            </div>
            <div className="footer-socials flex gap-4 text-[0.6rem] tracking-[0.2em] font-sans opacity-70">
              <a href="#" className="hover:text-white transition-colors" data-link>INSTAGRAM</a>
              <a href="#" className="hover:text-white transition-colors" data-link>TWITTER</a>
              <a href="#" className="hover:text-white transition-colors" data-link>LINKEDIN</a>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}