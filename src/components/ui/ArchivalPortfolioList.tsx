"use client";

import React, { useState, MouseEvent } from 'react';
import { motion, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';

interface Project {
  id: string;
  name: string;
  refCode: string;
  image: string;
}

const PROJECTS: Project[] = [
  { id: '1', name: 'AGROTÓXICA', refCode: '[REF. 001-26]', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format' },
  { id: '2', name: 'DIGITAL EMBASSY', refCode: '[REF. 014-25]', image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format' },
  { id: '3', name: 'MASS MANTLE', refCode: '[REF. 089-23]', image: 'https://images.unsplash.com/photo-1542382257-8024cb5877f2?q=80&w=1200&auto=format' },
  { id: '4', name: 'LUMINA', refCode: '[REF. 102-24]', image: 'https://images.unsplash.com/photo-1506744626753-1fa44f48ea92?q=80&w=1200&auto=format' },
];

export default function ArchivalPortfolioList() {
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: MouseEvent) => {
    // Translate coords to follow cursor position precisely
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  return (
    <section 
      className="relative w-full min-h-screen bg-[#000000] flex items-center py-24 cursor-none"
      onMouseMove={handleMouseMove}
    >
      <div className="w-full max-w-[90vw] mx-auto px-4 md:px-8">
        <ul className="flex flex-col w-full border-t border-white/10">
          {PROJECTS.map((project) => (
            <li 
              key={project.id}
              className="group relative border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between py-10 overflow-hidden cursor-none"
              onMouseEnter={() => setHoveredImage(project.image)}
              onMouseLeave={() => setHoveredImage(null)}
            >
              {/* Wash Background on Hover (Archival File Reveal) */}
              <div className="absolute inset-0 bg-[#ffffff03] scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-500 ease-out z-0 pointer-events-none" />

              {/* Client Name */}
              <div className="relative z-10 font-serif text-[clamp(3.5rem,7vw,8rem)] leading-[0.8] font-black uppercase text-white transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-[#B87333] group-hover:translate-x-6 tracking-tight tracking-tighter">
                {project.name}
              </div>
              
              {/* Archival Code */}
              <div className="relative z-10 mt-6 md:mt-0 font-mono text-[10px] tracking-[0.3em] text-white/40 uppercase transition-all duration-700 ease-out group-hover:text-[#B87333]">
                {project.refCode}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* The "Locatelli" Floating Hover Image */}
      <AnimatePresence>
        {hoveredImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.85, rotate: 2 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="fixed top-0 left-0 pointer-events-none z-[99] w-64 md:w-[28rem] aspect-[3/4] overflow-hidden"
            style={{
              x: cursorX,
              y: cursorY,
              // Move anchor so the image sits elegantly offset from the physical cursor
              translateX: '-30%',
              translateY: '-40%',
              // [120FPS OPTIMIZATION]: Force GPU acceleration for discrete render layer
              transform: 'translateZ(0)',
              willChange: 'transform, opacity'
            }}
          >
            {/* Inner image scaling down for cinematic feel */}
            <motion.img 
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              exit={{ scale: 1.1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              src={hoveredImage} 
              alt="Project Preview" 
              className="w-full h-full object-cover grayscale-[20%] contrast-125 mix-blend-luminosity"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
