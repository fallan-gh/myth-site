# MYTH Agency — Next.js TypeScript

## Stack
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- GSAP + ScrollTrigger
- WebGL (raw, no Three.js — performance first)

## Estrutura de arquivos

```
app/
  layout.tsx       ← Next/font + metadata
  page.tsx         ← Página principal completa
  myth.css         ← Design system (tokens, efeitos, componentes)
  globals.css      ← Tailwind + Lenis
utils/
  store.ts         ← Zustand state
  assets.ts        ← Brand assets (base64 ou paths)
components/
  ui/Menu.tsx      ← Menu mobile (existente no seu projeto)
public/
  fonts/           ← PAGE_SERIF, Zain (existentes)
  logo/white.png   ← Logo branca
  myth-3d-bg.jpg   ← Background 3D sculptural
  myth-letters.jpg ← Letterforms de identidade
```

## Integrar os assets de identidade

### Opção A — arquivos em /public (recomendado para produção)
```bash
cp Untitled.png          public/myth-3d-bg.png
cp Artboard_1_copy_4.jpg public/myth-letters.jpg
cp logo/white.png        public/logo/white.png
```
Então em `utils/assets.ts`, troque os campos vazios:
```ts
export const ASSETS = {
  bg3d: '',          // deixa vazio — usa backgroundImage direto
  letterform: '',    // deixa vazio — usa <Image src="/myth-letters.jpg" />
  logo: '',          // deixa vazio — usa <Image src="/logo/white.png" />
}
```
E no `page.tsx`, troca os `<img src={logoUrl}>` por `<Image src="/logo/white.png">` do Next.js.

### Opção B — base64 embedded (standalone, sem servidor)
Cole as strings base64 diretamente em `utils/assets.ts`:
```ts
export const ASSETS = {
  bg3d: '/9j/4AAQSkZJRg...', // base64 do myth-3d-bg.jpg
  letterform: '/9j/4AAQ...',  // base64 do myth-letters.jpg
  logo: '/9j/4AAQSkZJ...',    // base64 do logo white
}
```

## Instalar dependências
```bash
npm install framer-motion gsap zustand
npm install --save-dev @types/node
```

## Dev
```bash
npm run dev
```

## Tipografia
- **Display:** Bodoni Moda 900 (via Next/font — sem FOUT)
- **Corpo:** DM Sans 300/400
- **Mono:** Courier Prime 400
- **Fallback local:** PageSerif + Zain (de /public/fonts/)

O CSS usa `--serif: 'Bodoni Moda', 'PageSerif', Georgia, serif` — então os seus
fonts locais servem como fallback perfeito caso o Google Fonts falhe.
