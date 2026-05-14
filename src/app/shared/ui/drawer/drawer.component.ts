import { CommonModule } from '@angular/common';
import {
  AfterViewInit, Component, computed, ElementRef, HostListener, inject,
  input, OnDestroy, output,
} from '@angular/core';
import { ConfirmService } from '../confirm/confirm.service';
import { ButtonComponent } from '../button/button.component';
import { TPipe } from '../../pipes/t.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';

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
  imports: [CommonModule, ButtonComponent, TPipe],
  templateUrl: './drawer.component.html',
})
export class DrawerComponent implements AfterViewInit, OnDestroy {
  private readonly confirm = inject(ConfirmService);
  private readonly i18n = inject(I18nService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private movedNode: HTMLElement | null = null;

  readonly open = input<boolean>(false);
  readonly title = input<string>('');
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  readonly confirmDiscard = input<boolean>(false);
  readonly discardTitle = input<string>('common.discard.title');
  readonly discardMessage = input<string>('common.discard.message');

  // Footer builtin
  readonly showActions = input<boolean>(false);
  readonly saving = input<boolean>(false);
  readonly dirty = input<boolean>(false);
  readonly saveLabel = input<string>('common.save');
  readonly closeLabel = input<string>('common.close');
  readonly cancelLabel_ = input<string>('common.cancel', { alias: 'cancelLabel' });

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
        title: this.i18n.t(this.discardTitle()),
        message: this.i18n.t(this.discardMessage()),
        confirmText: this.i18n.t('common.discard'),
        cancelText: this.i18n.t('common.keepEditing'),
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
