import './globals.css';

import SmoothScroll from '@/components/layout/SmoothScroll';
import GlobalCanvas from '@/components/canvas/GlobalCanvas';
import DynamicMain from '@/components/layout/DynamicMain';
import WhatsAppConcierge from '@/components/ui/WhatsAppConcierge';
import { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import { Inter, Raleway } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const raleway = Raleway({
  subsets: ['latin'],
  variable: '--font-raleway',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MYTH | Digital Creative Studio',
  description: 'We don\'t design brands. We build legends. High-end digital creative studio.',
  icons: {
    icon: '/logo/black.png',
    apple: '/logo/black.png',
  },
  openGraph: {
    title: 'MYTH | Digital Creative Studio',
    description: 'We don\'t design brands. We build legends.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${raleway.variable}`} suppressHydrationWarning>
      <body className="bg-transparent text-white antialiased overflow-x-hidden pt-0 m-0" suppressHydrationWarning>
        <SmoothScroll>
          {/* HTML Layer */}
          <DynamicMain>
            {children}
          </DynamicMain>

          <WhatsAppConcierge />

          {/* WebGL 3D Layer */}
          <GlobalCanvas />
        </SmoothScroll>
      </body>
    </html>
  );
}
