import { create } from 'zustand';

export type Language = 'en' | 'pt';
export type SceneMode = 'hero' | 'showcase';
export type ShowcaseProject = 'agrotoxica' | 'vercel-project' | null;
export type HudMode = 'director' | 'exploration';


interface MythStore {
  scrollProgress: number;
  activeSection: number;
  menuOpen: boolean;
  cursorMode: 'default' | 'link' | 'project' | 'cta' | 'magnetic';
  language: Language;
  
  // Showcase specific
  sceneMode: SceneMode;
  showcaseProject: ShowcaseProject;
  hudMode: HudMode;
  isIframeActive: boolean;
  isScenePaused: boolean;
  activeIframeId: string | null;
  mousePos: { x: number; y: number };

  setScrollProgress: (v: number) => void;
  setActiveSection: (v: number) => void;
  setMenuOpen: (v: boolean) => void;
  setCursorMode: (v: 'default' | 'link' | 'project' | 'cta' | 'magnetic') => void;
  setLanguage: (v: Language) => void;

  // Showcase actions
  setSceneMode: (v: SceneMode) => void;
  setShowcaseProject: (v: ShowcaseProject) => void;
  setHudMode: (v: HudMode) => void;
  setIsIframeActive: (v: boolean) => void;
  setIsScenePaused: (v: boolean) => void;
  setActiveIframeId: (v: string | null) => void;
  setMousePos: (v: { x: number; y: number }) => void;
}

export const useStore = create<MythStore>((set) => ({
  scrollProgress: 0,
  activeSection: 0,
  menuOpen: false,
  cursorMode: 'default',
  language: 'pt',
  
  sceneMode: 'hero',
  showcaseProject: null,
  hudMode: 'director',
  isIframeActive: false,
  isScenePaused: false,
  activeIframeId: null,
  mousePos: { x: 0, y: 0 },

  setScrollProgress: (v) => set({ scrollProgress: v }),
  setActiveSection: (v) => set({ activeSection: v }),
  setMenuOpen: (v) => set({ menuOpen: v }),
  setCursorMode: (v) => set({ cursorMode: v }),
  setLanguage: (v) => set({ language: v }),

  setSceneMode: (v) => set({ sceneMode: v }),
  setShowcaseProject: (v) => set({ showcaseProject: v }),
  setHudMode: (v) => set({ hudMode: v }),
  setIsIframeActive: (v) => set({ isIframeActive: v }),
  setIsScenePaused: (v) => set({ isScenePaused: v }),
  setActiveIframeId: (v) => set({ activeIframeId: v }),
  setMousePos: (v) => set({ mousePos: v }),
}));
