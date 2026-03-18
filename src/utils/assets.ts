// ─── MYTH BRAND ASSETS ───────────────────────────────────────────────────────
// Coloque os arquivos de identidade em /public/ e atualize os paths abaixo.
// Ou cole as strings base64 diretamente nos campos b64 para modo standalone.

export const ASSETS = {
  /** Background 3D sculptural — /public/myth-3d-bg.jpg */
  bg3dPath: '/myth-3d-bg.jpg',

  /** Letterforms de identidade — /public/myth-letters.jpg */
  letterformPath: '/myth-letters.jpg',

  /** Logo branca — /public/logo/white.png */
  logoPath: '/logo/white.png',
} as const;

/**
 * Converte base64 puro para data URL JPEG.
 * Use apenas se for embedar imagens inline (sem /public/).
 */
export const toDataUrl = (b64: string): string =>
  b64 ? `data:image/jpeg;base64,${b64}` : '';
