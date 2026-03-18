"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Preload } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, Glitch } from '@react-three/postprocessing';
import { GlitchMode } from 'postprocessing';
import { useStore } from '@/utils/store';
import * as THREE from 'three';
import { useRef, ReactNode } from 'react';

import ServicesScene from './ServicesScene';
import PortfolioScene from './PortfolioScene';

// Controller to move the camera through space based on scroll
function CameraController() {
  const scrollProgress = useStore((state) => state.scrollProgress);
  
  useFrame((state) => {
    // A mapping from scroll (0 to 1) to camera Z position
    // As we scroll, the camera dives deeper into the scene (negative Z)
    const targetZ = 5 - (scrollProgress * 25); 
    
    // Add subtle floating to camera position
    const floatY = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    const scrollFloatY = scrollProgress * -2; // Slightly move down as diving
    
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, floatY + scrollFloatY, 0.05);
    state.camera.lookAt(0, scrollFloatY, targetZ - 5);
  });

  return null;
}

// Controller for dynamic post-processing based on active section
function PostProcessingController() {
  const activeSection = useStore((state) => state.activeSection);
  const scrollProgress = useStore((state) => state.scrollProgress);
  const glitchRef = useRef<any>(null);

  useFrame(() => {
    if (glitchRef.current) {
      // Trigger glitch violently between specific scroll ranges (scene transitions)
      const isTransitioning = 
        (scrollProgress > 0.15 && scrollProgress < 0.2) || 
        (scrollProgress > 0.45 && scrollProgress < 0.5);
      
      glitchRef.current.active = isTransitioning;
    }
  });

  return (
    <EffectComposer {...{ disableNormalPass: true } as any}>
      <Bloom 
        luminanceThreshold={0.2} 
        luminanceSmoothing={0.9} 
        intensity={activeSection === 1 ? 2.5 : 1.0} // More glow in Services scene
        mipmapBlur 
      />
      <Noise opacity={0.04} />
      <Vignette eskil={false} offset={0.1} darkness={1.1} />
      <Glitch 
        ref={glitchRef}
        delay={[1.5, 3.5] as any} 
        duration={[0.1, 0.3] as any} 
        strength={[0.2, 0.4] as any} 
        mode={GlitchMode.SPORADIC} 
        active={false} // controlled by useFrame
      />
    </EffectComposer>
  );
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
                <color attach="background" args={['#000000']} />
                
                {/* Advanced Lighting setup for Chiaroscuro */}
                <ambientLight intensity={0.1} color="#ffffff" />
                <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" castShadow />
                <spotLight position={[-10, 0, 10]} intensity={5} color="#ffffff" angle={0.3} penumbra={1} />
                
                <CameraController />
                
                {children}
                <ServicesScene />
                <PortfolioScene />
                
                <Environment preset="city" />
                <PostProcessingController />
                <Preload all />
            </Canvas>
        </div>
    );
}
