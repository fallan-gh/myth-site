"use client";

import { useState, useRef, useEffect, MouseEvent } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import Menu3D from '@/components/canvas/Menu3D';
import { useStore } from '@/utils/store';
import { dict } from '@/utils/i18n';

// ─────────────────────────────────────────────────────────────────────────────
// DATA & ASSETS
// ─────────────────────────────────────────────────────────────────────────────

// Navigation structure (labels come from dict dynamically)
const NAV_TARGETS = [ '#contact', '#services', '#portfolio' ];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function Menu() {
  const language = useStore(state => state.language);
  const t = dict[language];
  const navItems = [t.nav_work, t.nav_services, t.nav_portfolio];

  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Parallax / 3D Setup
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const tiltX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 120, damping: 25 });
  const tiltY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 120, damping: 25 });

  // Hardcoding pixel offsets instead of vw/vh to satisfy Framer Motion strict types
  const moveX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-40, 40]), { stiffness: 60, damping: 40 });
  const moveY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-40, 40]), { stiffness: 60, damping: 40 });

  const handleMouseMove = (e: MouseEvent) => {
    if (!menuContainerRef.current) return;
    const rect = menuContainerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Block scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Viewport setup for multi-column wipe
  const cols = 5;
  const colVariants = {
    closed: { scaleY: 0, transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const } },
    open: (i: number) => ({
      scaleY: 1,
      transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const, delay: i * 0.06 }
    }),
  };

  const textSlideVariants = {
    closed: { y: '120%', opacity: 0, rotate: 6, filter: 'blur(8px)' },
    open: (i: number) => ({
      y: '0%', opacity: 1, rotate: 0, filter: 'blur(0px)',
      transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] as const, delay: 0.4 + i * 0.1 }
    })
  };

  return (
    <>
      {/* ═[ HAMBURGER ]═ */}
      <button 
        onClick={toggleMenu}
        aria-label={isOpen ? 'Close Menu' : 'Open Menu'}
        aria-expanded={isOpen}
        data-link
        className="fixed top-8 right-8 z-[100] p-4 group mix-blend-difference cursor-none focus-visible:outline-2 focus-visible:outline-[var(--gold)]"
      >
        <div className="flex flex-col gap-[6px] w-8">
          <div className={`h-[2px] bg-white transition-transform duration-500 ease-in-out ${isOpen ? 'rotate-45 translate-y-[8px]' : ''}`} />
          <div className={`h-[2px] bg-white transition-opacity duration-300 ${isOpen ? 'opacity-0' : ''}`} />
          <div className={`h-[2px] bg-white transition-transform duration-500 ease-in-out ${isOpen ? '-rotate-45 -translate-y-[8px]' : ''}`} />
        </div>
      </button>

      {/* ═[ FULLSCREEN ENTRANCE MASK ]═ */}
      <div className="fixed inset-0 z-[89] pointer-events-none flex w-full">
        <AnimatePresence>
          {isOpen && Array.from({ length: cols }).map((_, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={colVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="h-full bg-[var(--black)] origin-top border-r border-white/5"
              style={{ width: `${100 / cols}%` }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* ═[ MENU CONTENT ]═ */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div 
            ref={menuContainerRef}
            className="fixed inset-0 z-[90] flex flex-col md:flex-row overflow-hidden bg-transparent"
            onMouseMove={handleMouseMove}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
          >
            {/* Ambient Scanline Overlay */}
            <div className="menu-scanlines pointer-events-none absolute inset-0 opacity-30 mix-blend-screen z-20" />

            {/* ═[ LEFT HALF: NAVIGATION ]═ */}
            <div className="relative w-full md:w-[55%] h-full flex flex-col items-center justify-center px-[var(--gutter)] pt-20 pb-10 z-10 perspective-[1000px]">
              
              {/* HUD Coordinates Top Left */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9, duration: 1 }}
                className="absolute top-10 left-[var(--gutter)] flex flex-col gap-2 font-mono text-[9px] text-white/60 tracking-widest uppercase"
              >
                <span>{t.nav_domain} // {hoveredIndex !== null ? `FOCUS_0${hoveredIndex + 1}` : t.nav_idle}</span>
                <span className="text-[var(--gold)]">{t.nav_tension}</span>
              </motion.div>

              {/* 3D Nav Block */}
              <motion.nav 
                className="flex flex-col items-center gap-1 md:gap-3 relative z-20"
                style={{ rotateX: tiltX, rotateY: tiltY }}
              >
                {navItems.map((name, index) => {
                  const isActive = hoveredIndex === index;
                  const isDimmed = hoveredIndex !== null && hoveredIndex !== index;

                  return (
                    <div key={name} className="overflow-hidden p-1 relative"
                      onMouseEnter={() => setHoveredIndex(index)} 
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      <motion.a 
                        href={NAV_TARGETS[index]}
                        onClick={(e) => {
                          e.preventDefault();
                          closeMenu();
                          // Smooth scroll after menu close animation
                          setTimeout(() => {
                            const target = document.querySelector(NAV_TARGETS[index]);
                            target?.scrollIntoView({ behavior: 'smooth' });
                          }, 600);
                        }}
                        custom={index}
                        variants={textSlideVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        data-link
                        className={`
                          group relative block w-full uppercase font-serif font-black leading-[0.85] tracking-tight cursor-none text-center
                          text-[clamp(4rem,7vw,9rem)] transition-all duration-[0.45s] ease-[var(--ease-out)]
                          ${isDimmed ? 'opacity-20 blur-[3px]' : 'opacity-100'}
                          ${isActive ? 'z-10 tracking-wide text-[var(--gold)] scale-[1.03]' : 'text-transparent'}
                        `}
                        style={{ WebkitTextStroke: isActive ? 'none' : '1.5px rgba(255,255,255,0.85)' }}
                      >
                       {name}

                       {/* Hover Outline Glitch Copy */}
                       <span 
                          className={`
                            absolute left-0 top-0 text-transparent transition-all duration-500 ease-out z-[-1]
                            pointer-events-none w-full text-center
                            ${isActive ? 'opacity-40 translate-x-[10px] translate-y-[6px] blur-[2px]' : 'opacity-0'}
                          `}
                          style={{ WebkitTextStroke: '2px var(--gold)' }}
                        >
                          {name}
                        </span>
                      </motion.a>
                    </div>
                  );
                })}
              </motion.nav>
              
              {/* Bottom Copyright Logo */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 0.6, y: 0 }} transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-10 left-[var(--gutter)] flex flex-col gap-3"
              >
                <Image src="/logo/white.png" alt="Myth Agency Logo" width={100} height={25} className="w-20 h-auto object-contain opacity-70" />
                <span className="font-mono text-[9px] tracking-widest uppercase text-white/50">
                  {t.nav_rights}<br/>
                  <span className="text-[var(--gold)] italic mt-2 inline-block">{t.nav_myth}</span>
                </span>
              </motion.div>
            </div>

            {/* ═[ RIGHT HALF: DYNAMIC 3D PREVIEW ]═ */}
            <div className="hidden md:block absolute right-0 top-0 w-[45%] h-full border-l border-white/10 overflow-hidden z-[5] bg-[#020202]">
              <Menu3D hoveredIndex={hoveredIndex} />

              {/* HUD Overlay for 3D View */}
              <div className="absolute inset-0 border-[2px] border-white/5 pointer-events-none m-8 mix-blend-overlay z-10">
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[var(--gold)] opacity-50" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[var(--gold)] opacity-50" />
              </div>
              
              <AnimatePresence>
                {hoveredIndex !== null && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-12 right-12 z-10 font-mono text-[9px] tracking-widest uppercase text-white/60 pointer-events-none text-right"
                  >
                    INTERACTIVE WEBGL COMPONENT<br/>
                    <span className="text-[var(--gold)]">DRAG TO ROTATE SCENE</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
