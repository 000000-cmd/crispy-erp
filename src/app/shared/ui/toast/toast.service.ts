import { Injectable, signal } from '@angular/core';

export type ToastKind = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  description?: string;
  ttl: number;
  /** true mientras corre la animacion de salida, antes de removerse del DOM */
  dismissing: boolean;
}

interface TimerEntry {
  handle: any | null;
  start: number;
  remaining: number;
}

/** Duracion de la animacion de salida (debe coincidir con el CSS). */
const EXIT_MS = 260;

export interface ToastOptions {
  description?: string;
  ttl?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  private timers = new Map<number, TimerEntry>();
  readonly toasts = signal<Toast[]>([]);

  push(kind: ToastKind, title: string, opts: ToastOptions = {}): number {
    const ttl = opts.ttl ?? (kind === 'error' ? 6000 : 4000);
    const t: Toast = {
      id: ++this.seq,
      kind,
      title,
      description: opts.description,
      ttl,
      dismissing: false,
    };
    this.toasts.update(list => [...list, t]);
    if (ttl > 0) this.arm(t.id, ttl);
    return t.id;
  }

  // Atajos. Firma compatible: (msg) o (msg, description).
  info(msg: string, description?: string)    { return this.push('info', msg, { description }); }
  success(msg: string, description?: string) { return this.push('success', msg, { description }); }
  warning(msg: string, description?: string) { return this.push('warning', msg, { description }); }
  error(msg: string, description?: string)   { return this.push('error', msg, { description }); }

  /** Marca el toast como saliente y lo remueve cuando termina la animacion. */
  dismiss(id: number) {
    this.clearTimer(id);
    const t = this.toasts().find(x => x.id === id);
    if (!t || t.dismissing) return;
    this.toasts.update(list =>
      list.map(x => (x.id === id ? { ...x, dismissing: true } : x)),
    );
    setTimeout(() => {
      this.toasts.update(list => list.filter(x => x.id !== id));
    }, EXIT_MS);
  }

  // --- Pausa de timers en hover (edge case estilo Sonner) ---
  pauseAll() {
    const now = Date.now();
    // Snapshot: no mutar estructuralmente el Map durante la iteracion.
    for (const e of Array.from(this.timers.values())) {
      clearTimeout(e.handle);
      e.remaining = Math.max(0, e.remaining - (now - e.start));
      e.handle = null;
    }
  }

  resumeAll() {
    // CRITICO: iterar sobre una copia. arm() hace delete+set sobre el Map y,
    // si se ejecuta dentro de this.timers.forEach, re-inserta la clave y
    // forEach la vuelve a visitar -> bucle infinito que congela el hilo.
    for (const [id, e] of Array.from(this.timers.entries())) {
      if (e.remaining <= 0) { this.dismiss(id); continue; }
      this.arm(id, e.remaining);
    }
  }

  private arm(id: number, ms: number) {
    this.clearTimer(id);
    const handle = setTimeout(() => this.dismiss(id), ms);
    this.timers.set(id, { handle, start: Date.now(), remaining: ms });
  }

  private clearTimer(id: number) {
    const e = this.timers.get(id);
    if (e) { clearTimeout(e.handle); this.timers.delete(id); }
  }
}
