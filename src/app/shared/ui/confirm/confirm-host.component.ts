import { Component, inject } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { ButtonComponent } from '../button/button.component';
import { ConfirmService } from './confirm.service';
import { TPipe } from '../../pipes/t.pipe';

@Component({
  selector: 'app-confirm-host',
  standalone: true,
  imports: [ModalComponent, ButtonComponent, TPipe],
  templateUrl: './confirm-host.component.html',
})
export class ConfirmHostComponent {
  protected readonly confirm = inject(ConfirmService);
}
