"use client";

import { useEffect, useRef, useState, useMemo, useCallback, Suspense } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useMotionValue } from 'framer-motion';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import * as THREE from 'three';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { shaderMaterial, Float, Trail, MeshTransmissionMaterial, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration, Scanline, Glitch } from '@react-three/postprocessing';
import { BlendFunction, GlitchMode } from 'postprocessing';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const GOLD = '#B08E68';
const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const SCROLL_HEIGHT = 110; // vh por projeto

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const PORTFOLIO_DATA = [
  {
    id: '001', title: 'AGROTÓXICA', category: 'Branding & Web', year: '2026',
    image: '/logo/logo_myth.png', video: '/videos/agrox.mp4',
    gallery: ['/logo/logo_myth.png', '/logo/logo_myth.png', '/logo/logo_myth.png'],
    client: 'Atlética Agrotóxica',
    description: 'Sistema de identidade visual completo para associação atlética universitária. E-commerce, motion design e presença digital.',
    services: ['Brand Identity', 'Web Design', 'Motion', 'E-commerce'],
    link: 'https://behance.net/',
    align: 'left' as const,
  },
  {
    id: '014', title: 'DIGITAL EMBASSY', category: 'Motion & Strategy', year: '2025',
    image: '/logo/p2.png', video: '/videos/embassy.mp4',
    gallery: ['/logo/p2.png', '/logo/p2.png'],
    client: 'Digital Embassy',
    description: 'Identidade digital e estratégia de conteúdo para embaixada cultural. Narrativa visual imersiva com foco editorial.',
    services: ['Visual Identity', 'Strategy', 'Editorial', 'Motion'],
    link: 'https://behance.net/',
    align: 'right' as const,
  },
  {
    id: '089', title: 'MASS MANTLE', category: 'Identity Design', year: '2023',
    image: '/logo/p3.png', video: '/videos/mass.mp4',
    gallery: ['/logo/p3.png', '/logo/p3.png'],
    client: 'Mass Mantle',
    description: 'Rebranding e campanha de lançamento para marca de moda contemporânea com distribuição em 12 países.',
    services: ['Rebranding', 'Art Direction', 'Campaign', 'Print'],
    link: 'https://behance.net/',
    align: 'center' as const,
  },
  {
    id: '102', title: 'MARÔ DOCES', category: 'Packaging', year: '2025',
    image: '/logo/p1.png', video: '/videos/maro.mp4',
    gallery: ['/logo/p1.png', '/logo/p2.png', '/logo/p3.png'],
    client: 'MaRô Doces',
    description: 'Design de embalagem artesanal com identidade visual delicada para confeitaria premium do interior de MG.',
    services: ['Packaging', 'Brand', 'Illustration', 'Print'],
    link: 'https://behance.net/',
    align: 'left' as const,
  },
  {
    id: '115', title: 'OBSIDIAN', category: 'Dark Luxury UI', year: '2026',
    image: '/logo/logo_myth.png', video: '/videos/obsidian.mp4',
    gallery: ['/logo/logo_myth.png', '/logo/logo_myth.png'],
    client: 'Obsidian Corp',
    description: 'Interface de luxo sombrio para plataforma de serviços premium. Dark UI com foco em tipografia e micro-interações.',
    services: ['UI/UX', '3D', 'Interaction', 'Dark UI'],
    link: 'https://behance.net/',
    align: 'right' as const,
  },
  {
    id: '133', title: 'AETHER', category: '3D Simulation', year: '2026',
    image: '/logo/logo_myth.png', video: '/videos/aether.mp4',
    gallery: ['/logo/logo_myth.png', '/logo/logo_myth.png', '/logo/logo_myth.png'],
    client: 'Aether Labs',
    description: 'Simulação 3D e visualização de dados científicos para laboratório de pesquisa em física de partículas.',
    services: ['3D Design', 'WebGL', 'Data Vis', 'Motion'],
    link: 'https://behance.net/',
    align: 'center' as const,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// LIQUID SHADER
// ─────────────────────────────────────────────────────────────────────────────

const MythLiquidShaderMaterial = shaderMaterial(
  {
    uTexture: new THREE.Texture(), uVideoTexture: new THREE.Texture(),
    uVelocity: 0, uTime: 0, uHover: 0,
    uMouse: new THREE.Vector2(0.5, 0.5), uFocus: 0, uWarp: 0,
  },
  `
    uniform float uVelocity; uniform float uTime; uniform float uFocus; uniform float uWarp;
    varying vec2 vUv; varying float vElevation;
    vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
    vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
    vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
    float snoise(vec3 v){
      const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
      vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
      vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;
      vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
      vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
      i=mod289(i);
      vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
      vec3 ns=0.142857142857*D.wyz-D.xzx;
      vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
      vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
      vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
      vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
      vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
      vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
      vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
      p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
      vec4 m=max(.5-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
      m=m*m;return 105.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
    }
    void main(){
      vUv=uv;vec3 pos=position;
      float elevation=snoise(vec3(pos.x*1.5+uTime,pos.y,pos.z))*(0.8*uVelocity+uWarp*2.);
      float distToCenter=distance(uv,vec2(.5));
      float focusCurve=(1.-uFocus)*distToCenter*3.;
      pos.z+=elevation-focusCurve+(uWarp*distToCenter*10.);
      vElevation=elevation;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.);
    }
  `,
  `
    uniform sampler2D uTexture;uniform sampler2D uVideoTexture;
    uniform float uVelocity;uniform float uHover;uniform float uTime;
    uniform vec2 uMouse;uniform float uFocus;uniform float uWarp;
    varying vec2 vUv;varying float vElevation;
    void main(){
      vec2 uv=vUv;
      float sliceY=floor(uv.y*100.);
      float tear=sin(sliceY*15.+uTime*20.)*0.015*uHover;
      uv.x+=tear+(uWarp*sin(uv.y*50.+uTime*30.)*0.1);
      float distToMouse=distance(uv,uMouse);
      float ripple=sin(distToMouse*50.-uTime*12.)*exp(-distToMouse*6.);
      uv+=ripple*0.05*uHover;
      uv-=.5;uv*=1.-(uHover*.06)-(uVelocity*.03)-(uWarp*.2);uv+=.5;
      float shift=uVelocity*.08+(vElevation*.1)+(ripple*.03)+(uWarp*.1);
      vec3 texColor=texture2D(uTexture,uv).rgb;
      vec3 vidColor=texture2D(uVideoTexture,uv).rgb;
      vec3 baseColor=mix(texColor,vidColor,uHover);
      vec2 grid=fract(uv*60.+uTime*.2);
      float line=step(.96,max(grid.x,grid.y));
      vec3 holoGrid=vec3(.69,.55,.40)*line*0.22*(1.-uFocus);
      float dimFactor=0.85+uFocus*0.15;
      dimFactor=max(dimFactor,uHover*1.0);
      float edgeDim=1.-smoothstep(0.3,0.5,distance(uv,vec2(.5)))*(1.-uFocus)*0.5;
      vec3 finalColor=baseColor*dimFactor*edgeDim+holoGrid;
      finalColor+=pow(baseColor,vec3(2.5))*.35*uHover;
      finalColor=mix(finalColor,vec3(1.,.85,.6),uWarp);
      gl_FragColor=vec4(finalColor,1.);
    }
  `
);
extend({ MythLiquidShaderMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements { mythLiquidShaderMaterial: any; }
}

// ─────────────────────────────────────────────────────────────────────────────
// CURSOR LENS
// ─────────────────────────────────────────────────────────────────────────────

function CursorLens({ activeProject }: { activeProject: number | null }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, mouse } = useThree();
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const targetScale = activeProject !== null ? 0 : 0.9;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    if (activeProject === null) {
      const tx = (mouse.x * viewport.width) / 2;
      const ty = (mouse.y * viewport.height) / 2;
      meshRef.current.position.x = THREE.MathUtils.damp(meshRef.current.position.x, tx, 8, delta);
      meshRef.current.position.y = THREE.MathUtils.damp(meshRef.current.position.y, ty, 8, delta);
      meshRef.current.rotation.x += delta * 0.8;
      meshRef.current.rotation.y += delta * 0.4;
    }
  });
  return (
    <Float speed={3} rotationIntensity={3} floatIntensity={1.5}>
      <Trail width={3} color={GOLD} length={10} decay={2} local={false}>
        <mesh ref={meshRef} position={[0, 0, 6]}>
          <icosahedronGeometry args={[1, 5]} />
          <MeshTransmissionMaterial
            backside samples={6} thickness={4}
            chromaticAberration={3} anisotropy={0.8} ior={1.6}
            distortion={0.8} distortionScale={1} temporalDistortion={0.4}
            color="#FFD9A0"
          />
        </mesh>
      </Trail>
    </Float>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT PLANE
// ─────────────────────────────────────────────────────────────────────────────

function ProjectPlane({
  url, video, index, scrollYProgress, globalVelocity, activeProject, setActiveProject, setIsHoveringPlane
}: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const [isHovered, setIsHovered] = useState(false);

  const dummyTex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 2; c.height = 2;
    const ctx = c.getContext('2d');
    if (ctx) { ctx.fillStyle = '#111'; ctx.fillRect(0, 0, 2, 2); }
    return new THREE.CanvasTexture(c);
  }, []);

  const [texture, setTexture] = useState<THREE.Texture>(dummyTex);
  const [videoTexture, setVideoTexture] = useState<THREE.Texture>(dummyTex);

  useEffect(() => {
    new THREE.TextureLoader().load(url, (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      setTexture(t);
    });
  }, [url]);

  useEffect(() => {
    if (!video) return;
    const vid = document.createElement('video');
    Object.assign(vid, { src: video, crossOrigin: 'Anonymous', loop: true, muted: true, playsInline: true });
    vid.oncanplay = () => {
      const t = new THREE.VideoTexture(vid);
      t.colorSpace = THREE.SRGBColorSpace;
      setVideoTexture(t);
    };
    vid.load();
    return () => {
      vid.pause();
      try { vid.removeAttribute('src'); vid.load(); } catch (e) {}
    };
  }, [video]);

  const { viewport, mouse, camera } = useThree();
  const warpState = useRef(0);
  const focusState = useRef(0);

  const planeW = viewport.width > 5 ? viewport.width * 0.45 : viewport.width * 0.8;
  const planeH = planeW * 1.3;
  const gap = planeH * 1.8;

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;

    const vidEl = videoTexture?.image as HTMLVideoElement;
    if (vidEl?.play) {
      if (isHovered || activeProject === index) vidEl.play().catch(() => {});
      else vidEl.pause();
    }

    if (activeProject !== null) {
      if (activeProject === index) {
        meshRef.current.position.x = THREE.MathUtils.damp(meshRef.current.position.x, 0, 4, delta);
        meshRef.current.position.y = THREE.MathUtils.damp(meshRef.current.position.y, camera.position.y, 4, delta);
        meshRef.current.position.z = THREE.MathUtils.damp(meshRef.current.position.z, camera.position.z - 3, 2, delta);
        meshRef.current.rotation.x = THREE.MathUtils.damp(meshRef.current.rotation.x, 0, 4, delta);
        meshRef.current.rotation.y = THREE.MathUtils.damp(meshRef.current.rotation.y, 0, 4, delta);
        warpState.current = THREE.MathUtils.damp(warpState.current, 1.0, 2, delta);
      } else {
        meshRef.current.position.z = THREE.MathUtils.damp(meshRef.current.position.z, -50, 2, delta);
        warpState.current = 0;
      }
    } else {
      warpState.current = THREE.MathUtils.damp(warpState.current, 0, 4, delta);
      const scrollOffset = scrollYProgress.get();
      const targetY = (index * -gap) + (scrollOffset * PORTFOLIO_DATA.length * gap);
      meshRef.current.position.y = THREE.MathUtils.damp(meshRef.current.position.y, targetY, 6, delta);
      const xOff = index % 2 === 0 ? -viewport.width * 0.2 : viewport.width * 0.2;
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, xOff, 0.1);
      const distFromCenter = Math.abs(meshRef.current.position.y - camera.position.y);
      const focus = Math.max(0, 1 - distFromCenter / (planeH * 0.8));
      focusState.current = THREE.MathUtils.damp(focusState.current, focus, 4, delta);
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, focusState.current * 4 - 4, 0.1);
      meshRef.current.scale.setScalar(1 + focusState.current * 0.1);
      meshRef.current.rotation.x = THREE.MathUtils.damp(meshRef.current.rotation.x, (mouse.y * Math.PI / 4) * focusState.current, 4, delta);
      meshRef.current.rotation.y = THREE.MathUtils.damp(meshRef.current.rotation.y, (mouse.x * Math.PI / 4) * focusState.current, 4, delta);
    }

    materialRef.current.uTime = state.clock.elapsedTime;
    materialRef.current.uVelocity = Math.abs(globalVelocity.current * 0.005);
    materialRef.current.uHover = THREE.MathUtils.damp(materialRef.current.uHover, isHovered ? 1 : 0, 6, delta);
    materialRef.current.uFocus = focusState.current;
    materialRef.current.uWarp = warpState.current;
  });

  return (
    <mesh
      ref={meshRef}
      onClick={() => { if (activeProject === null) setActiveProject(index); }}
      onPointerMove={(e) => { if (materialRef.current) materialRef.current.uMouse = e.uv; }}
      onPointerOver={() => { setIsHovered(true); if (setIsHoveringPlane) setIsHoveringPlane(true); document.body.style.cursor = 'crosshair'; }}
      onPointerOut={() => { setIsHovered(false); if (setIsHoveringPlane) setIsHoveringPlane(false); document.body.style.cursor = 'none'; }}
    >
      <planeGeometry args={[planeW, planeH, 128, 128]} />
      <mythLiquidShaderMaterial
        ref={materialRef}
        uTexture={texture}
        uVideoTexture={videoTexture}
        transparent
      />
    </mesh>
  );
}

function CameraRig({ activeProject }: { activeProject: number | null }) {
  const { camera } = useThree();
  useFrame((state, delta) => {
    if (activeProject === null) {
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, Math.sin(state.clock.elapsedTime * 0.5) * 0.5, 0.05);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, Math.cos(state.clock.elapsedTime * 0.3) * 0.5, 0.05);
    }
  });
  return null;
}

function Scene({ scrollYProgress, globalVelocity, isGlitching, activeProject, setActiveProject, eventSource, setIsHoveringPlane }: any) {
  return (
    <Canvas
      eventSource={eventSource}
      eventPrefix="client"
      // FIX: pointerEvents none no Canvas para não bloquear eventos DOM,
      // mas o container pai NÃO deve ter transform/filter que quebre o backdrop-filter do HUD
      style={{ pointerEvents: 'none', touchAction: 'auto' }}
      camera={{ position: [0, 0, 14], fov: 45 }}
      gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={3} color="#FFD9A0" castShadow />
      <spotLight position={[-10, -10, 10]} intensity={2} color={GOLD} angle={0.5} penumbra={1} />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

      <CameraRig activeProject={activeProject} />

      <group>
        {PORTFOLIO_DATA.map((proj, idx) => (
          <ProjectPlane
            key={proj.id}
            url={proj.image} video={proj.video}
            index={idx}
            scrollYProgress={scrollYProgress}
            globalVelocity={globalVelocity}
            activeProject={activeProject}
            setActiveProject={setActiveProject}
            setIsHoveringPlane={setIsHoveringPlane}
          />
        ))}
      </group>

      <CursorLens activeProject={activeProject} />

      <EffectComposer enableNormalPass={false} multisampling={0}>
        <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} height={300} intensity={activeProject !== null ? 5 : 2.5} />
        <Scanline blendFunction={BlendFunction.OVERLAY} density={2.0} opacity={0.15} />
        <Noise opacity={0.08} blendFunction={BlendFunction.SOFT_LIGHT} />
        <Vignette eskil={false} offset={0.1} darkness={1.3} />
        <Glitch 
          delay={new THREE.Vector2(1.5, 3.5)} 
          duration={new THREE.Vector2(0.1, 0.3)} 
          strength={new THREE.Vector2(0.02, 0.08)} 
          active={isGlitching} 
          mode={GlitchMode.SPORADIC} 
          ratio={0.8} 
        />
      </EffectComposer>
    </Canvas>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM CURSOR
// ─────────────────────────────────────────────────────────────────────────────

function CustomCursor({ isHoveringPlane }: { isHoveringPlane: boolean }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  useEffect(() => {
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [x, y]);

  return (
    <motion.div
      style={{ x, y, translateX: '-50%', translateY: '-50%' }}
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
    >
      <motion.div
        animate={{
          width: isHoveringPlane ? 64 : 40,
          height: isHoveringPlane ? 64 : 40,
          borderColor: isHoveringPlane ? `rgba(176,142,104,0.9)` : `rgba(176,142,104,0.5)`,
        }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
        className="rounded-full border flex items-center justify-center"
      >
        <div className="w-1.5 h-1.5 bg-[#B08E68] rounded-full shadow-[0_0_10px_#B08E68]" />
        {isHoveringPlane && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute font-mono text-[7px] tracking-[0.35em] text-[#B08E68] top-[110%] left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            ABRIR
          </motion.span>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AUDIO TOGGLE
// ─────────────────────────────────────────────────────────────────────────────

function AudioToggle() {
  const [on, setOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (on) audioRef.current.play().catch(() => setOn(false));
      else audioRef.current.pause();
    }
  }, [on]);

  return (
    <>
      <audio ref={audioRef} loop src="/audio/ambient.mp3" />
      <button
        onClick={() => setOn(v => !v)}
        // FIX: removido hover:bg-white/15 que causava flash de inversão;
        // usando hover com escala de opacidade do gold em vez de branco
        className="flex items-center gap-3 group cursor-none pointer-events-auto px-6 py-3.5 rounded-full transition-all duration-300 relative overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.15)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      }}
    >
      {/* Shine highlight */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.06] to-transparent pointer-events-none" />
      {/* Gold glow hover — FIX: sem inversão de cor */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-full"
        style={{ background: 'rgba(176,142,104,0.12)', border: '1px solid rgba(176,142,104,0.35)' }}
      />

      <span className="font-mono text-[13px] tracking-[0.2em] uppercase text-white/70 group-hover:text-[#B08E68] transition-colors duration-300 font-semibold relative z-10">
        {on ? 'SND ON' : 'SND OFF'}
      </span>
      <div className="flex items-end gap-[2px] h-3.5 relative z-10">
        {[1, 2, 3, 4, 5].map(i => (
          <motion.div
            key={i}
            animate={{ height: on ? ['20%', '100%', '40%', '80%', '20%'] : '20%' }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear', delay: i * 0.1 }}
            className={`w-[2px] ${on ? 'bg-[#B08E68]' : 'bg-white/25 group-hover:bg-[#B08E68]/60'} transition-colors duration-300`}
          />
        ))}
      </div>
    </button>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FULLSCREEN LIGHTBOX
// ─────────────────────────────────────────────────────────────────────────────

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      <motion.img
        src={src} alt={alt}
        className="max-w-[90vw] max-h-[88vh] object-contain select-none"
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        // FIX: sem inversão — hover muda apenas opacidade da borda
        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full text-white/50 hover:text-white transition-all cursor-none"
        style={{ border: '1px solid rgba(255,255,255,0.15)' }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </button>
      <span className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[8px] tracking-[0.4em] text-white/25 uppercase">
        ESC ou clique para fechar
      </span>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT DETAIL PANEL
// ─────────────────────────────────────────────────────────────────────────────

function ProjectPanel({
  project, onClose, onPrev, onNext, hasPrev, hasNext, index, total,
}: {
  project: typeof PORTFOLIO_DATA[0];
  onClose: () => void; onPrev: () => void; onNext: () => void;
  hasPrev: boolean; hasNext: boolean; index: number; total: number;
}) {
  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const allImages = project?.gallery?.length > 0 ? project.gallery : (project?.image ? [project.image] : []);

  useEffect(() => { setActiveImg(0); }, [project.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { if (lightboxOpen) setLightboxOpen(false); else onClose(); }
      if (e.key === 'ArrowRight') { if (lightboxOpen) setActiveImg(i => (i + 1) % allImages.length); else if (hasNext) onNext(); }
      if (e.key === 'ArrowLeft') { if (lightboxOpen) setActiveImg(i => (i - 1 + allImages.length) % allImages.length); else if (hasPrev) onPrev(); }
      if (e.key === 'ArrowDown') { setActiveImg(i => (i + 1) % allImages.length); }
      if (e.key === 'ArrowUp') { setActiveImg(i => (i - 1 + allImages.length) % allImages.length); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onNext, onPrev, hasPrev, hasNext, lightboxOpen, allImages.length]);

  const goPrevImg = useCallback(() => setActiveImg(i => (i - 1 + allImages.length) % allImages.length), [allImages.length]);
  const goNextImg = useCallback(() => setActiveImg(i => (i + 1) % allImages.length), [allImages.length]);

  return (
    <>
      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox
            src={allImages[activeImg]}
            alt={`${project.title} — imagem ${activeImg + 1}`}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="fixed inset-0 z-50 flex items-stretch"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[6px]" onClick={onClose} />

        {/* Painel principal */}
        <motion.div
          className="relative ml-auto w-full max-w-[640px] h-full bg-[#070707] flex flex-col overflow-hidden z-10"
          // FIX: removido mixBlendMode inline — usamos border sem blend
          style={{ borderLeft: '1px solid rgba(232,228,222,0.055)' }}
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Barra de progresso topo */}
          <div className="absolute top-0 left-0 right-0 h-[1px] z-20" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <motion.div className="h-full bg-[#B08E68]"
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, delay: 0.25, ease: EASE_OUT }}
              style={{ transformOrigin: 'left' }} />
          </div>

          {/* ── HEADER ── */}
          {/* FIX: removido mixBlendMode e transform:translateZ — esses criavam stacking contexts
               que impediam o backdrop-filter dos elementos filhos de amostrar o canvas */}
          <div
            className="flex items-center justify-between px-4 md:px-7 pt-5 md:pt-7 pb-5 flex-shrink-0 z-10 relative overflow-hidden"
            style={{
              borderBottom: '1px solid rgba(232,228,222,0.055)',
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />
            <div className="flex items-center gap-3 relative z-10">
              <span className="font-mono text-[10px] tracking-[0.3em] text-[#B08E68] uppercase font-semibold">
                REF // {project.id}
              </span>
              <span className="w-[1px] h-3 bg-white/15" />
              <span className="font-mono text-[10px] tracking-[0.2em] text-white/40 uppercase">
                {project.category}
              </span>
            </div>
            {/* FIX: botão fechar sem inversão — hover gold, não branco */}
            <button onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full text-white/35 transition-all duration-300 cursor-none relative overflow-hidden group"
              style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
                style={{ background: 'rgba(176,142,104,0.15)', borderColor: 'rgba(176,142,104,0.4)' }} />
              <svg width="12" height="12" viewBox="0 0 11 11" fill="none"
                className="relative z-10 text-white/35 group-hover:text-[#B08E68] transition-colors duration-300">
                <path d="M1 1L10 10M10 1L1 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* ── GALERIA PRINCIPAL ── */}
          <div className="relative bg-black overflow-hidden flex-shrink-0" style={{ height: '48%' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${project.id}-${activeImg}`}
                className="absolute inset-0 w-full h-full"
                initial={{ opacity: 0, scale: 1.05, filter: 'blur(6px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.97, filter: 'blur(4px)' }}
                transition={{ duration: 0.45, ease: EASE_OUT }}
                onClick={() => setLightboxOpen(true)}
                style={{ cursor: 'none' }}
              >
                {allImages[activeImg] && (
                  <Image 
                    src={allImages[activeImg]}
                    alt={`${project.title} ${activeImg + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 640px"
                    priority
                    className="object-cover select-none"
                    draggable={false}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#070707] to-transparent pointer-events-none" />

            {/* Setas galeria — FIX: sem hover:bg-white */}
            {allImages.length > 1 && (
              <>
                <button onClick={goPrevImg}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-all cursor-none rounded-full overflow-hidden group"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-transparent" />
                  <svg width="14" height="14" viewBox="0 0 13 13" fill="none" className="relative z-10 group-hover:-translate-x-0.5 transition-transform">
                    <path d="M8.5 2L4 6.5L8.5 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button onClick={goNextImg}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-all cursor-none rounded-full overflow-hidden group"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  }}>
                  <div className="absolute inset-0 bg-gradient-to-bl from-white/[0.06] to-transparent" />
                  <svg width="14" height="14" viewBox="0 0 13 13" fill="none" className="relative z-10 group-hover:translate-x-0.5 transition-transform">
                    <path d="M4.5 2L9 6.5L4.5 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            )}

            {/* Counter + expand */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              {allImages.length > 1 && (
                <span className="font-mono text-[11px] tracking-[0.1em] text-white/70 px-3 py-1.5 rounded-sm relative overflow-hidden"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                  }}>
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent" />
                  <span className="relative z-10">{String(activeImg + 1).padStart(2, '0')} / {String(allImages.length).padStart(2, '0')}</span>
                </span>
              )}
              <button onClick={() => setLightboxOpen(true)}
                className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white transition-all cursor-none rounded-sm relative overflow-hidden group"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}>
                <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.06] to-transparent" />
                <svg width="12" height="12" viewBox="0 0 11 11" fill="none" className="relative z-10 group-hover:scale-110 transition-transform">
                  <path d="M1 4V1H4M7 1H10V4M10 7V10H7M4 10H1V7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {allImages.map((_, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`transition-all cursor-none rounded-full ${i === activeImg ? 'w-5 h-[3px] bg-[#B08E68]' : 'w-[3px] h-[3px] bg-white/30 hover:bg-white/60'}`} />
                ))}
              </div>
            )}
          </div>

          {/* ── THUMBNAIL STRIP ── */}
          {allImages.length > 1 && (
            <motion.div
              className="flex gap-1.5 px-4 md:px-7 py-3 overflow-x-auto flex-shrink-0"
              style={{ scrollbarWidth: 'none', borderBottom: '1px solid rgba(232,228,222,0.05)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {allImages.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`relative flex-shrink-0 overflow-hidden transition-all cursor-none ${i === activeImg ? 'opacity-100' : 'opacity-45 hover:opacity-75'}`}
                  style={{
                    width: 64, height: 48,
                    border: `1px solid ${i === activeImg ? 'rgba(176,142,104,0.8)' : 'rgba(232,228,222,0.06)'}`,
                  }}
                >
                  <Image src={img} alt="" fill sizes="64px" className="object-cover" draggable={false} />
                </button>
              ))}
            </motion.div>
          )}

          {/* ── INFO SCROLLÁVEL ── */}
          <div className="flex-1 overflow-y-auto flex flex-col" style={{ scrollbarWidth: 'none' }}>
            <div className="px-4 md:px-7 py-5 flex flex-col gap-5">

              <div className="overflow-hidden">
                <motion.h2
                  className="font-serif text-[clamp(1.8rem,4.5vw,2.8rem)] font-black uppercase leading-[0.88] tracking-tight text-white"
                  initial={{ y: '100%' }} animate={{ y: 0 }}
                  transition={{ duration: 0.65, ease: EASE_OUT, delay: 0.1 }}
                >
                  {project.title}
                </motion.h2>
              </div>

              <motion.div className="flex items-center gap-3"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}>
                <span className="font-mono text-[10px] tracking-[0.2em] text-white/40 uppercase">Cliente</span>
                <span className="font-mono text-[11px] tracking-[0.1em] text-white/80">{project.client}</span>
                <span className="ml-auto font-mono text-[11px] tracking-[0.15em] text-white/40">{project.year}</span>
              </motion.div>

              <motion.div className="h-[1px]"
                style={{ background: 'rgba(232,228,222,0.06)' }}
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                transition={{ duration: 0.55, ease: EASE_OUT, delay: 0.25 }}
                style={{ transformOrigin: 'left' }} />

              <motion.p
                className="font-sans text-[0.95rem] md:text-[1rem] leading-[1.8] text-white/60 font-light"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.3 }}>
                {project.description}
              </motion.p>

              <motion.div className="flex flex-col gap-2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.45, delay: 0.38 }}>
                <span className="font-mono text-[9px] tracking-[0.2em] text-white/30 uppercase mb-1">Serviços</span>
                <div className="flex flex-wrap gap-2">
                  {project.services?.map((s, i) => (
                    <motion.span key={s}
                      className="font-mono text-[10px] tracking-[0.1em] uppercase text-white/50 px-3 py-1.5 rounded-sm overflow-hidden relative group cursor-none transition-colors duration-300 hover:text-[#B08E68]"
                      style={{
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.04)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                      }}
                      initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.44 + i * 0.04 }}>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
                      <span className="relative z-10">{s}</span>
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ── CTAs ── */}
            <motion.div
              className="px-4 md:px-7 pb-5 md:pb-7 pt-2 flex flex-col gap-2 mt-auto"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}>

              {/*
                FIX: Behance — removido hover:bg-white hover:text-black (inversão de cor).
                Hover agora intensifica o gold sem virar preto-no-branco.
              */}
              <a href={project.link} target="_blank" rel="noreferrer"
                className="w-full py-4 font-mono text-[11px] font-bold tracking-[0.3em] uppercase text-center transition-all duration-300 cursor-none flex items-center justify-center gap-3 group rounded-full relative overflow-hidden"
                style={{
                  background: 'rgba(176,142,104,0.75)',
                  border: '1px solid rgba(176,142,104,0.5)',
                  color: 'rgba(5,5,5,0.9)',
                  backdropFilter: 'blur(40px)',
                  WebkitBackdropFilter: 'blur(40px)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(176,142,104,0.95)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 60px rgba(176,142,104,0.25), 0 0 0 1px rgba(176,142,104,0.6), inset 0 1px 0 rgba(255,255,255,0.3)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(176,142,104,0.75)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)';
                }}
              >
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform relative z-10">
                  <path d="M2 12L12 2M12 2H5M12 2V9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="relative z-10">Ver no Behance</span>
              </a>

              {/* Fechar — FIX: sem inversão */}
              <button onClick={onClose}
                className="w-full py-4 mt-2 font-mono text-[10px] tracking-[0.2em] uppercase transition-all duration-300 cursor-none rounded-full relative overflow-hidden group"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(40px)',
                  WebkitBackdropFilter: 'blur(40px)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.95)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)';
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
                <span className="relative z-10">Fechar projeto</span>
              </button>
            </motion.div>
          </div>

          {/* ── FOOTER prev/next ── */}
          <div className="flex-shrink-0 px-4 md:px-7 py-4 md:py-5 flex items-center justify-between bg-[#070707]"
            style={{ borderTop: '1px solid rgba(232,228,222,0.06)' }}>
            <button onClick={hasPrev ? onPrev : undefined}
              className={`flex items-center gap-2 font-mono text-[10px] tracking-[0.15em] uppercase transition-all cursor-none group ${hasPrev ? 'text-white/50 hover:text-[#B08E68]' : 'text-white/10 pointer-events-none'}`}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8 2L3 6L8 10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Anterior
            </button>

            <div className="font-mono text-[12px] tabular-nums">
              <span className="text-[#B08E68]">{String(index + 1).padStart(2, '0')}</span>
              <span className="text-white/20"> / {String(total).padStart(2, '0')}</span>
            </div>

            <button onClick={hasNext ? onNext : undefined}
              className={`flex items-center gap-2 font-mono text-[10px] tracking-[0.15em] uppercase transition-all cursor-none ${hasNext ? 'text-white/50 hover:text-[#B08E68]' : 'text-white/10 pointer-events-none'}`}>
              Próximo
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M4 2L9 6L4 10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <motion.div
            className="absolute bottom-20 left-7 font-mono text-[9px] tracking-[0.15em] text-white/20 uppercase pointer-events-none"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
            ESC fechar · ← → navegar · ↑↓ galeria
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL INDICATOR
// ─────────────────────────────────────────────────────────────────────────────

function ScrollIndicator({ progress, focusedIndex }: { progress: any; focusedIndex: number }) {
  const height = useTransform(progress, [0, 1], ['0%', '100%']);

  return (
    // FIX: removido mixBlendMode e transform:translateZ — preserva stacking context limpo
    // para o backdrop-filter funcionar corretamente sobre o canvas abaixo (z-10)
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-5 pointer-events-none px-4 py-8 rounded-full relative overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
      <div className="relative w-[1.5px] h-24 rounded-full overflow-hidden z-10"
        style={{ background: 'rgba(255,255,255,0.08)' }}>
        <motion.div
          className="absolute top-0 left-0 w-full bg-[#B08E68]"
          style={{ height }}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        {PORTFOLIO_DATA.map((_, i) => (
          <div
            key={i}
            className={`w-[3px] h-[3px] rounded-full transition-all duration-500 ${i === focusedIndex ? 'bg-[#B08E68] scale-150' : 'bg-white/20'}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const smoothProgress = useSpring(scrollYProgress, { damping: 20, stiffness: 90, mass: 0.5 });

  const [isGlitching, setIsGlitching] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const isGlitchingRef = useRef(false);
  const isScrollingRef = useRef(false);
  const [activeProject, setActiveProject] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isHoveringPlane, setIsHoveringPlane] = useState(false);
  const globalVelocity = useRef(0);

  const progressBarWidth = useTransform(smoothProgress, [0, 1], ['0%', '100%']);

  useEffect(() => {
    return smoothProgress.on('change', (v) => {
      const idx = Math.round(v * (PORTFOLIO_DATA.length - 1));
      setFocusedIndex(Math.max(0, Math.min(PORTFOLIO_DATA.length - 1, idx)));
    });
  }, [smoothProgress]);

  useEffect(() => {
    let last = window.scrollY;
    let rafId: number;
    const loop = () => {
      const vel = Math.abs(window.scrollY - last);
      
      const newGlitching = vel > 120;
      if (newGlitching !== isGlitchingRef.current) {
        isGlitchingRef.current = newGlitching;
        setIsGlitching(newGlitching);
      }
      
      const newScrolling = vel > 5;
      if (newScrolling !== isScrollingRef.current) {
        isScrollingRef.current = newScrolling;
        setIsScrolling(newScrolling);
      }

      globalVelocity.current = THREE.MathUtils.damp(globalVelocity.current, window.scrollY - last, 4, 0.016);
      last = window.scrollY;
      rafId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    document.body.style.overflow = activeProject !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [activeProject]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    gsap.fromTo(
      '.header-char',
      { y: '110%', opacity: 0, rotateX: -90, scale: 0.8 },
      { y: '0%', opacity: 1, rotateX: 0, scale: 1, stagger: 0.025, duration: 1.4, ease: 'expo.out', delay: 0.3 }
    );
    gsap.fromTo(
      '.hud-el',
      { opacity: 0 },
      { opacity: 1, stagger: 0.08, duration: 1.2, ease: 'power3.out', delay: 0.6 }
    );
  }, []);

  const currentProject = activeProject !== null ? PORTFOLIO_DATA[activeProject] : null;
  const totalH = `${PORTFOLIO_DATA.length * SCROLL_HEIGHT}vh`;

  return (
    /*
     * FIX PRINCIPAL — blur acima dos objetos 3D:
     *
     * REMOVIDO: className="... [&_*]:!mix-blend-normal ..."
     *   → Esse seletor aplicava mix-blend-mode:normal!important em TODOS os filhos,
     *     inclusive nos elementos com backdrop-filter. Isso não quebra o blur direto,
     *     mas cria inconsistências no compositing de layers no Chrome/Safari que fazem
     *     o backdrop-filter falhar em amostrar o canvas WebGL abaixo.
     *
     * REMOVIDO: style={{ mixBlendMode: 'normal' }} em elementos DOM individuais
     *   → Forçar mixBlendMode via inline style em elementos que já têm backdropFilter
     *     cria um novo stacking context com regra de isolamento que impede o blur
     *     de "ver" layers anteriores na pilha de compositing do browser.
     *
     * CORRETO: o canvas fica em z-10, o HUD em z-20, o backdrop-filter dos
     *   elementos glass amostra naturalmente a layer z-10 (canvas WebGL) abaixo.
     *   Nenhuma propriedade CSS deve criar isolation entre eles.
     */
    <main
      ref={containerRef}
      className="portfolio-page relative w-full text-white bg-black cursor-none overflow-x-hidden"
      style={{ height: activeProject === null ? totalH : '100vh' }}
    >
      <CustomCursor isHoveringPlane={isHoveringPlane} />

      {/* Glitch border */}
      <motion.div
        className="fixed inset-0 z-[100] pointer-events-none"
        style={{ border: '3px solid rgba(239,68,68,0.4)' }}
        animate={{ opacity: isGlitching && activeProject === null ? 1 : 0 }}
        transition={{ duration: 0.08 }}
      />

      {/*
       * FIX: canvas container SEM filtros/transforms que quebrariam o
       * backdrop-filter dos elementos HUD acima.
       * pointer-events:none aqui é correto — não afeta compositing.
       */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <Scene
          scrollYProgress={smoothProgress}
          globalVelocity={globalVelocity}
          isGlitching={isGlitching}
          activeProject={activeProject}
          setActiveProject={setActiveProject}
          eventSource={containerRef}
          setIsHoveringPlane={setIsHoveringPlane}
        />
      </div>

      {/* ── HUD PRINCIPAL ── */}
      <AnimatePresence>
        {activeProject === null && (
          <motion.div
            key="hud"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            // FIX: z-20 > z-10 (canvas) — backdrop-filter dos filhos amostra o canvas abaixo.
            // Sem isolation, sem mixBlendMode, sem transform que crie novo stacking context.
            className="fixed inset-0 z-20 pointer-events-none"
          >
            {/* Logo / título */}
            <div className="absolute top-8 left-10 md:top-10 md:left-12">
              <div className="font-serif text-[#B08E68] text-[clamp(2rem,5vw,5rem)] leading-[0.78] uppercase perspective-[1000px] overflow-hidden">
                {['Archive', 'Selected', 'Works'].map((word, wIdx) => (
                  <div key={wIdx} className="block overflow-hidden pb-1">
                    {word.split('').map((char, cIdx) => (
                      <span key={cIdx} className="header-char inline-block origin-bottom">
                        {char}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Nome do projeto em foco */}
            <div className="absolute bottom-1/4 left-0 right-0 flex flex-col items-center gap-3 pointer-events-none">
              <AnimatePresence mode="wait">
                <motion.div
                  key={focusedIndex}
                  initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -12, filter: 'blur(8px)' }}
                  transition={{ duration: 0.55, ease: EASE_OUT }}
                  className="flex flex-col items-center gap-3 text-center"
                >
                  {/* Category pill — FIX: glass sem mix-blend-mode */}
                  <span
                    className="font-mono text-[13px] tracking-[0.3em] text-[#B08E68] uppercase font-bold px-7 py-2.5 rounded-full relative overflow-hidden"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                      boxShadow: '0 15px 40px rgba(0,0,0,0.4)',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/[0.05] to-transparent" />
                    <span className="relative z-10">{PORTFOLIO_DATA[focusedIndex].category}</span>
                  </span>

                  {/* Title card — FIX: glass blur sobre o icosaedro/imagens */}
                  <div
                    className="px-12 py-10 my-3 relative overflow-hidden"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '4rem',
                      backdropFilter: 'blur(60px) saturate(140%)',
                      WebkitBackdropFilter: 'blur(60px) saturate(140%)',
                      boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-transparent pointer-events-none" />
                    <h2 className="font-serif text-[clamp(2.8rem,7vw,7.5rem)] uppercase leading-[0.85] text-white tracking-tight drop-shadow-2xl relative z-10"
                      style={{ WebkitTextStroke: '1px rgba(255,255,255,0.06)' }}>
                      {PORTFOLIO_DATA[focusedIndex].title}
                    </h2>
                  </div>

                  {/* Year + client pill */}
                  <span
                    className="font-mono text-[12px] tracking-[0.25em] text-white/90 uppercase px-8 py-3.5 rounded-full relative overflow-hidden"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                      boxShadow: '0 15px 40px rgba(0,0,0,0.4)',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-l from-white/[0.04] to-transparent" />
                    <span className="relative z-10">{PORTFOLIO_DATA[focusedIndex].year} · {PORTFOLIO_DATA[focusedIndex].client}</span>
                  </span>

                  {/* Botões — FIX: hover sem inversão preto/branco */}
                  <div className="flex items-center gap-5 mt-6 pointer-events-auto">
                    <a
                      href={PORTFOLIO_DATA[focusedIndex].link}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 px-9 py-4 font-mono text-[12px] tracking-[0.2em] uppercase font-bold rounded-full relative overflow-hidden transition-all duration-300 cursor-none group"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.25)',
                        color: '#B08E68',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(176,142,104,0.15)';
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(176,142,104,0.5)';
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 60px rgba(176,142,104,0.2)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)';
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 50px rgba(0,0,0,0.5)';
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.06] to-transparent pointer-events-none" />
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="relative z-10">
                        <path d="M1 9L9 1M9 1H4M9 1V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="relative z-10">Behance</span>
                    </a>

                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveProject(focusedIndex);
                      }}
                      className="font-mono text-[12px] tracking-[0.2em] text-white/80 uppercase px-8 py-4 rounded-full font-semibold relative overflow-hidden cursor-none hover:text-[#B08E68] transition-colors"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                      }}
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ repeat: Infinity, duration: 2.8 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
                      <span className="relative z-10 whitespace-nowrap">clique para abrir</span>
                    </motion.button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Audio toggle */}
            <div className="hud-el absolute bottom-8 right-8 md:bottom-10 md:right-12 pointer-events-auto">
              <AudioToggle />
            </div>

            {/* Barra de progresso inferior */}
            <div className="hud-el absolute bottom-0 left-0 right-0 h-[2px]"
              style={{ background: 'rgba(255,255,255,0.05)', boxShadow: '0 -2px 10px rgba(0,0,0,0.5)' }}>
              <motion.div
                className="h-full bg-[#B08E68]"
                style={{ width: progressBarWidth }}
              />
            </div>

            {/* Scroll hint */}
            <motion.div
              className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 pointer-events-none"
              initial={{ opacity: 1 }}
              animate={{ opacity: isScrolling ? 0 : 1 }}
              transition={{ duration: 0.5 }}
            >
              <span
                className="font-mono text-[13px] tracking-[0.3em] text-white/90 uppercase px-8 py-3.5 rounded-full font-semibold relative overflow-hidden"
                style={{
                  backdropFilter: 'blur(40px)',
                  WebkitBackdropFilter: 'blur(40px)',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.06] to-transparent opacity-50" />
                <span className="relative z-10">(scroll)</span>
              </span>
              <motion.div
                className="w-[2px] h-10 bg-[#B08E68]/80"
                animate={{ scaleY: [0, 1, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: 'top' }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeProject === null && (
        <ScrollIndicator progress={smoothProgress} focusedIndex={focusedIndex} />
      )}

      {/* ── PAINEL DE PROJETO ── */}
      <AnimatePresence>
        {currentProject && activeProject !== null && (
          <ProjectPanel
            key={activeProject}
            project={currentProject}
            index={activeProject}
            total={PORTFOLIO_DATA.length}
            onClose={() => setActiveProject(null)}
            onPrev={() => setActiveProject(p => (p !== null && p > 0 ? p - 1 : p))}
            onNext={() => setActiveProject(p => (p !== null && p < PORTFOLIO_DATA.length - 1 ? p + 1 : p))}
            hasPrev={activeProject > 0}
            hasNext={activeProject < PORTFOLIO_DATA.length - 1}
          />
        )}
      </AnimatePresence>

      {/* Spacer scroll */}
      <div className="relative z-0 pointer-events-none" style={{ paddingTop: '50vh', paddingBottom: '50vh' }}>
        {PORTFOLIO_DATA.map((proj) => (
          <div key={proj.id} style={{ height: `${SCROLL_HEIGHT}vh` }} />
        ))}
      </div>
    </main>
  );
}