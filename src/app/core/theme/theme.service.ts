import { Injectable, computed, effect, signal } from '@angular/core';
import { DEFAULT_PALETTE_ID, Palette, PRESET_PALETTES, paletteFromHex } from './palettes';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  paletteId: string;
  customHex?: string;
}

const STORAGE_KEY = 'erp.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly state = signal<ThemeState>(this.load());

  readonly mode = computed(() => this.state().mode);
  readonly paletteId = computed(() => this.state().paletteId);
  readonly customHex = computed(() => this.state().customHex);
  readonly palettes = PRESET_PALETTES;
  readonly currentPalette = computed<Palette>(() => this.resolvePalette(this.state()));

  constructor() {
    effect(() => {
      const s = this.state();
      this.applyMode(s.mode);
      this.applyPalette(this.resolvePalette(s));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    });
  }

  setMode(mode: ThemeMode) { this.state.update(s => ({ ...s, mode })); }
  toggleMode() { this.setMode(this.mode() === 'dark' ? 'light' : 'dark'); }
  setPalette(id: string) { this.state.update(s => ({ ...s, paletteId: id })); }
  setCustomHex(hex: string) { this.state.update(s => ({ ...s, paletteId: 'custom', customHex: hex })); }

  private resolvePalette(s: ThemeState): Palette {
    if (s.paletteId === 'custom' && s.customHex) return paletteFromHex(s.customHex);
    return PRESET_PALETTES.find(p => p.id === s.paletteId) ?? PRESET_PALETTES[0];
  }

  private applyMode(mode: ThemeMode) {
    const root = document.documentElement;
    if (mode === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }

  private applyPalette(p: Palette) {
    const root = document.documentElement;
    const entries: [string, string][] = [
      ['--p-50', p.scale[50]], ['--p-100', p.scale[100]], ['--p-200', p.scale[200]],
      ['--p-300', p.scale[300]], ['--p-400', p.scale[400]], ['--p-500', p.scale[500]],
      ['--p-600', p.scale[600]], ['--p-700', p.scale[700]], ['--p-800', p.scale[800]],
      ['--p-900', p.scale[900]],
    ];
    for (const [k, v] of entries) root.style.setProperty(k, v);
  }

  private load(): ThemeState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as ThemeState;
    } catch { /* ignore */ }
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return { mode: prefersDark ? 'dark' : 'light', paletteId: DEFAULT_PALETTE_ID };
  }
}
