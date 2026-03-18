//page.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  motion, useMotionValue, useSpring, AnimatePresence, useTransform
} from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useStore } from '@/utils/store';
import Menu from '@/components/ui/Menu';
import Image from 'next/image';
import { dict } from '@/utils/i18n';
import LanguageSwitcher3D from '@/components/canvas/LanguageSwitcher3D';
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
// [01] SMOOTH LOADER
// ─────────────────────────────────────────────────────────────────────────────

function SmoothLoader({ onComplete, text }: { onComplete: () => void, text: string }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

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
        setProgress(current);
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

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="loader-wrap"
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
        >
          {/* Big background M */}
          <div className="loader-bg-letter">M</div>

          {/* Progress bar */}
          <div className="loader-bar-wrap">
            <div className="loader-bar" style={{ width: `${progress}%` }} />
          </div>

          <motion.div
            className="loader-label"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {text}
          </motion.div>
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
        gl_FragColor = vec4(0.69, 0.55, 0.40, a);
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
// [02] CURSOR
// ─────────────────────────────────────────────────────────────────────────────

function MythCursor() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = mx;
  const sy = my;
  const cursorMode = useStore((s) => s.cursorMode);
  const setCursorMode = useStore((s) => s.setCursorMode);

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

    bind('a:not([data-project]):not([data-cta]), button, [data-link], .nav-link, .footer-socials a', () => setCursorMode('link'), () => setCursorMode('default'));

    bind('[data-project]', (e) => {
      setCursorMode('project');
      const t = (e as MouseEvent).currentTarget as HTMLElement;
      setPreviewSrc(t.dataset.image || '');
      setShowPreview(true);
    }, () => { setCursorMode('default'); setShowPreview(false); },
      (e) => setPreviewPos({ x: e.clientX, y: e.clientY }));

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
            style={{ left: previewPos.x, top: previewPos.y, marginLeft: -200, marginTop: -250 }}
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
      <SmoothLoader onComplete={() => setLoaded(true)} text={t.loader} />
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

        {/* ═══════════════════════════════ 01 HERO ═══════════════════════════════ */}
        <section id="hero" className="scroll-section hero-section">
          {/* WebGL particles */}
          <canvas ref={canvasRef} className="gl-canvas" />

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

          <div className="scroll-cue">
            <span className="scroll-cue-text">{t.hero_scroll}</span>
            <motion.div
              className="scroll-cue-bar"
              animate={{ scaleY: [0, 1, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ height: '40px' }}
            />
          </div>
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
        <section id="portfolio" className="scroll-section portfolio-section">
          <p className="section-label" style={{ marginBottom: '1rem' }}>{t.port_label}</p>

          <h2 className="portfolio-heading">
            {t.port_title}
          </h2>

          <div className="project-list">
            {PROJECTS_DATA.map((project, idx) => (
              <a
                key={project.index}
                href="#"
                className="project-row"
                data-project
                data-image={project.image}
              >
                <div className="project-row-wash" />
                <div className="project-index">{project.index}</div>
                <div className="project-name">{project.name}</div>
                <div className="project-meta">
                  <span className="project-category">{t.project_cats[idx]}</span>
                  <span className="project-year">{project.year}</span>
                </div>
              </a>
            ))}
          </div>
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
            <a
              ref={ctaRef}
              href="mailto:contact@mythagency.com"
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