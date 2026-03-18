"use client";

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// A simple custom shader material to simulate the Depth Map projection effect
const depthMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#333333') } // Concrete-like base
  },
  vertexShader: `
    uniform float uTime;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec3 pos = position;
      // Procedural distortion (fake depth)
      float noise = sin(pos.x * 5.0 + uTime) * cos(pos.y * 5.0 + uTime) * 0.1;
      pos.z += noise;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    varying vec2 vUv;
    void main() {
      // Creates a brutalist grid/scanline pattern
      float grid = step(0.95, sin(vUv.x * 100.0)) + step(0.95, sin(vUv.y * 100.0));
      vec3 finalColor = mix(uColor, vec3(1.0), grid * 0.2);
      gl_FragColor = vec4(finalColor, 0.8);
    }
  `,
  transparent: true,
  wireframe: false,
});

export default function PortfolioScene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    depthMaterial.uniforms.uTime.value = state.clock.elapsedTime;
    if (groupRef.current) {
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  // Portfolio section is furthest down the Z-axis (reached near scroll end)
  return (
    <group ref={groupRef} position={[0, 0, -20]}>
      {/* "Concrete" walls functioning as projection screens */}
      <mesh position={[-3, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
        <planeGeometry args={[4, 6, 32, 32]} />
        <primitive object={depthMaterial} attach="material" />
      </mesh>
      
      <mesh position={[3, 1, -2]} rotation={[0, -Math.PI / 6, 0]}>
        <planeGeometry args={[5, 3, 32, 32]} />
        <primitive object={depthMaterial.clone()} attach="material" />
      </mesh>
    </group>
  );
}
