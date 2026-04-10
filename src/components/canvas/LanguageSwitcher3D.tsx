"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron, MeshDistortMaterial, Environment, Float } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useStore } from '@/utils/store';

function SwitcherShape() {
  const language = useStore(state => state.language);
  const meshRef = useRef<THREE.Group>(null);
  const targetRotationZ = useRef(0);

  // Trigger rotation specific to language change
  useEffect(() => {
    targetRotationZ.current += Math.PI; 
  }, [language]);

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
          <MeshDistortMaterial
            color={language === 'en' ? "#B08E68" : "#A0A0A0"} // Gold for EN, Silver for PT
            clearcoat={1}
            clearcoatRoughness={0.1}
            metalness={0.9}
            roughness={0.1}
            distort={0.3}
            speed={2}
          />
        </Icosahedron>
        {/* Ring to add depth to rotation visual */}
        <mesh rotation={[-Math.PI/2, 0, 0]}>
           <ringGeometry args={[1.3, 1.4, 32]} />
           <meshStandardMaterial color={language === 'en' ? "#B08E68" : "#A0A0A0"} metalness={1} roughness={0} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </Float>
  );
}

export default function LanguageSwitcher3D() {
  const language = useStore(state => state.language);
  const setLanguage = useStore(state => state.setLanguage);
  const setCursorMode = useStore(state => state.setCursorMode);

  const toggle = () => {
    setLanguage(language === 'en' ? 'pt' : 'en');
  };

  return (
    <div 
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-8 lg:bottom-12 lg:right-12 z-[100] w-14 h-14 sm:w-20 sm:h-20 cursor-none"
      onMouseEnter={() => setCursorMode('magnetic')}
      onMouseLeave={() => setCursorMode('default')}
      onClick={toggle}
      role="button"
      tabIndex={0}
      aria-label={`Switch language to ${language === 'en' ? 'Portuguese' : 'English'}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 4.5], fov: 45 }} gl={{ alpha: true }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
          <SwitcherShape />
          <Environment preset="city" />
        </Canvas>
      </div>
      
      {/* Label under it */}
      <div className="absolute top-[105%] left-1/2 -translate-x-1/2 font-mono text-[9px] tracking-widest font-bold text-white/50 w-24 text-center pointer-events-none uppercase transition-colors">
        <span className={language === 'pt' ? 'text-[var(--gold)] opacity-100' : ''}>PT</span>
        {' / '}
        <span className={language === 'en' ? 'text-[var(--gold)] opacity-100' : ''}>EN</span>
      </div>
    </div>
  );
}
