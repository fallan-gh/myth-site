"use client";

import React, { useEffect } from 'react';
import { useStore } from '@/utils/store';
import ProjectStage from '@/components/external-stage/ProjectStage';
import ShowcaseHUD from '@/components/hud/ShowcaseHUD';

export default function ShowcasePage() {
  const { setSceneMode, setScrollProgress } = useStore();

  useEffect(() => {
    // Activate Showcase Scene in GlobalCanvas
    setSceneMode('showcase');
    
    // Reset scroll tracking
    const handleScroll = () => {
      const scrolled = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      setScrollProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      setSceneMode('hero'); // Revert when leaving
      window.removeEventListener('scroll', handleScroll);
    };
  }, [setSceneMode, setScrollProgress]);

  return (
    <div className="relative min-h-[300vh] bg-transparent">
      {/* HUD Layer (Highest Z Index) */}
      <ShowcaseHUD />

      {/* Content Layer */}
      <div className="relative z-10">
        {/* Intro Section */}
        <section className="h-screen flex flex-col items-center justify-center text-center px-6">
          <h2 className="text-white font-raleway font-black text-6xl md:text-8xl uppercase tracking-tighter leading-none mb-4">
            Hybrid<br /><span className="text-myth-gold outline-text">Portfolio</span>
          </h2>
          <p className="text-white/40 font-mono text-sm tracking-widest uppercase">
            Scrolling into the meta-verse of experiences
          </p>
          <div className="mt-12 animate-bounce">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-white/20">
              <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
            </svg>
          </div>
        </section>

        {/* Guest Project 1: Agrotoxica */}
        <ProjectStage 
          id="agrotoxica"
          title="Agrotóxica"
          subtitle="Precision Agriculture & Bio Solutions"
          url="https://agrotoxica.com.br/inicio"
          bgColor="#0d1a0d"
        />

        {/* Spacer for cinematic feel */}
        <div className="h-[50vh]" />

        {/* Guest Project 2: Myth Ecosystem */}
        <ProjectStage 
          id="vercel-project"
          title="Myth Ecosystem"
          subtitle="Advanced AI Integration & Digital Legends"
          url="https://project-2fjv9.vercel.app/"
          bgColor="#000000"
        />

        {/* Outro Section */}
        <section className="h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-myth-gold font-mono text-[10px] uppercase tracking-[0.5em] mb-4">End of Transmission</p>
            <h3 className="text-white text-4xl font-raleway font-light uppercase tracking-widest">More legends <br/>coming soon.</h3>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="mt-12 px-10 py-4 border border-white/10 text-white/40 text-xs font-mono uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all"
            >
              Return to Top
            </button>
          </div>
        </section>
      </div>

      <style jsx global>{`
        .outline-text {
          -webkit-text-stroke: 1px rgba(255,255,255,0.2);
          color: transparent;
        }
      `}</style>
    </div>
  );
}
