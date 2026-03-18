import './globals.css';

import SmoothScroll from '@/components/layout/SmoothScroll';
import GlobalCanvas from '@/components/canvas/GlobalCanvas';
import HeroScene from '@/components/canvas/HeroScene';
import { Metadata } from 'next';
import { ReactNode } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MYTH | Digital Creative Studio',
  description: 'We don\'t design brands. We build legends. High-end digital creative studio.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="bg-transparent text-white antialiased overflow-x-hidden pt-0 m-0">
        <SmoothScroll>
          {/* HTML Layer */}
          <main className="relative z-10 w-full min-h-screen pointer-events-auto">
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
