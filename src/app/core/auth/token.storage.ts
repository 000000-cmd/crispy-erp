import { Injectable } from '@angular/core';

const ACCESS_KEY = 'erp.accessToken';
const REFRESH_KEY = 'erp.refreshToken';
const USER_KEY = 'erp.user';

@Injectable({ providedIn: 'root' })
export class TokenStorage {
  getAccess(): string | null { return localStorage.getItem(ACCESS_KEY); }
  setAccess(v: string | null) { v ? localStorage.setItem(ACCESS_KEY, v) : localStorage.removeItem(ACCESS_KEY); }

  getRefresh(): string | null { return localStorage.getItem(REFRESH_KEY); }
  setRefresh(v: string | null) { v ? localStorage.setItem(REFRESH_KEY, v) : localStorage.removeItem(REFRESH_KEY); }

  getUser<T>(): T | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  }
  setUser(u: unknown | null) { u ? localStorage.setItem(USER_KEY, JSON.stringify(u)) : localStorage.removeItem(USER_KEY); }

  clear() { this.setAccess(null); this.setRefresh(null); this.setUser(null); }
}
