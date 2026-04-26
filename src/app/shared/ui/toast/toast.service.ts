import { Injectable, signal } from '@angular/core';

export type ToastKind = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
  ttl: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  readonly toasts = signal<Toast[]>([]);

  push(kind: ToastKind, message: string, ttl = 4000) {
    const t: Toast = { id: ++this.seq, kind, message, ttl };
    this.toasts.update(list => [...list, t]);
    if (ttl > 0) setTimeout(() => this.dismiss(t.id), ttl);
  }
  info(msg: string)    { this.push('info', msg); }
  success(msg: string) { this.push('success', msg); }
  warning(msg: string) { this.push('warning', msg); }
  error(msg: string)   { this.push('error', msg, 6000); }

  dismiss(id: number) { this.toasts.update(list => list.filter(t => t.id !== id)); }
}
