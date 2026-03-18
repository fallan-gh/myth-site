"use client";

import { useState, useRef, useEffect, MouseEvent } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';

// ─────────────────────────────────────────────────────────────────────────────
// DATA & ASSETS
// ─────────────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { name: 'CONTRATE-NOS', img: 'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=1200&auto=format', target: '#contact' },
  { name: 'SERVIÇOS',     img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format', target: '#services' },
  { name: 'PORTFÓLIO',    img: 'https://images.unsplash.com/photo-1542382257-8024cb5877f2?q=80&w=1200&auto=format', target: '#portfolio' }
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function Menu() {
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
        aria-label="Toggle Menu"
        data-link
        className="fixed top-8 right-8 z-[100] p-4 group mix-blend-difference cursor-none outline-none"
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
                className="absolute top-10 left-[var(--gutter)] flex flex-col gap-1 font-mono text-[10px] text-white/40 tracking-[0.25em]"
              >
                <span>SYS.MTX // {hoveredIndex !== null ? `TRCK_${hoveredIndex}` : 'IDLE'}</span>
                <span className="text-[var(--gold)]">LAT: 23°33'01.9"S LON: 46°38'01.9"W</span>
              </motion.div>

              {/* 3D Nav Block */}
              <motion.nav 
                className="flex flex-col items-center gap-1 md:gap-3"
                style={{ rotateX: tiltX, rotateY: tiltY }}
              >
                {NAV_ITEMS.map((item, index) => {
                  const isActive = hoveredIndex === index;
                  const isDimmed = hoveredIndex !== null && hoveredIndex !== index;

                  return (
                    <div key={item.name} className="overflow-hidden p-1 relative"
                      onMouseEnter={() => setHoveredIndex(index)} 
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      <motion.a 
                        href={item.target}
                        onClick={toggleMenu}
                        custom={index}
                        variants={textSlideVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        data-link
                        className={`
                          group relative block w-full uppercase font-sans leading-[0.85] tracking-tight cursor-none text-center
                          text-[clamp(4rem,7vw,9rem)] transition-all duration-[0.45s] ease-[var(--ease-out)]
                          ${isDimmed ? 'opacity-20 blur-[3px]' : 'opacity-100'}
                          ${isActive ? 'z-10 tracking-wide text-[var(--gold)] scale-[1.03]' : 'text-transparent'}
                        `}
                        style={{ WebkitTextStroke: isActive ? 'none' : '1.5px rgba(255,255,255,0.85)' }}
                      >
                       {item.name}

                       {/* Hover Outline Glitch Copy */}
                       <span 
                          className={`
                            absolute left-0 top-0 text-transparent transition-all duration-500 ease-out z-[-1]
                            pointer-events-none w-full text-center
                            ${isActive ? 'opacity-40 translate-x-[10px] translate-y-[6px] blur-[2px]' : 'opacity-0'}
                          `}
                          style={{ WebkitTextStroke: '2px var(--gold)' }}
                        >
                          {item.name}
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
                <span className="text-[9px] uppercase tracking-[0.4em] font-sans text-white/50">
                  © 2026. ALL RIGHTS RESERVED.<br/>
                  <span className="text-[var(--gold)] italic mt-2 inline-block">MINIMALISMO MÍTICO</span>
                </span>
              </motion.div>
            </div>

            {/* ═[ RIGHT HALF: DYNAMIC MEDIA PREVIEW ]═ */}
            <div className="hidden md:block absolute right-0 top-0 w-[45%] h-full border-l border-white/10 overflow-hidden z-0 bg-[#040404]">
              
              {/* Image Preloader/Container */}
              <AnimatePresence mode="popLayout">
                {hoveredIndex !== null ? (
                  <motion.div
                    key={`img-${hoveredIndex}`}
                    initial={{ opacity: 0, scale: 1.15, filter: 'blur(20px) grayscale(100%)' }}
                    animate={{ opacity: 0.5, scale: 1, filter: 'blur(0px) grayscale(50%)' }}
                    exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px) grayscale(100%)' }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 w-full h-full"
                  >
                    {/* Parallax Image Pan */}
                    <motion.img 
                      src={NAV_ITEMS[hoveredIndex].img} 
                      alt={NAV_ITEMS[hoveredIndex].name}
                      style={{ x: moveX, y: moveY, width: 'calc(100% + 10vw)', height: 'calc(100% + 10vh)', left: '-5vw', top: '-5vh', position: 'relative' }}
                      className="object-cover pointer-events-none mix-blend-screen opacity-90"
                    />
                  </motion.div>
                ) : (
                  /* Default Empty State */
                  <motion.div
                    key="img-empty"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none"
                  >
                    <motion.div style={{ x: moveX, y: moveY }} className="font-serif text-[clamp(10rem,35vw,50rem)] leading-none text-white opacity-[0.015] select-none">
                      M
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* HUD Overlay for Image */}
              <div className="absolute inset-0 border-[2px] border-white/5 pointer-events-none m-8 mix-blend-overlay">
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[var(--gold)] opacity-50" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[var(--gold)] opacity-50" />
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
