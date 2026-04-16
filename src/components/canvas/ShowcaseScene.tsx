"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Torus, Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/utils/store';
import BackgroundDecahedron from './BackgroundDecahedron';

const ShowcaseScene = React.memo(() => {
  const groupRef = useRef<THREE.Group>(null);
  const showcaseProject = useStore((state) => state.showcaseProject);
  
  // Dynamic color palette based on project
  const colors = useMemo(() => {
    switch (showcaseProject) {
      case 'agrotoxica':
        return {
          primary: new THREE.Color('#2D5A27'), // Deep Forest Green
          accent: new THREE.Color('#E3FF73'),  // Toxic Lime
        };
      case 'vercel-project':
        return {
          primary: new THREE.Color('#000000'), // Vercel Black
          accent: new THREE.Color('#ffffff'),  // Clean White
        };
      default:
        return {
          primary: new THREE.Color('#1A1A1A'), // Neutral Dark
          accent: new THREE.Color('#B08E68'),  // Gold
        };
    }
  }, [showcaseProject]);

  const isScenePaused = useStore((state) => state.isScenePaused);
  const primaryRef = useRef<THREE.Color>(colors.primary);
  const accentRef = useRef<THREE.Color>(colors.accent);

  useFrame((state, delta) => {
    if (isScenePaused) return; // Hibernation: Zero GPU draw for meshes
    
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
      
      // Smoothly lerp colors towards target palette
      primaryRef.current.lerp(colors.primary, 0.05);
      accentRef.current.lerp(colors.accent, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Cinematic Background Asset */}
      <BackgroundDecahedron />
      
      <pointLight position={[5, 5, 5]} intensity={2} color={accentRef.current} />
    </group>
  );
});

ShowcaseScene.displayName = 'ShowcaseScene';

export default ShowcaseScene;
