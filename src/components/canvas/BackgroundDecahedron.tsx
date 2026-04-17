"use client";

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/utils/store';

useGLTF.preload('/3d/decaedro.glb');

const GOLD_MATERIAL = {
  color: new THREE.Color('#B08E68'),
  metalness: 0.92,
  roughness: 0.28,
  envMapIntensity: 1.6,
};

export default function BackgroundDecahedron() {
  const { scene } = useGLTF('/3d/decaedro.glb');
  const groupRef = useRef<THREE.Group>(null!);
  // Atomic selector — no re-render on unrelated store changes
  const isScenePaused = useStore((s) => s.isScenePaused);

  const goldMaterial = useMemo(
    () => new THREE.MeshPhysicalMaterial(GOLD_MATERIAL),
    []
  );

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = goldMaterial;
      }
    });
    return clone;
  }, [scene, goldMaterial]);

  useFrame((_, delta) => {
    // Hard hibernation — GPU cycles saved when user is inside iframe
    if (isScenePaused || !groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.12;
    groupRef.current.rotation.x += delta * 0.04;
  });

  return (
    <group ref={groupRef} position={[3.5, -0.5, -2]} scale={1.4}>
      <primitive object={clonedScene} />
    </group>
  );
}
