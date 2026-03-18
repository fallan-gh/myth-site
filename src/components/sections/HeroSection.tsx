"use client";

import { motion, Variants } from "framer-motion";
import { useRef } from "react";

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const wordVariants: Variants = {
    hidden: { y: "100%", opacity: 0 },
    visible: {
      y: "0%",
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as any, // Cinematic ease-out
      },
    },
  };

  const text = "WE DESIGN FOR THE GAME.";
  const words = text.split(" ");

  return (
    <section 
      ref={containerRef}
      className="relative w-full h-screen flex flex-col justify-center items-center overflow-hidden bg-[#050505]"
    >
      {/* Background Video / Texture Overlay */}
      <div className="absolute inset-0 z-0 opacity-20 bg-gradient-to-b from-black via-zinc-900 to-black mix-blend-overlay pointer-events-none"></div>

      {/* Main Typography */}
      <motion.div 
        className="relative z-10 w-full max-w-7xl mx-auto px-6 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="flex flex-wrap justify-center gap-[1vw] text-[12vw] md:text-[8vw] font-black uppercase leading-[0.85] tracking-tighter text-white font-[family-name:var(--font-cormorant)]">
          {words.map((word, i) => (
            <div key={i} className="overflow-hidden pb-2 md:pb-4">
              <motion.span 
                variants={wordVariants}
                className="inline-block origin-bottom"
              >
                {word}
              </motion.span>
            </div>
          ))}
        </h1>
      </motion.div>

      {/* Enter the Arena Scroll Hint */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-10"
      >
        <span className="text-[10px] md:text-xs font-semibold tracking-[0.3em] uppercase text-zinc-400 font-[family-name:var(--font-manrope)]">
          Enter the Arena
        </span>
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-[1px] h-12 bg-gradient-to-b from-zinc-400 to-transparent"
        />
      </motion.div>
    </section>
  );
}
