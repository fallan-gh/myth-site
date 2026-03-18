// ─── MYTH BRAND ASSETS ───────────────────────────────────────────────────────
// Base64-encoded brand images embedded directly.
// Replace with Next.js Image + /public paths once assets are in the repo.

export const ASSETS = {
  /** 3D sculptural mesh background (hero section) */
  bg3d: '', // paste your base64 string here — or use: /public/myth-3d-bg.jpg

  /** Oversized letterforms overlay (hero / contact decorative bg) */
  letterform: '', // paste your base64 string here — or use: /public/myth-letters.jpg

  /** Logo wordmark (white version for nav) */
  logo: '', // paste your base64 string here — or use: /public/logo/white.png
} as const;

export const toDataUrl = (b64: string) =>
  b64 ? `data:image/jpeg;base64,${b64}` : '';
