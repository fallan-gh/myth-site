"use client";

import { useEffect, useRef, useState, useMemo, useCallback, Suspense } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useMotionValue } from 'framer-motion';
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
// LIQUID SHADER — preservado integral
// ─────────────────────────────────────────────────────────────────────────────

const MythLiquidShaderMaterial = shaderMaterial(
  {
    uTexture: new THREE.Texture(), uVideoTexture: new THREE.Texture(),
    uVelocity: 0, uTime: 0, uHover: 0,
    uMouse: new THREE.Vector2(0.5, 0.5), uFocus: 0, uWarp: 0,
  },
  // vertex
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
  // fragment
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

      // Grid holo sutil — apenas overlay leve fora de foco
      vec2 grid=fract(uv*60.+uTime*.2);
      float line=step(.96,max(grid.x,grid.y));
      vec3 holoGrid=vec3(.69,.55,.40)*line*0.22*(1.-uFocus);

      // Imagens mais visíveis, menor escurecimento quando fora de foco
      float dimFactor=0.85+uFocus*0.15;
      // Boost extra no hover (vídeo) 
      dimFactor=max(dimFactor,uHover*1.0);
      
      // Leve vinheta dourada nas bordas quando fora de foco
      float edgeDim=1.-smoothstep(0.3,0.5,distance(uv,vec2(.5)))*(1.-uFocus)*0.5;
      
      vec3 finalColor=baseColor*dimFactor*edgeDim+holoGrid;
      // Brilho extra no hover
      finalColor+=pow(baseColor,vec3(2.5))*.35*uHover;
      // Flash no warp
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
// CURSOR LENS — icosahedron de identidade, preservado
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
// PROJECT PLANE — preservado integral
// ─────────────────────────────────────────────────────────────────────────────

function ProjectPlane({
  url, video, index, scrollYProgress, globalVelocity, activeProject, setActiveProject
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
      onPointerOver={() => { setIsHovered(true); document.body.style.cursor = 'crosshair'; }}
      onPointerOut={() => { setIsHovered(false); document.body.style.cursor = 'none'; }}
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

function Scene({ scrollYProgress, globalVelocity, isGlitching, activeProject, setActiveProject, eventSource }: any) {
  return (
    <Canvas
      eventSource={eventSource}
      eventPrefix="client"
      style={{ pointerEvents: 'none', touchAction: 'auto' }}
      camera={{ position: [0, 0, 14], fov: 45 }}
      gl={{ antialias: false, powerPreference: 'high-performance', alpha: false }}
    >
      <color attach="background" args={['#000000']} />
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
          />
        ))}
      </group>

      <CursorLens activeProject={activeProject} />

      <EffectComposer disableNormalPass multisampling={0}>
        <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} height={300} intensity={activeProject !== null ? 5 : 2.5} />
        <Scanline blendFunction={BlendFunction.OVERLAY} density={2.0} opacity={0.15} />
        <Noise opacity={0.08} blendFunction={BlendFunction.SOFT_LIGHT} />
        <Vignette eskil={false} offset={0.1} darkness={1.3} />
        <Glitch delay={[1.5, 3.5]} duration={[0.1, 0.3]} strength={[0.02, 0.08]} active={isGlitching} mode={GlitchMode.SPORADIC} ratio={0.8} />
      </EffectComposer>
    </Canvas>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM CURSOR — dom
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
        <div className="w-1.5 h-1.5 bg-[var(--gold)] rounded-full shadow-[0_0_10px_var(--gold)]" />
        {isHoveringPlane && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute font-mono text-[7px] tracking-[0.35em] text-[var(--gold)] top-[110%] left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            ABRIR
          </motion.span>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE CLOCK
// ─────────────────────────────────────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const ms = now.getMilliseconds().toString().padStart(3, '0').slice(0, 2);
      setTime(
        now.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour12: false }) + ':' + ms
      );
    };
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[var(--gold)]">SYS.TIME // {time}</span>
      <span>LAT: -19.47  LON: -46.54</span>
      <span>IBIÁ, MG · CORE SERVER</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AUDIO TOGGLE
// ─────────────────────────────────────────────────────────────────────────────

function AudioToggle() {
  const [on, setOn] = useState(false);
  return (
    <button
      onClick={() => setOn(v => !v)}
      className="flex items-center gap-3 group cursor-none pointer-events-auto px-6 py-3.5 bg-white/10 border border-white/30 rounded-full hover:bg-white/20 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
      style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
    >
      <span className="font-mono text-[13px] tracking-[0.2em] uppercase text-white/80 group-hover:text-[var(--gold)] transition-colors font-semibold">
        {on ? 'SND ON' : 'SND OFF'}
      </span>
      <div className="flex items-end gap-[2px] h-3.5">
        {[1, 2, 3, 4, 5].map(i => (
          <motion.div
            key={i}
            animate={{ height: on ? ['20%', '100%', '40%', '80%', '20%'] : '20%' }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear', delay: i * 0.1 }}
            className={`w-[2px] ${on ? 'bg-[var(--gold)]' : 'bg-white/30 group-hover:bg-white/60'} transition-colors`}
          />
        ))}
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FULLSCREEN LIGHTBOX — imagem ampliada
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
        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center border border-white/20 rounded-full text-white/50 hover:text-white hover:border-white/50 transition-all cursor-none"
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
// PROJECT DETAIL PANEL — galeria real, fullscreen, Behance proeminente
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
  const allImages = project.gallery.length > 0 ? project.gallery : [project.image];

  // Reset gallery quando muda de projeto
  useEffect(() => { setActiveImg(0); }, [project.id]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { if (lightboxOpen) setLightboxOpen(false); else onClose(); }
      if (e.key === 'ArrowRight') { if (lightboxOpen) setActiveImg(i => (i + 1) % allImages.length); else if (hasNext) onNext(); }
      if (e.key === 'ArrowLeft') { if (lightboxOpen) setActiveImg(i => (i - 1 + allImages.length) % allImages.length); else if (hasPrev) onPrev(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onNext, onPrev, hasPrev, hasNext, lightboxOpen, allImages.length]);

  const goPrevImg = useCallback(() => setActiveImg(i => (i - 1 + allImages.length) % allImages.length), [allImages.length]);
  const goNextImg = useCallback(() => setActiveImg(i => (i + 1) % allImages.length), [allImages.length]);

  return (
    <>
      {/* Lightbox fullscreen */}
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
          className="relative ml-auto w-full max-w-[640px] h-full bg-[#070707] border-l border-white/[0.07] flex flex-col overflow-hidden z-10"
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Barra de progresso topo */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/5 z-20">
            <motion.div className="h-full bg-[var(--gold)]"
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, delay: 0.25, ease: EASE_OUT }}
              style={{ transformOrigin: 'left' }} />
          </div>

          {/* ── HEADER ── */}
          <div className="flex items-center justify-between px-7 pt-7 pb-4 border-b border-white/[0.06] flex-shrink-0 z-10">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] tracking-[0.3em] text-[var(--gold)] uppercase font-semibold">
                REF // {project.id}
              </span>
              <span className="w-[1px] h-3 bg-white/15" />
              <span className="font-mono text-[10px] tracking-[0.2em] text-white/40 uppercase">
                {project.category}
              </span>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center border border-white/10 rounded-full text-white/35 hover:text-white hover:border-white/35 transition-all cursor-none">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M1 1L10 10M10 1L1 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* ── GALERIA PRINCIPAL — ocupa 50% da altura ── */}
          <div className="relative bg-black overflow-hidden flex-shrink-0" style={{ height: '48%' }}>

            {/* Imagem principal com AnimatePresence */}
            <AnimatePresence mode="wait">
              <motion.img
                key={`${project.id}-${activeImg}`}
                src={allImages[activeImg]}
                alt={`${project.title} ${activeImg + 1}`}
                className="w-full h-full object-cover select-none"
                initial={{ opacity: 0, scale: 1.05, filter: 'blur(6px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.97, filter: 'blur(4px)' }}
                transition={{ duration: 0.45, ease: EASE_OUT }}
                onClick={() => setLightboxOpen(true)}
                style={{ cursor: 'none' }}
                draggable={false}
              />
            </AnimatePresence>

            {/* Gradiente inferior */}
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#070707] to-transparent pointer-events-none" />

            {/* Setas de navegação da galeria — sobre a imagem */}
            {allImages.length > 1 && (
              <>
                <button onClick={goPrevImg}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-black/55 border border-white/10 backdrop-blur-sm text-white/60 hover:text-white hover:border-white/30 transition-all cursor-none rounded-sm">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M8.5 2L4 6.5L8.5 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button onClick={goNextImg}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-black/55 border border-white/10 backdrop-blur-sm text-white/60 hover:text-white hover:border-white/30 transition-all cursor-none rounded-sm">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M4.5 2L9 6.5L4.5 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            )}

            {/* Counter + expand — canto superior direito */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              {allImages.length > 1 && (
                <span className="font-mono text-[11px] tracking-[0.1em] text-white/70 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-sm">
                  {String(activeImg + 1).padStart(2, '0')} / {String(allImages.length).padStart(2, '0')}
                </span>
              )}
              {/* Botão fullscreen */}
              <button onClick={() => setLightboxOpen(true)}
                className="w-7 h-7 flex items-center justify-center bg-black/60 backdrop-blur-sm border border-white/10 text-white/40 hover:text-white transition-all cursor-none">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M1 4V1H4M7 1H10V4M10 7V10H7M4 10H1V7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Dots indicadores — centro inferior */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {allImages.map((_, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`transition-all cursor-none rounded-full ${i === activeImg ? 'w-5 h-[3px] bg-[var(--gold)]' : 'w-[3px] h-[3px] bg-white/30 hover:bg-white/60'}`} />
                ))}
              </div>
            )}
          </div>

          {/* ── THUMBNAIL STRIP ── */}
          {allImages.length > 1 && (
            <motion.div
              className="flex gap-1.5 px-7 py-3 overflow-x-auto border-b border-white/[0.05] flex-shrink-0"
              style={{ scrollbarWidth: 'none' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {allImages.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`flex-shrink-0 overflow-hidden transition-all cursor-none border ${i === activeImg ? 'border-[var(--gold)] opacity-100' : 'border-white/[0.06] opacity-45 hover:opacity-75 hover:border-white/20'}`}
                  style={{ width: 64, height: 48 }}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" draggable={false} />
                </button>
              ))}
            </motion.div>
          )}

          {/* ── INFO SCROLLÁVEL ── */}
          <div className="flex-1 overflow-y-auto flex flex-col" style={{ scrollbarWidth: 'none' }}>
            <div className="px-7 py-5 flex flex-col gap-5">

              {/* Título */}
              <div className="overflow-hidden">
                <motion.h2
                  className="font-serif text-[clamp(1.8rem,4.5vw,2.8rem)] font-black uppercase leading-[0.88] tracking-tight text-white"
                  initial={{ y: '100%' }} animate={{ y: 0 }}
                  transition={{ duration: 0.65, ease: EASE_OUT, delay: 0.1 }}
                >
                  {project.title}
                </motion.h2>
              </div>

              {/* Cliente + ano inline */}
              <motion.div className="flex items-center gap-3"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}>
                <span className="font-mono text-[10px] tracking-[0.2em] text-white/40 uppercase">Cliente</span>
                <span className="font-mono text-[11px] tracking-[0.1em] text-white/80">{project.client}</span>
                <span className="ml-auto font-mono text-[11px] tracking-[0.15em] text-white/40">{project.year}</span>
              </motion.div>

              {/* Divisória */}
              <motion.div className="h-[1px] bg-white/[0.06]"
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                transition={{ duration: 0.55, ease: EASE_OUT, delay: 0.25 }}
                style={{ transformOrigin: 'left' }} />

              {/* Descrição */}
              <motion.p
                className="font-sans text-[0.95rem] md:text-[1rem] leading-[1.8] text-white/60 font-light"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.3 }}>
                {project.description}
              </motion.p>

              {/* Tags serviços */}
              <motion.div className="flex flex-col gap-2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.45, delay: 0.38 }}>
                <span className="font-mono text-[9px] tracking-[0.2em] text-white/30 uppercase mb-1">Serviços</span>
                <div className="flex flex-wrap gap-2">
                  {project.services.map((s, i) => (
                    <motion.span key={s}
                      className="font-mono text-[10px] tracking-[0.1em] uppercase text-white/60 border border-white/[0.12] px-3 py-1 hover:border-[var(--gold)]/50 hover:text-[var(--gold)] transition-all cursor-none"
                      initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.44 + i * 0.04 }}>
                      {s}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ── CTAs — Behance + fechar ── */}
            <motion.div
              className="px-7 pb-7 pt-2 flex flex-col gap-2 mt-auto"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}>

              {/* Behance — botão principal, ouro */}
              <a href={project.link} target="_blank" rel="noreferrer"
                className="w-full py-4 bg-[var(--gold)]/90 text-black font-mono text-[11px] font-bold tracking-[0.3em] uppercase text-center hover:bg-white rounded-full transition-all duration-300 cursor-none flex items-center justify-center gap-3 group shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                style={{ backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                  <path d="M2 12L12 2M12 2H5M12 2V9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Ver no Behance
              </a>

              {/* Fechar — secundário, borda */}
              <button onClick={onClose}
                className="w-full py-4 mt-2 bg-white/10 border border-white/30 rounded-full text-white/90 font-mono text-[10px] tracking-[0.2em] uppercase hover:bg-white/20 hover:text-white transition-all cursor-none shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                style={{ backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)' }}>
                Fechar projeto
              </button>
            </motion.div>
          </div>

          {/* ── FOOTER — prev/next + contador ── */}
          <div className="flex-shrink-0 border-t border-white/[0.06] px-7 py-5 flex items-center justify-between bg-[#070707]">
            <button onClick={hasPrev ? onPrev : undefined}
              className={`flex items-center gap-2 font-mono text-[10px] tracking-[0.15em] uppercase transition-all cursor-none group ${hasPrev ? 'text-white/50 hover:text-[var(--gold)]' : 'text-white/10 pointer-events-none'}`}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8 2L3 6L8 10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Anterior
            </button>

            <div className="font-mono text-[12px] tabular-nums">
              <span className="text-[var(--gold)]">{String(index + 1).padStart(2, '0')}</span>
              <span className="text-white/20"> / {String(total).padStart(2, '0')}</span>
            </div>

            <button onClick={hasNext ? onNext : undefined}
              className={`flex items-center gap-2 font-mono text-[10px] tracking-[0.15em] uppercase transition-all cursor-none ${hasNext ? 'text-white/50 hover:text-[var(--gold)]' : 'text-white/10 pointer-events-none'}`}>
              Próximo
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M4 2L9 6L4 10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Hint teclado */}
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
// SCROLL INDICATOR — barra lateral
// ─────────────────────────────────────────────────────────────────────────────

function ScrollIndicator({ progress, focusedIndex }: { progress: any; focusedIndex: number }) {
  const height = useTransform(progress, [0, 1], ['0%', '100%']);

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-3 pointer-events-none">
      {/* Barra de progresso vertical */}
      <div className="relative w-[1px] h-24 bg-white/10">
        <motion.div
          className="absolute top-0 left-0 w-full bg-[var(--gold)]"
          style={{ height }}
        />
      </div>

      {/* Dots por projeto */}
      <div className="flex flex-col gap-1.5">
        {PORTFOLIO_DATA.map((_, i) => (
          <div
            key={i}
            className={`w-[3px] h-[3px] rounded-full transition-all duration-500 ${i === focusedIndex ? 'bg-[var(--gold)] scale-150' : 'bg-white/20'}`}
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
  const [scrollVel, setScrollVel] = useState(0);
  const [activeProject, setActiveProject] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isHoveringPlane, setIsHoveringPlane] = useState(false);
  const globalVelocity = useRef(0);
  
  // Hooks de Framer Motion extraídos do JSX para evitar erro de hook condicional
  const progressBarWidth = useTransform(smoothProgress, [0, 1], ['0%', '100%']);
  const scrollDotProgress = useTransform(smoothProgress, [0, 1], ['0%', '100%']);

  // Detecta projeto em foco pelo scroll
  useEffect(() => {
    return smoothProgress.on('change', (v) => {
      const idx = Math.round(v * (PORTFOLIO_DATA.length - 1));
      setFocusedIndex(Math.max(0, Math.min(PORTFOLIO_DATA.length - 1, idx)));
    });
  }, [smoothProgress]);

  // Scroll velocity + glitch
  useEffect(() => {
    let last = window.scrollY;
    let rafId: number;
    const loop = () => {
      const vel = Math.abs(window.scrollY - last);
      setScrollVel(vel);
      setIsGlitching(vel > 120);
      globalVelocity.current = THREE.MathUtils.damp(globalVelocity.current, window.scrollY - last, 4, 0.016);
      last = window.scrollY;
      rafId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Block scroll when project open
  useEffect(() => {
    document.body.style.overflow = activeProject !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [activeProject]);

  // Header entrance
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
    <main
      ref={containerRef}
      className="relative w-full text-white bg-black cursor-none overflow-x-hidden"
      style={{ height: activeProject === null ? totalH : '100vh' }}
    >
      <CustomCursor isHoveringPlane={isHoveringPlane} />

      {/* Glitch border */}
      <motion.div
        className="fixed inset-0 z-[100] pointer-events-none border-[3px] border-red-500/40"
        animate={{ opacity: isGlitching && activeProject === null ? 1 : 0 }}
        transition={{ duration: 0.08 }}
      />

      {/* WebGL Canvas */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <Scene
          scrollYProgress={smoothProgress}
          globalVelocity={globalVelocity}
          isGlitching={isGlitching}
          activeProject={activeProject}
          setActiveProject={setActiveProject}
          eventSource={containerRef}
        />
      </div>

      {/* ── HUD PRINCIPAL — visível apenas na galeria ── */}
      <AnimatePresence>
        {activeProject === null && (
          <motion.div
            key="hud"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-20 pointer-events-none"
          >
            {/* Logo / título */}
            <div className="absolute top-8 left-10 md:top-10 md:left-12">
              <div className="font-serif text-[var(--gold)] text-[clamp(2rem,5vw,5rem)] leading-[0.78] uppercase perspective-[1000px] overflow-hidden">
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

            {/* Status HUD — canto superior direito */}
            <div className="hud-el absolute top-8 right-20 md:top-10 md:right-24 flex flex-col items-end gap-1.5 font-mono text-[12px] md:text-[13px] tracking-[0.15em] uppercase text-white/90 px-8 py-4 bg-white/10 border border-white/30 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]" style={{ backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)' }}>
              <span className={isGlitching ? 'text-red-400 animate-pulse font-bold' : 'text-[var(--gold)] font-bold'}>
                {isGlitching ? '⚠ SYSTEM OVERLOAD' : 'V-SYNC ACTIVE'}
              </span>
              <span>VEL: {scrollVel}px/f</span>
            </div>

            {/* Nome do projeto em foco — centro inferior */}
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
                  <span className="font-mono text-[13px] tracking-[0.3em] text-[var(--gold)] uppercase font-bold px-7 py-2.5 bg-white/10 border border-white/30 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4)]" style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
                    {PORTFOLIO_DATA[focusedIndex].category}
                  </span>
                  <div className="px-12 py-8 bg-white/5 border border-white/20 rounded-[3rem] my-3 shadow-[0_16px_60px_rgba(0,0,0,0.6)]" style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
                    <h2 className="font-serif text-[clamp(2.8rem,7vw,7.5rem)] uppercase leading-[0.85] text-white tracking-tight [-webkit-text-stroke:1px_rgba(255,255,255,0.08)] drop-shadow-md">
                      {PORTFOLIO_DATA[focusedIndex].title}
                    </h2>
                  </div>
                  <span className="font-mono text-[12px] tracking-[0.25em] text-white/90 uppercase px-8 py-3 bg-white/10 border border-white/30 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4)]" style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
                    {PORTFOLIO_DATA[focusedIndex].year} · {PORTFOLIO_DATA[focusedIndex].client}
                  </span>
                  {/* Botões de ação — Behance + Abrir */}
                  <div className="flex items-center gap-5 mt-6 pointer-events-auto">
                    <a
                      href={PORTFOLIO_DATA[focusedIndex].link}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 px-9 py-4 border border-white/40 text-[var(--gold)] font-mono text-[12px] tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all duration-300 cursor-none bg-white/10 font-bold rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                      style={{ backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)' }}
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1 9L9 1M9 1H4M9 1V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Behance
                    </a>
                    <motion.span
                      className="font-mono text-[12px] tracking-[0.2em] text-white/90 uppercase px-8 py-4 bg-white/10 border border-white/30 rounded-full font-semibold shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                      style={{ backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)' }}
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ repeat: Infinity, duration: 2.8 }}
                    >
                      clique para abrir
                    </motion.span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Clock + coords — canto inferior esquerdo */}
            <div className="hud-el absolute bottom-8 left-8 md:bottom-10 md:left-12 font-mono text-[12px] md:text-[13px] tracking-[0.15em] uppercase text-white/90 flex flex-col gap-1 pointer-events-none px-8 py-4 bg-white/10 border border-white/30 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]" style={{ backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)' }}>
              <LiveClock />
            </div>

            {/* Audio toggle — canto inferior direito */}
            <div className="hud-el absolute bottom-8 right-8 md:bottom-10 md:right-12 pointer-events-auto">
              <AudioToggle />
            </div>

            {/* Barra de progresso inferior */}
            <div className="hud-el absolute bottom-0 left-0 right-0 h-[2px] bg-white/5 shadow-[0_-2px_10px_rgba(0,0,0,0.5)]">
              <motion.div
                className="h-full bg-[var(--gold)]"
                style={{ width: progressBarWidth }}
              />
            </div>

            {/* Scroll hint — apenas no início */}
            <motion.div
              className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 pointer-events-none"
              initial={{ opacity: 1 }}
              animate={{ opacity: scrollVel > 0 ? 0 : 1 }}
              transition={{ duration: 0.5 }}
            >
              <span className="font-mono text-[13px] tracking-[0.3em] text-white/90 uppercase px-8 py-3.5 bg-white/10 border border-white/30 rounded-full font-semibold shadow-[0_8px_32px_rgba(0,0,0,0.4)]" style={{ backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)' }}>(scroll)</span>
              <motion.div
                className="w-[2px] h-10 bg-[var(--gold)]/80"
                animate={{ scaleY: [0, 1, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: 'top' }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicador lateral de scroll */}
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

      {/* Spacer para cada projeto scrollar */}
      <div className="relative z-0 pointer-events-none" style={{ paddingTop: '50vh', paddingBottom: '50vh' }}>
        {PORTFOLIO_DATA.map((proj, i) => (
          <div key={proj.id} style={{ height: `${SCROLL_HEIGHT}vh` }} />
        ))}
      </div>
    </main>
  );
}