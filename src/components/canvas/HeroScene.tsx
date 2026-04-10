"use client";

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

// [120FPS OPTIMIZATION]: Wrapped generic heavy 3D scene in React.memo 
// to prevent massive React render bottlenecks when parent state changes.
const HeroScene = React.memo(function HeroScene() {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Parallax effect tied to mouse
      const targetX = state.pointer.y * 0.5;
      const targetY = state.pointer.x * 0.5;
      
      meshRef.current.rotation.x += 0.05 * (targetX - meshRef.current.rotation.x) + delta * 0.15;
      meshRef.current.rotation.y += 0.05 * (targetY - meshRef.current.rotation.y) + delta * 0.2;
    }
    if (wireframeRef.current) {
      wireframeRef.current.rotation.x -= delta * 0.1;
      wireframeRef.current.rotation.y -= delta * 0.15;
    }
  });

  return (
    <group position={[0, -0.5, 0]}>
      <Icosahedron ref={meshRef} args={[1.5, 0]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#050505"
          roughness={0.2}
          metalness={0.8}
          wireframe={false}
          flatShading={true}
        />
      </Icosahedron>
      
      {/* Outer subtle wireframe for complexity */}
      <Icosahedron ref={wireframeRef} args={[1.7, 1]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#ffffff" wireframe={true} transparent opacity={0.02} />
      </Icosahedron>
    </group>
  );
});

export default HeroScene;
