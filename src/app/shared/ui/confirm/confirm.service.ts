import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  tone?: 'primary' | 'danger';
}

interface PendingConfirm extends ConfirmOptions { resolve: (ok: boolean) => void; }

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly pending = signal<PendingConfirm | null>(null);

  ask(opts: ConfirmOptions): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.pending.set({ ...opts, resolve });
    });
  }

  resolve(ok: boolean) {
    const p = this.pending();
    if (!p) return;
    p.resolve(ok);
    this.pending.set(null);
  }
}
