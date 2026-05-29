import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CheckCircle2, Info, AlertTriangle, XCircle, X, LucideAngularModule,
} from 'lucide-angular';
import { ToastService, ToastKind } from './toast.service';

/**
 * Toaster en columna (abajo-derecha). Cada toast entra deslizando desde la
 * derecha y sale hacia la derecha (consistencia espacial). Sin medicion de
 * alturas ni afterEveryRender: todo es CSS, asi que NO puede congelar el hilo.
 *
 * Pausa de timers en hover sobre el grupo (edge case estilo Sonner).
 */
@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './toast-container.component.html',
})
export class ToastContainerComponent {
  protected readonly toast = inject(ToastService);

  protected onEnter() { this.toast.pauseAll(); }
  protected onLeave() { this.toast.resumeAll(); }

  // --- Visuales por tipo ---
  protected icon(kind: ToastKind) {
    return { success: CheckCircle2, info: Info, warning: AlertTriangle, error: XCircle }[kind];
  }
  protected readonly CloseIcon = X;

  protected iconColor(kind: ToastKind): string {
    return {
      success: 'text-emerald-500',
      info: 'text-primary-500',
      warning: 'text-amber-500',
      error: 'text-rose-500',
    }[kind];
  }

  protected accent(kind: ToastKind): string {
    return {
      success: 'before:bg-emerald-500',
      info: 'before:bg-primary-500',
      warning: 'before:bg-amber-500',
      error: 'before:bg-rose-500',
    }[kind];
  }
}
