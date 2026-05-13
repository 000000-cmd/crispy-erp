import { CommonModule } from '@angular/common';
import {
  AfterViewInit, Component, computed, ElementRef, HostListener, inject,
  input, OnDestroy, output,
} from '@angular/core';
import { ConfirmService } from '../confirm/confirm.service';
import { ButtonComponent } from '../button/button.component';

/**
 * Slide-from-right drawer.
 *
 * Diseño:
 *  - El contenido raiz se MUEVE a `document.body` en AfterViewInit. Asi
 *    escapamos cualquier ancestro con `transform`/`filter`/`backdrop-filter`
 *    que romperia el `position: fixed` y atraparia el drawer dentro del area
 *    de contenido (el problema clasico de "el drawer no cubre la pantalla").
 *  - z-index alto (200) para quedar siempre por encima de topbar/sidebar.
 *
 * Footer:
 *  - Por defecto renderiza un footer builtin con botones "Guardar" y
 *    "Cancelar/Cerrar". El label del cancel cambia segun `[dirty]`.
 *  - Si pasas un slot `[drawerFooter]`, se usa ese en vez del builtin.
 *
 * Confirm de descarte:
 *  - Si `[confirmDiscard]` (deberia ir atado a `dirty()`), antes de cerrar
 *    via cancel/backdrop/ESC pide "¿Descartar cambios?".
 */
@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div
      #portal
      class="fixed inset-0 z-[200]"
      [class.pointer-events-none]="!open()"
      aria-hidden="false"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ease-out"
        [class.opacity-100]="open()"
        [class.opacity-0]="!open()"
        (click)="requestClose('backdrop')"
      ></div>

      <aside
        role="dialog"
        aria-modal="true"
        class="absolute top-0 right-0 h-full bg-surface border-l border-border shadow-2xl
               flex flex-col transition-transform duration-300 ease-out
               will-change-transform"
        [class]="sizeClass()"
        [class.translate-x-0]="open()"
        [class.translate-x-full]="!open()"
      >
        @if (title()) {
          <header class="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
            <h3 class="text-base font-semibold text-text">{{ title() }}</h3>
            <button
              type="button"
              class="h-8 w-8 inline-flex items-center justify-center rounded-md text-text-soft
                     hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
              (click)="requestClose('button')"
              aria-label="Cerrar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </header>
        }

        <div class="px-5 py-4 overflow-auto flex-1">
          <ng-content />
        </div>

        @if (hasFooterSlot) {
          <ng-content select="[drawerFooter]" />
        } @else if (showActions()) {
          <footer class="px-5 py-3 border-t border-border bg-surface-muted/40 flex items-center justify-start gap-2 shrink-0">
            <app-button
              variant="secondary"
              [disabled]="saving()"
              (onClick)="requestClose('button')"
            >
              {{ cancelLabel() }}
            </app-button>
            <app-button
              variant="primary"
              [loading]="saving()"
              (onClick)="onSaveClick()"
            >
              {{ saveLabel() }}
            </app-button>
          </footer>
        }
      </aside>
    </div>
  `,
})
export class DrawerComponent implements AfterViewInit, OnDestroy {
  private readonly confirm = inject(ConfirmService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private movedNode: HTMLElement | null = null;

  readonly open = input<boolean>(false);
  readonly title = input<string>('');
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  readonly confirmDiscard = input<boolean>(false);
  readonly discardTitle = input<string>('Descartar cambios');
  readonly discardMessage = input<string>('Hay cambios sin guardar. ¿Quieres descartarlos?');

  // Footer builtin
  readonly showActions = input<boolean>(false);
  readonly saving = input<boolean>(false);
  readonly dirty = input<boolean>(false);
  readonly saveLabel = input<string>('Guardar');
  readonly closeLabel = input<string>('Cerrar');
  readonly cancelLabel_ = input<string>('Cancelar', { alias: 'cancelLabel' });

  readonly onClose = output<void>();
  readonly save = output<void>();

  /** "Cancelar" si hay cambios, "Cerrar" si no. */
  readonly cancelLabel = computed(() =>
    this.dirty() ? this.cancelLabel_() : this.closeLabel(),
  );

  readonly sizeClass = computed(() => ({
    sm: 'w-full max-w-md',
    md: 'w-full max-w-xl',
    lg: 'w-full max-w-2xl',
    xl: 'w-full max-w-4xl',
  }[this.size()]));

  /** Detecta si el padre proyecto un slot custom para el footer. */
  protected get hasFooterSlot(): boolean {
    const el = this.host.nativeElement;
    return !!el.querySelector('[drawerFooter]');
  }

  // --- Portal a body ---
  ngAfterViewInit(): void {
    const root = this.host.nativeElement.firstElementChild as HTMLElement | null;
    if (root && root.parentElement !== document.body) {
      this.movedNode = root;
      document.body.appendChild(root);
    }
  }
  ngOnDestroy(): void {
    if (this.movedNode && this.movedNode.parentElement === document.body) {
      this.movedNode.remove();
    }
  }

  // --- Acciones ---
  protected onSaveClick() {
    this.save.emit();
  }

  protected async requestClose(_origin: 'backdrop' | 'button' | 'esc') {
    if (!this.open()) return;
    const needsConfirm = this.confirmDiscard() || this.dirty();
    if (needsConfirm) {
      const ok = await this.confirm.ask({
        title: this.discardTitle(),
        message: this.discardMessage(),
        confirmText: 'Descartar',
        cancelText: 'Seguir editando',
        tone: 'danger',
      });
      if (!ok) return;
    }
    this.onClose.emit();
  }

  @HostListener('document:keydown.escape')
  protected onEscape() {
    if (this.open()) this.requestClose('esc');
  }
}
