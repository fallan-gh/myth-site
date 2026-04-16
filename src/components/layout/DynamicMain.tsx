"use client";

import { useStore } from '@/utils/store';
import { ReactNode } from 'react';

export default function DynamicMain({ children }: { children: ReactNode }) {
  const sceneMode = useStore((state) => state.sceneMode);
  
  // Disable mix-blend-mode: difference when in showcase mode to avoid color inversion
  const style = sceneMode === 'showcase' 
    ? { pointerEvents: 'auto' as const } 
    : { mixBlendMode: 'difference' as const, pointerEvents: 'auto' as const };

  return (
    <main className="relative w-full min-h-screen" style={style}>
      {children}
    </main>
  );
}
