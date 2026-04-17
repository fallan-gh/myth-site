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

  // CLEANUP: Ensure no wireframe meshes are visible from the original GLB
  React.useEffect(() => {
    scene.traverse((obj) => {
      if (obj.name.toLowerCase().includes('wireframe') || obj.type === 'LineSegments' || obj.type === 'Line') {
        obj.visible = false;
      }
      if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          // Upgrade to Solid Aged Gold material per directives
          mesh.material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color('#B08E68'),
            metalness: 1.0, 
            roughness: 0.35,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            envMapIntensity: 2.0
          });
      }
    });
  }, [scene]);

  useFrame((state, delta) => {
    if (isScenePaused) return;

    if (meshRef.current) {
        meshRef.current.rotation.y += delta * 0.12;
        meshRef.current.rotation.x += delta * 0.05;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Golden Rim Lights to catch the edges */}
      <spotLight 
        position={[5, 5, -5]} 
        intensity={30} 
        color="#B08E68" 
        angle={0.6} 
        penumbra={0.5} 
        castShadow 
      />
      <pointLight 
        position={[-10, -5, -10]} 
        intensity={20} 
        color="#B08E68" 
      />

      {/* Main Decahedron Asset (Lux Glass Core) */}
      <primitive 
          ref={meshRef}
          object={scene} 
          scale={2.6} 
      />
    </group>
  );
}
