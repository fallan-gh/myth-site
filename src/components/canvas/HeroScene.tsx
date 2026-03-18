"use client";

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/utils/store';

export default function HeroScene() {
    const meshRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    const scrollProgress = useStore((state) => state.scrollProgress);

    useFrame((state, delta) => {
        if (meshRef.current && groupRef.current) {
            // Base constant rotation
            meshRef.current.rotation.z += delta * 0.15;
            meshRef.current.rotation.y += delta * 0.05;

            // Pointer interaction
            const pointerX = (state.pointer.x * Math.PI) / 3;
            const pointerY = (state.pointer.y * Math.PI) / 3;
            meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, pointerY, 0.05);

            // Floating effect
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.3;

            // SCROLL REACTIVITY: As user scrolls away from hero (progress > 0), the monolith distorts and scales up
            // This creates the illusion of diving "into" it
            const heroProgress = Math.min(scrollProgress * 5, 1); // Normalize 0-0.2 scroll to 0-1
            
            // Distort scale
            const targetScale = 1 + (heroProgress * 3);
            meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1));
            
            // Fade out/Break apart logic visually (simulated by moving off-center slightly)
            const targetPosX = (Math.sin(state.clock.elapsedTime * 2) * heroProgress * 2);
            groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosX, 0.1);
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            {/* The Main "Monolith" Shape */}
            <Icosahedron ref={meshRef} args={[1.5, 1]}>
                <MeshTransmissionMaterial
                    background={new THREE.Color('#000000')}
                    color="#ffffff"
                    thickness={1.5}
                    roughness={0.1}
                    transmission={1}
                    ior={1.8}
                    chromaticAberration={0.8}
                    backside={true}
                    resolution={1024}
                />
            </Icosahedron>
        </group>
    );
}
