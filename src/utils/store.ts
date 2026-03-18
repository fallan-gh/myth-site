import { create } from 'zustand';

interface MythStore {
  scrollProgress: number;
  activeSection: number;
  setScrollProgress: (v: number) => void;
  setActiveSection: (v: number) => void;
}

export const useStore = create<MythStore>((set) => ({
  scrollProgress: 0,
  activeSection: 0,
  setScrollProgress: (v) => set({ scrollProgress: v }),
  setActiveSection: (v) => set({ activeSection: v }),
}));
