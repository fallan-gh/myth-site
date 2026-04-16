"use client";

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Icosahedron } from '@react-three/drei';
import { useStore } from '@/utils/store';
import * as THREE from 'three';

// [120FPS OPTIMIZATION]: Wrapped generic heavy 3D scene in React.memo 
// to prevent massive React render bottlenecks when parent state changes.
const HeroScene = React.memo(function HeroScene() {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const isScenePaused = useStore((state) => state.isScenePaused);

  useFrame((state, delta) => {
    if (isScenePaused) return;

    if (groupRef.current) {
      // Parallax effect tied to mouse - OPPOSITE direction
      const targetX = -state.pointer.y * 0.4;
      const targetY = -state.pointer.x * 0.4;
      
      // Smooth lerp for premium feel
      groupRef.current.rotation.x += 0.05 * (targetX - groupRef.current.rotation.x);
      groupRef.current.rotation.y += 0.05 * (targetY - groupRef.current.rotation.y);
    }

    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.15;
      meshRef.current.rotation.y += delta * 0.2;
    }
    if (wireframeRef.current) {
      wireframeRef.current.rotation.x -= delta * 0.1;
      wireframeRef.current.rotation.y -= delta * 0.12;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x += delta * 0.05;
      ringRef.current.rotation.y += delta * 0.08;
      ringRef.current.rotation.z -= delta * 0.03;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* 1. SOLID CORE: Flat-shaded premium gold */}
      <Icosahedron ref={meshRef} args={[1.5, 0]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#9A6B38"
          roughness={0.25}
          metalness={0.85}
          wireframe={false}
          flatShading={true}
        />
      </Icosahedron>
      
      {/* 2. OUTER WIREFRAME: Same geometry level (0), just larger */}
      <Icosahedron ref={wireframeRef} args={[1.85, 0]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#E8CA9B" wireframe={true} transparent opacity={0.4} />
      </Icosahedron>

      {/* 3. ORBIT RING: Classic subtle ring cutting through */}
      <mesh ref={ringRef} rotation={[Math.PI / 2.5, Math.PI / 6, 0]}>
        <torusGeometry args={[2.3, 0.012, 16, 100]} />
        <meshBasicMaterial color="#C89D66" transparent opacity={0.6} />
      </mesh>
    </group>
  );
});

export default HeroScene;
