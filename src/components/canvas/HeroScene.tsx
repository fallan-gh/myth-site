"use client";

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

export default function HeroScene() {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.15;
      meshRef.current.rotation.y += delta * 0.2;
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
          color="#B08E68"
          roughness={0.2}
          metalness={0.9}
          wireframe={false}
          flatShading={true}
        />
      </Icosahedron>
      
      {/* Outer subtle wireframe for complexity */}
      <Icosahedron ref={wireframeRef} args={[1.7, 1]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#B08E68" wireframe={true} transparent opacity={0.05} />
      </Icosahedron>
    </group>
  );
}
