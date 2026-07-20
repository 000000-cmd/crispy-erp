export interface PaletteScale {
  50: string; 100: string; 200: string; 300: string; 400: string;
  500: string; 600: string; 700: string; 800: string; 900: string;
}

export interface Palette {
  id: string;
  label: string;
  scale: PaletteScale;
}

const scaleFromHue = (hue: number, chroma = 0.14): PaletteScale => ({
  50:  `oklch(97% 0.015 ${hue})`,
  100: `oklch(93% 0.035 ${hue})`,
  200: `oklch(85% 0.07 ${hue})`,
  300: `oklch(76% 0.10 ${hue})`,
  400: `oklch(68% 0.12 ${hue})`,
  500: `oklch(58% ${chroma} ${hue})`,
  600: `oklch(50% ${chroma - 0.01} ${hue})`,
  700: `oklch(42% ${chroma - 0.03} ${hue})`,
  800: `oklch(34% ${chroma - 0.05} ${hue})`,
  900: `oklch(26% ${chroma - 0.07} ${hue})`,
});

export const PRESET_PALETTES: Palette[] = [
  { id: 'aura',       label: 'Aura',      scale: scaleFromHue(309, 0.20) },
  { id: 'terracotta', label: 'Terracota', scale: scaleFromHue(30, 0.14) },
  { id: 'indigo',     label: 'Índigo',    scale: scaleFromHue(265, 0.18) },
  { id: 'violet',     label: 'Violeta',   scale: scaleFromHue(295, 0.20) },
  { id: 'emerald',    label: 'Esmeralda', scale: scaleFromHue(155, 0.14) },
  { id: 'sky',        label: 'Cielo',     scale: scaleFromHue(230, 0.16) },
  { id: 'amber',      label: 'Ámbar',     scale: scaleFromHue(70, 0.16) },
  { id: 'rose',       label: 'Rosa',      scale: scaleFromHue(15, 0.16) },
  { id: 'slate',      label: 'Pizarra',   scale: scaleFromHue(255, 0.04) },
];

export const DEFAULT_PALETTE_ID = 'aura';

/** Build a palette scale around a single hex color. */
export function paletteFromHex(hex: string, label = 'Personalizada'): Palette {
  const { l, c, h } = hexToOklch(hex);
  const chroma = Math.max(0.04, Math.min(c, 0.22));
  return {
    id: 'custom',
    label,
    scale: {
      50:  `oklch(97% ${(chroma * 0.15).toFixed(3)} ${h})`,
      100: `oklch(93% ${(chroma * 0.30).toFixed(3)} ${h})`,
      200: `oklch(85% ${(chroma * 0.55).toFixed(3)} ${h})`,
      300: `oklch(76% ${(chroma * 0.75).toFixed(3)} ${h})`,
      400: `oklch(68% ${(chroma * 0.90).toFixed(3)} ${h})`,
      500: `oklch(${(l * 100).toFixed(1)}% ${chroma.toFixed(3)} ${h})`,
      600: `oklch(50% ${(chroma * 0.92).toFixed(3)} ${h})`,
      700: `oklch(42% ${(chroma * 0.78).toFixed(3)} ${h})`,
      800: `oklch(34% ${(chroma * 0.62).toFixed(3)} ${h})`,
      900: `oklch(26% ${(chroma * 0.48).toFixed(3)} ${h})`,
    },
  };
}

function hexToOklch(hex: string): { l: number; c: number; h: number } {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  // sRGB → linear
  const lin = (v: number) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  const lr = lin(r), lg = lin(g), lb = lin(b);
  // linear sRGB → OKLab (Björn Ottosson)
  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  const C = Math.sqrt(a * a + bb * bb);
  let H = (Math.atan2(bb, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { l: L, c: C, h: H };
}
