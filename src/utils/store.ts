import { create } from 'zustand';

export type Language = 'en' | 'pt';

interface MythStore {
  scrollProgress: number;
  activeSection: number;
  menuOpen: boolean;
  cursorMode: 'default' | 'link' | 'project' | 'cta' | 'magnetic';
  language: Language;
  setScrollProgress: (v: number) => void;
  setActiveSection: (v: number) => void;
  setMenuOpen: (v: boolean) => void;
  setCursorMode: (v: 'default' | 'link' | 'project' | 'cta' | 'magnetic') => void;
  setLanguage: (v: Language) => void;
}

export const useStore = create<MythStore>((set) => ({
  scrollProgress: 0,
  activeSection: 0,
  menuOpen: false,
  cursorMode: 'default',
  language: 'pt',
  setScrollProgress: (v) => set({ scrollProgress: v }),
  setActiveSection: (v) => set({ activeSection: v }),
  setMenuOpen: (v) => set({ menuOpen: v }),
  setCursorMode: (v) => set({ cursorMode: v }),
  setLanguage: (v) => set({ language: v }),
}));
