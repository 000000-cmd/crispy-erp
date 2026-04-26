import { Component, inject } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { ButtonComponent } from '../button/button.component';
import { ConfirmService } from './confirm.service';

@Component({
  selector: 'app-confirm-host',
  standalone: true,
  imports: [ModalComponent, ButtonComponent],
  template: `
    <app-modal [open]="!!confirm.pending()" [title]="confirm.pending()?.title || 'Confirmar'" size="sm" (onClose)="confirm.resolve(false)">
      <p class="text-sm text-text-muted">{{ confirm.pending()?.message }}</p>
      <div modalFooter class="px-5 py-3 border-t border-border flex justify-end gap-2 bg-surface-muted">
        <app-button variant="ghost" (onClick)="confirm.resolve(false)">{{ confirm.pending()?.cancelText || 'Cancelar' }}</app-button>
        <app-button [variant]="confirm.pending()?.tone === 'danger' ? 'danger' : 'primary'" (onClick)="confirm.resolve(true)">
          {{ confirm.pending()?.confirmText || 'Aceptar' }}
        </app-button>
      </div>
    </app-modal>
  `,
})
export class ConfirmHostComponent {
  protected readonly confirm = inject(ConfirmService);
}
