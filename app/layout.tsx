import type { Metadata } from 'next';
import { Bodoni_Moda, DM_Sans } from 'next/font/google';
import './globals.css';

const bodoniModa = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-bodoni',
  display: 'swap',
  axes: ['opsz'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
  axes: ['opsz'],
});

export const metadata: Metadata = {
  title: 'MYTH Agency — Forjamos Lendas',
  description: 'Arquitetura digital de alto contraste. Identidade visual, interfaces 3D e motion design para marcas que desejam transcender.',
  openGraph: {
    title: 'MYTH Agency',
    description: 'Forjamos Lendas.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${bodoniModa.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
