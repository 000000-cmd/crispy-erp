import { Injectable, computed, effect, signal } from '@angular/core';
import { DICTIONARIES, Locale } from './dictionaries';

const STORAGE_KEY = 'erp.locale';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly _locale = signal<Locale>(this.load());
  readonly locale = this._locale.asReadonly();
  readonly available: Locale[] = ['es', 'en'];

  readonly dict = computed(() => DICTIONARIES[this._locale()]);

  constructor() {
    effect(() => {
      localStorage.setItem(STORAGE_KEY, this._locale());
      document.documentElement.lang = this._locale();
    });
  }

  setLocale(loc: Locale) { this._locale.set(loc); }

  t(key: string, params?: Record<string, string | number>): string {
    const raw = this.dict()[key] ?? key;
    if (!params) return raw;
    return raw.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
  }

  private load(): Locale {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'es' || v === 'en') return v;
    const browser = (navigator.language || 'es').slice(0, 2).toLowerCase();
    return browser === 'en' ? 'en' : 'es';
  }
}
