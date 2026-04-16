"use client";

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/utils/store';

// Preload the asset outside the component for optimization
useGLTF.preload('/3d/decaedro.glb');

export default function BackgroundDecahedron() {
  const meshRef = useRef<THREE.Group>(null);
  const isScenePaused = useStore((state) => state.isScenePaused);
  
  // Load the GLB model
  const { scene } = useGLTF('/3d/decaedro.glb');

  useFrame((state, delta) => {
    // [HARDCORE HIBERNATION]: Skip all calculations if user is viewing an iframe
    if (isScenePaused) return;

    // Center the Decahedron rotation on its own axis
    if (meshRef.current) {
        meshRef.current.rotation.y += delta * 0.2;
        meshRef.current.rotation.x += delta * 0.1;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Main Decahedron Asset (Solid Core) */}
      <primitive 
          ref={meshRef}
          object={scene} 
          scale={2.2} 
      >
          <meshStandardMaterial 
              metalness={0.9} 
              roughness={0.15} 
              color="#1a1a1a" 
              envMapIntensity={2}
          />
      </primitive>
    </group>
  );
}
