"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 transition-all duration-300 mix-blend-difference ${
        scrolled ? "py-4 bg-zinc-900/10 backdrop-blur-sm" : ""
      }`}
    >
      <div className="text-2xl font-black tracking-tighter uppercase font-[family-name:var(--font-cormorant)] text-white">
        <Link href="/">MYTH</Link>
      </div>

      <nav className="flex items-center gap-6 md:gap-10 font-[family-name:var(--font-manrope)] text-xs font-semibold tracking-widest uppercase text-white">
        <Link href="#work" className="hover:text-[#E2FF00] transition-colors">
          Work
        </Link>
        <Link href="#studio" className="hover:text-[#E2FF00] transition-colors">
          Studio
        </Link>
        <Link href="#contact" className="hover:text-[#E2FF00] transition-colors">
          Contact
        </Link>
      </nav>
    </motion.header>
  );
}
