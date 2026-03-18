"use client";

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// Move pure generation outside the component
const generateWires = () => {
  return Array.from({ length: 15 }).map(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * -10),
      new THREE.Vector3(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * -10 + 5),
      new THREE.Vector3(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * -10 + 10)
    ]);
    return {
      curve,
      speed: Math.random() * 0.5 + 0.1,
      offset: Math.random() * Math.PI * 2
    };
  });
};

export default function ServicesScene() {
  const groupRef = useRef<THREE.Group>(null);

  // Use the external function inside useMemo
  const wires = useMemo(() => generateWires(), []);

  useFrame((state) => {
    if (groupRef.current) {
      // Rotate the entire services group slowly
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
      groupRef.current.position.y = Math.cos(state.clock.elapsedTime * 0.2) * 0.5;
    }
  });

  // Services section is active roughly between 0.2 and 0.5 scroll progress
  // Position it in Z-space where the camera will pass through
  return (
    <group ref={groupRef} position={[0, 0, -10]}>
      {/* 3D Wireframe Text */}
      <Text
        fontSize={1}
        position={[-1, 1, 0]}
        rotation={[0, 0.2, 0]}
        anchorX="center"
        anchorY="middle"
        characters="IDENTIDADEVISUAL"
      >
        IDENTIDADE
        <meshStandardMaterial color="#ffffff" emissive="#333333" wireframe />
      </Text>
      
      <Text
        fontSize={1}
        position={[2, -1, -2]}
        rotation={[0, -0.2, 0]}
        anchorX="center"
        anchorY="middle"
        characters="VITRINESDIGITAIS"
      >
        VITRINES
        <meshStandardMaterial color="#ffffff" emissive="#111111" wireframe />
      </Text>

      {/* Abstract Light Wires floating around */}
      {wires.map((wire, i) => (
        <mesh key={i}>
          <tubeGeometry args={[wire.curve, 20, 0.02, 8, false]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}
