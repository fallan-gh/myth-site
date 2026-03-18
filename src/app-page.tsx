"use client";

import {
  useEffect, useRef, useState, useCallback,
} from 'react';
import Image from 'next/image';
import {
  motion, useMotionValue, useSpring, AnimatePresence,
  useTransform,
} from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useStore } from '@/utils/store';
import { ASSETS } from '@/utils/assets';
import Menu from '@/components/ui/Menu';
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

interface ServiceCard {
  num: string;
  title: string[];
  desc: string;
}

interface ProcessStep {
  num: string;
  title: string;
  body: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const PROJECTS: Project[] = [
  {
    index: 'I',
    name: 'Agrotóxica',
    category: 'Identidade Visual · Atlética',
    year: '2026',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format',
  },
  {
    index: 'II',
    name: 'Embaixada Digital',
    category: 'Web Design · Landing Page',
    year: '2025',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format',
  },
  {
    index: 'III',
    name: 'Manto da Massa',
    category: 'Design de Camisa · Atlético',
    year: '2023',
    image: 'https://images.unsplash.com/photo-1542382257-8024cb5877f2?q=80&w=1200&auto=format',
  },
];

const SERVICES: ServiceCard[] = [
  {
    num: '01',
    title: ['Identidade', 'Divina'],
    desc: 'Design de logotipos e sistemas visuais de alto contraste. Cada símbolo é um manifesto.',
  },
  {
    num: '02',
    title: ['Interfaces', '3D'],
    desc: 'Experiências web imersivas com WebGL e geometrias que habitam o espaço digital.',
  },
  {
    num: '03',
    title: ['Motion', 'Cinematic'],
    desc: 'Interações em tempo real que parecem respirar. Movimento como linguagem da marca.',
  },
  {
    num: '04',
    title: ['E-Commerce', 'Elevado'],
    desc: 'Plataformas de venda que convertem pelo desejo estético. Beleza a serviço da conversão.',
  },
];

const PROCESS_STEPS: ProcessStep[] = [
  {
    num: 'I',
    title: 'Estratégia',
    body: 'Entendemos o projeto, o público e o objetivo da marca. Toda criação começa com clareza.',
  },
  {
    num: 'II',
    title: 'Conceito',
    body: 'Desenvolvemos a ideia central do projeto. Linguagem visual, direção estética e identidade.',
  },
  {
    num: 'III',
    title: 'Design',
    body: 'Transformamos o conceito em peças visuais: identidade, interfaces, motion e sistemas gráficos.',
  },
  {
    num: 'IV',
    title: 'Entrega',
    body: 'Publicação, implementação e acompanhamento. O projeto entra em campo.',
  },
];

const MARQUEE_WORDS = ['DESIGN ESPORTIVO', 'IDENTIDADE VISUAL', 'MOTION DESIGN', 'DIREÇÃO CRIATIVA'];
const MARQUEE_PROJECTS = ['AGROTÓXICA', 'MANTO DA MASSA', 'EMBAIXADA DIGITAL', 'MYTH STUDIO'];

// ─────────────────────────────────────────────────────────────────────────────
// [01] SMOOTH LOADER — Plasma Ring
// ─────────────────────────────────────────────────────────────────────────────

function SmoothLoader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let current = 0;
    const segments = [
      { target: 32, duration: 520 },
      { target: 72, duration: 450 },
      { target: 93, duration: 370 },
      { target: 100, duration: 270 },
    ];
    let idx = 0;

    const step = () => {
      if (idx >= segments.length) return;
      const { target, duration } = segments[idx++];
      const start = current;
      const t0 = Date.now();
      const tick = () => {
        const p = Math.min((Date.now() - t0) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        current = start + (target - start) * ease;
        setProgress(current);
        setPct(Math.floor(current));
        if (p < 1) requestAnimationFrame(tick);
        else { current = target; step(); }
      };
      requestAnimationFrame(tick);
    };
    step();

    const timer = setTimeout(() => {
      setDone(true);
      setTimeout(onComplete, 850);
    }, 2100);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const radius = 56;
  const circumference = 2 * Math.PI * radius;
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
          <div className="loader-bg-letter">M</div>

          <div className="scifi-loader-ring">
            <svg viewBox="0 0 120 120" width="190" height="190" style={{ overflow: 'visible' }}>
              <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(176,142,104,0.1)" strokeWidth="1" />
              <circle
                cx="60" cy="60" r={radius}
                fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: '60px 60px',
                  filter: 'drop-shadow(0 0 6px var(--gold))',
                  transition: 'stroke-dashoffset 0.06s linear',
                }}
              />
              <circle cx="60" cy="4" r="3" fill="var(--gold)"
                style={{
                  transformOrigin: '60px 60px',
                  animation: 'orbit-dot 1.6s linear infinite',
                  filter: 'drop-shadow(0 0 4px var(--gold))',
                }}
              />
              <circle cx="60" cy="116" r="1.6" fill="rgba(176,142,104,0.4)"
                style={{ transformOrigin: '60px 60px', animation: 'orbit-dot 2.4s linear infinite reverse' }}
              />
            </svg>
            <div className="scifi-pct">
              <span className="scifi-pct-num">{pct}</span>
              <span className="scifi-pct-sym">%</span>
            </div>
          </div>

          <div className="loader-bar-wrap">
            <div className="loader-bar" style={{ width: `${progress}%` }} />
          </div>

          <motion.div
            className="scifi-loader-label"
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            ◈ MYTH ◈
          </motion.div>

          <motion.div
            style={{
              position: 'absolute', top: 0, left: '50%',
              width: 1, height: '100%', transform: 'translateX(-50%)',
              background: 'linear-gradient(to bottom, transparent, var(--gold), transparent)',
              opacity: 0.14,
            }}
            animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.04, 0.18, 0.04] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
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
          transition={{ duration: 1.6, ease: [0.25, 1, 0.5, 1], delay: 0.1 }}
          style={{ transformOrigin: 'top center' }}
          onAnimationComplete={() => setVisible(false)}
        />
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

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const vSrc = `
      attribute vec2 aPos; attribute float aPhase; attribute float aAmpl;
      uniform float uT;
      void main() {
        float t = uT * 0.35 + aPhase;
        vec2 p = aPos;
        p.y += sin(t) * aAmpl;
        p.x += cos(t * 0.71) * aAmpl * 0.52;
        gl_Position = vec4(p, 0.0, 1.0);
        gl_PointSize = mix(1.5, 4.5, aAmpl * 7.0);
      }`;
    const fSrc = `
      precision mediump float;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        if (length(c) > 0.5) discard;
        float a = (1.0 - length(c) * 2.0) * 0.42;
        gl_FragColor = vec4(0.69, 0.56, 0.41, a);
      }`;

    const mkShader = (type: number, src: string): WebGLShader => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const prog = gl.createProgram()!;
    gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, vSrc));
    gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, fSrc));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const N = 200;
    const pos = new Float32Array(N * 2);
    const phase = new Float32Array(N);
    const ampl = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      pos[i * 2] = (Math.random() - 0.5) * 2;
      pos[i * 2 + 1] = (Math.random() - 0.5) * 2;
      phase[i] = Math.random() * Math.PI * 2;
      ampl[i] = 0.01 + Math.random() * 0.08;
    }

    const mkBuf = (data: Float32Array): WebGLBuffer => {
      const b = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      return b;
    };
    const bindAttr = (buf: WebGLBuffer, name: string, size: number) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      const loc = gl.getAttribLocation(prog, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    };
    bindAttr(mkBuf(pos), 'aPos', 2);
    bindAttr(mkBuf(phase), 'aPhase', 1);
    bindAttr(mkBuf(ampl), 'aAmpl', 1);

    const uT = gl.getUniformLocation(prog, 'uT');
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    const t0 = Date.now();
    let raf: number;
    const tick = () => {
      if (window.scrollY > window.innerHeight * 0.9) {
        raf = requestAnimationFrame(tick);
        return;
      }
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uT, (Date.now() - t0) / 1000);
      gl.drawArrays(gl.POINTS, 0, N);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef]);
}

// ─────────────────────────────────────────────────────────────────────────────
// [02] CURSOR
// ─────────────────────────────────────────────────────────────────────────────

function MythCursor() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const [state, setState] = useState<'default' | 'link' | 'project' | 'cta' | 'magnetic'>('default');
  const [previewSrc, setPreviewSrc] = useState('');
  const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 });
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => { mx.set(e.clientX); my.set(e.clientY); };
    window.addEventListener('mousemove', move);

    const bind = (
      sel: string,
      enter: (e?: Event) => void,
      leave: () => void,
      mover?: (e: MouseEvent) => void,
    ) => {
      document.querySelectorAll(sel).forEach((el) => {
        el.addEventListener('mouseenter', enter as EventListener);
        el.addEventListener('mouseleave', leave);
        if (mover) el.addEventListener('mousemove', mover as EventListener);
      });
    };

    bind(
      'a:not([data-project]):not([data-cta]), button, [data-link], .nav-link, .footer-socials a',
      () => setState('link'),
      () => setState('default'),
    );
    bind(
      '[data-project]',
      (e) => {
        setState('project');
        const t = (e as MouseEvent).currentTarget as HTMLElement;
        setPreviewSrc(t.dataset.image || '');
        setShowPreview(true);
      },
      () => { setState('default'); setShowPreview(false); },
      (e) => setPreviewPos({ x: e.clientX, y: e.clientY }),
    );
    bind('[data-cta]', () => setState('cta'), () => setState('default'));
    bind('[data-magnetic]', () => setState('magnetic'), () => setState('default'));

    return () => window.removeEventListener('mousemove', move);
  }, [mx, my]);

  return (
    <>
      <motion.div
        className={`myth-cursor${state !== 'default' ? ` cursor-state-${state}` : ''}`}
        style={{ x: mx, y: my }}
      >
        <AnimatePresence>
          {state === 'project' && (
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{ fontFamily: 'var(--mono)', fontSize: '0.4rem', letterSpacing: '0.25em', color: '#000' }}
            >
              VER
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
            style={{ left: previewPos.x, top: previewPos.y, marginLeft: -180, marginTop: -220 }}
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
// [04] HERO CHAR ENTRANCE
// ─────────────────────────────────────────────────────────────────────────────

function HeroChars({
  text, delay = 0, style,
}: {
  text: string; delay?: number; style?: React.CSSProperties;
}) {
  return (
    <span style={style}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          className="hero-char"
          initial={{ y: '110%', opacity: 0, rotate: 3 }}
          animate={{ y: '0%', opacity: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: delay + i * 0.055 }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// [05] ANIMATED COUNTER
// ─────────────────────────────────────────────────────────────────────────────

function AnimatedCounter({ to, suffix = '', duration = 1800 }: {
  to: number; suffix?: string; duration?: number;
}) {
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
        setValue(Math.floor((1 - Math.pow(1 - p, 3)) * to));
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
// [07] TYPEWRITER
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
// [03] 3D CARD TILT
// ─────────────────────────────────────────────────────────────────────────────

function Card3D({ children }: { children: React.ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(800px) rotateX(${(y - 0.5) * -11}deg) rotateY(${(x - 0.5) * 11}deg) scale3d(1.02,1.02,1.02)`;
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
    <div ref={cardRef} className="service-card" onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
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
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    xMot.set((e.clientX - (r.left + r.width / 2)) * strength);
    yMot.set((e.clientY - (r.top + r.height / 2)) * strength);
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

function Marquee({ items, reverse = false, isGold = false }: {
  items: string[]; reverse?: boolean; isGold?: boolean;
}) {
  const rep = [...items, ...items, ...items, ...items];
  return (
    <div className="marquee-track">
      <div className={`marquee-inner${reverse ? ' reverse' : ''}`}>
        {[...rep, ...rep].map((item, i) => (
          <span key={i} style={{ display: 'contents' }}>
            <span className={`marquee-item${isGold ? ' marquee-item-gold' : ''}`}>{item}</span>
            <span className={`marquee-item${isGold ? '' : ' marquee-item-gold'}`}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// [05] RIPPLE HOOK
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
// HOLOGRAPHIC BADGE
// ─────────────────────────────────────────────────────────────────────────────

function HoloBadge({ delay = 0.6 }: { delay?: number }) {
  return (
    <motion.div
      className="holo-badge"
      initial={{ opacity: 0, y: -12, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay }}
    >
      <motion.span
        className="holo-badge-dot"
        animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span className="holo-badge-shimmer" />
      <span className="holo-badge-text">MYTH · V2</span>
      <span className="holo-badge-bar">
        <motion.span
          className="holo-badge-bar-fill"
          animate={{ scaleX: [0.2, 1, 0.2] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: 'left center' }}
        />
      </span>
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
  const hero3dBgRef = useRef<HTMLDivElement>(null);
  const heroLetterformRef = useRef<HTMLImageElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const spineFillRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  const [loaded, setLoaded] = useState(false);

  const setScrollProgress = useStore((s) => s.setScrollProgress);
  const setActiveSection = useStore((s) => s.setActiveSection);

  // [03] Hero 3D mouse tilt
  const heroMouseX = useMotionValue(0);
  const heroMouseY = useMotionValue(0);
  const tiltX = useSpring(useTransform(heroMouseY, [-0.5, 0.5], [10, -10]), { stiffness: 160, damping: 35 });
  const tiltY = useSpring(useTransform(heroMouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 160, damping: 35 });

  const handleHeroMouseMove = useCallback((e: React.MouseEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    heroMouseX.set((e.clientX - r.left) / r.width - 0.5);
    heroMouseY.set((e.clientY - r.top) / r.height - 0.5);
  }, [heroMouseX, heroMouseY]);

  useWebGL(canvasRef as React.RefObject<HTMLCanvasElement>);
  useRipple(ctaRef as React.RefObject<HTMLElement>);

  // [06] Scroll parallax
  useEffect(() => {
    const hero3dBg = hero3dBgRef.current;
    const heroLetterform = heroLetterformRef.current;
    const heroContent = heroContentRef.current;
    const spine = spineFillRef.current;
    const orb1 = orb1Ref.current;
    const orb2 = orb2Ref.current;

    const onScroll = () => {
      const sy = window.scrollY;
      const vh = window.innerHeight;

      if (hero3dBg) hero3dBg.style.transform = `translateY(${sy * 0.15}px)`;
      if (heroLetterform) heroLetterform.style.transform = `translateY(${sy * 0.07}px)`;

      if (heroContent) {
        const prog = Math.min(sy / vh, 1);
        heroContent.style.transform = `translateY(${-sy * 0.28}px)`;
        heroContent.style.opacity = String(Math.max(0, 1 - prog * 1.7));
      }

      if (orb1) orb1.style.transform = `translateY(${sy * 0.16}px)`;
      if (orb2) orb2.style.transform = `translateY(${-sy * 0.1}px)`;

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

  // GSAP ScrollTrigger
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
          onEnter: () => setActiveSection(i),
          onEnterBack: () => setActiveSection(i),
        });
      });

      gsap.fromTo('.hero-subtitle',
        { opacity: 0, filter: 'blur(18px)', y: 18 },
        { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.8, ease: 'power3.out', delay: 1.6 },
      );
      gsap.fromTo('.scroll-cue',
        { opacity: 0 },
        { opacity: 0.42, duration: 1.2, ease: 'power2.out', delay: 2.6 },
      );
      gsap.fromTo('.hero-stats',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 2.1 },
      );

      gsap.utils.toArray('.service-card').forEach((el, i) => {
        gsap.fromTo(el as Element,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', delay: i * 0.1,
            scrollTrigger: { trigger: el as Element, start: 'top 88%' },
          },
        );
      });

      gsap.utils.toArray('.project-row').forEach((el, i) => {
        gsap.fromTo(el as Element,
          { opacity: 0, y: 32, rotateX: -8, transformOrigin: 'top center' },
          {
            opacity: 1, y: 0, rotateX: 0, duration: 1.1, ease: 'power3.out', delay: i * 0.12,
            scrollTrigger: { trigger: el as Element, start: 'top 90%' },
          },
        );
      });

      ScrollTrigger.create({
        trigger: '#portfolio',
        start: 'top bottom', end: 'bottom top', scrub: true,
        onUpdate: (self) => {
          const el = document.getElementById('portfolio');
          if (el) el.style.transform = `perspective(1400px) rotateX(${(1 - self.progress) * 3}deg)`;
        },
      });

      gsap.utils.toArray('.process-step').forEach((el, i) => {
        gsap.fromTo(el as Element,
          { opacity: 0, x: 24 },
          {
            opacity: 1, x: 0, duration: 1, ease: 'power3.out', delay: i * 0.14,
            scrollTrigger: { trigger: el as Element, start: 'top 88%' },
          },
        );
      });

      gsap.fromTo('.cta-title',
        { scale: 0.88, opacity: 0, filter: 'blur(12px)' },
        {
          scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.4, ease: 'power3.out',
          scrollTrigger: { trigger: '#contact', start: 'top 75%' },
        },
      );

      gsap.to('.contact-rays', { rotation: 360, duration: 90, ease: 'none', repeat: -1 });

      gsap.utils.toArray('.portfolio-heading').forEach((el) => {
        gsap.to(el as Element, {
          y: '-8vh', ease: 'none',
          scrollTrigger: { trigger: el as Element, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });

      gsap.utils.toArray('.section-label').forEach((el) => {
        gsap.fromTo(el as Element,
          { opacity: 0, x: -16 },
          {
            opacity: 1, x: 0, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: el as Element, start: 'top 90%' },
          },
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, [loaded, setScrollProgress, setActiveSection]);

  // IntersectionObserver reveals
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.07, rootMargin: '0px 0px -40px 0px' },
    );
    document.querySelectorAll('.reveal-up, .reveal-clip, .reveal-scale').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <SmoothLoader onComplete={() => setLoaded(true)} />
      <MythCursor />
      <PageCurtain />

      <div className="myth-scanlines" />
      <div className="myth-grain" />

      <Menu />

      {/* ─── NAV ─── */}
      <nav>
        <a href="#hero" className="nav-logo" data-link>
          <Image
            src={ASSETS.logoPath}
            alt="MYTH Agency"
            width={120}
            height={32}
            className="w-28 h-auto object-contain"
            style={{ mixBlendMode: 'screen', filter: 'brightness(1.15)' }}
          />
        </a>
        <div className="nav-links">
          <a href="#services" className="nav-link" data-link>Serviços</a>
          <a href="#portfolio" className="nav-link" data-link>Obras</a>
          <a href="#contact" className="nav-link" data-link>Contato</a>
        </div>
      </nav>

      <main ref={containerRef} className="relative w-full z-10">

        {/* ══════════════ HERO ══════════════ */}
        <section
          id="hero"
          className="scroll-section hero-section"
          onMouseMove={handleHeroMouseMove}
        >
          {/* 3D Sculptural Background */}
          <div
            ref={hero3dBgRef}
            className="hero-3d-bg"
            style={{ backgroundImage: `url(${ASSETS.bg3dPath})` }}
          />
          <div className="hero-3d-vignette" />

          {/* Oversized Letterform Overlay */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={heroLetterformRef}
            className="hero-letterform"
            src={ASSETS.letterformPath}
            alt=""
            aria-hidden="true"
          />

          <canvas ref={canvasRef} className="gl-canvas" />

          <div ref={orb1Ref} className="hero-orb hero-orb--1" />
          <div ref={orb2Ref} className="hero-orb hero-orb--2" />

          <div className="hud-corner hud-corner--tl" />
          <div className="hud-corner hud-corner--tr" />
          <div className="hud-corner hud-corner--bl" />
          <div className="hud-corner hud-corner--br" />
          <div className="hero-glitch-line" />

          <motion.div
            className="hero-bg-letter"
            style={{ rotateX: tiltX, rotateY: tiltY }}
          >
            M
          </motion.div>

          <div ref={heroContentRef} className="hero-content">
            <HoloBadge delay={0.7} />

            <h1 className="hero-title">
              <span className="hero-title-line">
                <HeroChars text="Lendas" delay={0.75} style={{ color: 'var(--gold)', fontStyle: 'italic' }} />
              </span>
              <span className="hero-title-line" style={{ paddingLeft: 'clamp(2rem,8vw,9rem)' }}>
                <HeroChars text="Não Nascem." delay={0.88} />
              </span>
              <span className="hero-title-line" style={{ paddingLeft: 'clamp(3.5rem,15vw,17rem)' }}>
                <HeroChars text="São" delay={1.0} style={{ color: 'var(--gold)' }} />
              </span>
              <span className="hero-title-line">
                <HeroChars text="Forjadas." delay={1.1} style={{ fontStyle: 'italic' }} />
              </span>
            </h1>

            <div className="hero-subtitle">
              <p>
                Arquitetura digital de alto contraste.<br />
                Forjamos experiências estéticas absolutas,<br />
                desafiando a gravidade e o ordinário.
              </p>
            </div>

            <div className="hero-stats">
              {[
                { n: 48, suffix: '', label: 'Projetos' },
                { n: 100, suffix: '%', label: 'Custom' },
                { n: 3, suffix: '+', label: 'Anos' },
              ].map((s) => (
                <div key={s.label}>
                  <span className="stat-number">
                    <AnimatedCounter to={s.n} suffix={s.suffix} />
                  </span>
                  <span className="stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="scroll-cue">
            <span className="scroll-cue-text">Rolar</span>
            <motion.div
              className="scroll-cue-bar"
              animate={{ scaleY: [0, 1, 0], y: [0, 0, 22] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ height: '3rem' }}
            />
          </div>
        </section>

        <Marquee items={MARQUEE_WORDS} />

        {/* ══════════════ SERVICES ══════════════ */}
        <section id="services" className="scroll-section services-section">
          <p className="section-label">— O Rito / 02</p>
          <h2 className="services-heading">
            Elevando marcas através da tensão<br />
            entre <em>espaço estrutural</em> e estética brutalista.
          </h2>
          <div className="services-grid">
            {SERVICES.map((card) => (
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

        {/* ══════════════ PORTFOLIO ══════════════ */}
        <section id="portfolio" className="scroll-section portfolio-section">
          <p className="portfolio-count section-label">— Obras / 03</p>
          <h2 className="portfolio-heading">
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

        {/* ══════════════ PHILOSOPHY ══════════════ */}
        <section className="scroll-section philosophy-section">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="philosophy-letterform"
            src={ASSETS.letterformPath}
            alt=""
            aria-hidden="true"
          />
          <p className="philosophy-quote reveal-up">
            "Não projetamos marcas.<br />
            <em>Construímos Lendas."</em>
          </p>
        </section>

        {/* ══════════════ PROCESS ══════════════ */}
        <section id="process" className="scroll-section process-section">
          <div className="process-grid">
            <div className="process-left">
              <h2 className="process-heading">
                A<br /><em>Forja</em>.
              </h2>
              <p className="process-subtext">
                <Typewriter
                  text="Nosso processo é um rito. Rejeitamos o template. Exigimos o autêntico."
                  delay={0.3}
                />
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

        {/* ══════════════ CONTACT ══════════════ */}
        <section id="contact" className="scroll-section contact-section">
          <div className="contact-rays" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="contact-letterform"
            src={ASSETS.letterformPath}
            alt=""
            aria-hidden="true"
          />
          <p className="contact-label">O Próximo Passo</p>

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

          <div className="contact-footer">
            <span>MYTH Agency © 2026</span>
            <div className="footer-socials">
              <a href="#" data-link>INSTAGRAM</a>
              <a href="#" data-link>BEHANCE</a>
              <a href="#" data-link>LINKEDIN</a>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
