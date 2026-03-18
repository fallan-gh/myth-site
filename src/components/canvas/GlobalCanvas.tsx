"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Preload } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { useStore } from '@/utils/store';
import * as THREE from 'three';
import { ReactNode } from 'react';

// Controller to move the camera slightly based on scroll
function CameraController() {
  const scrollProgress = useStore((state) => state.scrollProgress);
  
  useFrame((state) => {
    // A mapping from scroll (0 to 1) to camera Z position
    // As we scroll, the camera recedes from the scene slightly
    const targetZ = 5 + (scrollProgress * 15); 
    
    // Add subtle floating to camera position
    const floatY = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    const scrollFloatY = scrollProgress * -1; // Move camera down a tiny bit
    
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, floatY + scrollFloatY, 0.05);
    state.camera.lookAt(0, scrollFloatY, targetZ - 5);
  });

  return null;
}

interface GlobalCanvasProps {
  children?: ReactNode;
}

export default function GlobalCanvas({ children }: GlobalCanvasProps) {
    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] bg-black">
            <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                dpr={[1, 2]} 
                gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
            >
                <color attach="background" args={['#050505']} />
                
                {/* Cinematic Lighting setup */}
                <ambientLight intensity={0.2} color="#ffffff" />
                <directionalLight position={[10, 10, 5]} intensity={3} color="#B08E68" />
                <spotLight position={[-10, -5, 10]} intensity={4} color="#ffffff" angle={0.4} penumbra={1} />
                
                <CameraController />
                
                {children}
                
                <Environment preset="city" />
                <EffectComposer>
                  <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} intensity={1.5} mipmapBlur />
                  <Noise opacity={0.03} />
                  <Vignette eskil={false} offset={0.1} darkness={1.1} />
                </EffectComposer>
                <Preload all />
            </Canvas>
        </div>
    );
}
