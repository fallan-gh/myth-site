import './globals.css';

import SmoothScroll from '@/components/layout/SmoothScroll';
import GlobalCanvas from '@/components/canvas/GlobalCanvas';
import HeroScene from '@/components/canvas/HeroScene';
import { Metadata } from 'next';
import { ReactNode } from 'react';
import { Cormorant_Garamond, Manrope } from 'next/font/google';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant'
});
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });

export const metadata: Metadata = {
  title: 'Myth Agency | Anti-Gravity Experience',
  description: 'Design etéreo, performance brutal.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${manrope.variable}`}>
      <body className="bg-transparent text-white antialiased overflow-x-hidden">
        <SmoothScroll>
          {/* HTML Layer */}
          <main className="relative z-10 w-full min-h-screen mix-blend-difference pointer-events-auto">
            {children}
          </main>

          {/* WebGL 3D Layer */}
          <GlobalCanvas>
            <HeroScene />
          </GlobalCanvas>
        </SmoothScroll>
      </body>
    </html>
  );
}
