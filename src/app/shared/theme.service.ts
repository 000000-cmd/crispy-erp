import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {

  private themeSubject = new BehaviorSubject<'light' | 'dark'>('light');
  theme$ = this.themeSubject.asObservable();

  constructor() {
    // Cargar el tema desde localStorage
    const saved = localStorage.getItem('theme') as 'light' | 'dark';
    if (saved) {
      this.setTheme(saved);
    }
  }

  setTheme(theme: 'light' | 'dark') {
    this.themeSubject.next(theme);
    localStorage.setItem('theme', theme);

    // Aplicar clase al HTML
    const html = document.documentElement;
    if (theme === 'dark') html.classList.add('dark');
    else html.classList.remove('dark');
  }

  toggle() {
    const next = this.themeSubject.value === 'light' ? 'dark' : 'light';
    this.setTheme(next);
  }

  get current() {
    return this.themeSubject.value;
  }
}
