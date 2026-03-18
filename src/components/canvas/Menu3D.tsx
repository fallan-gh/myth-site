"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment, Sparkles, Stars, PresentationControls } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function MenuShape({ hoveredIndex }: { hoveredIndex: number | null }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
      
      // Scale up and change distortion based on hover
      const targetScale = hoveredIndex !== null ? 1.8 : 1.2;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.05);
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.5, Math.max(2, hoveredIndex !== null ? hoveredIndex * 8 : 4)]} />
        <MeshDistortMaterial
          color={hoveredIndex !== null ? "#B08E68" : "#222222"}
          envMapIntensity={1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          metalness={0.9}
          roughness={0.1}
          distort={hoveredIndex !== null ? 0.5 : 0.2}
          speed={hoveredIndex !== null ? 4 : 2}
        />
      </mesh>
    </Float>
  );
}

export default function Menu3D({ hoveredIndex }: { hoveredIndex: number | null }) {
  return (
    <div className="absolute inset-0 z-0 pointer-events-auto">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#B08E68" />
        
        {/* Allows the user to grab and spin the object */}
        <PresentationControls 
          global 
          rotation={[0, 0, 0]} 
          polar={[-Math.PI / 3, Math.PI / 3]} 
          azimuth={[-Math.PI / 1.4, Math.PI / 2]}
        >
            <MenuShape hoveredIndex={hoveredIndex} />
        </PresentationControls>

        <Sparkles 
          count={150} 
          scale={12} 
          size={2} 
          speed={0.4} 
          opacity={hoveredIndex !== null ? 0.8 : 0.1} 
          color="#B08E68" 
        />
        
        <Stars 
          radius={100} 
          depth={50} 
          count={3000} 
          factor={4} 
          saturation={0} 
          fade 
          speed={1} 
        />
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
