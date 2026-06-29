import { Component, input } from '@angular/core';

/**
 * Envoltura de campo de formulario: label + control proyectado + hint/error.
 *
 * Unifica el espaciado y la jerarquia visual de TODOS los campos (no repetir
 * markup de label/hint en cada formulario). El control va proyectado:
 *
 *   <app-field label="Correo" hint="Lo usaras para entrar" [required]="true">
 *     <app-input type="email" [(value)]="email" />
 *   </app-field>
 */
@Component({
  selector: 'app-field',
  standalone: true,
  templateUrl: './field.component.html',
})
export class FieldComponent {
  readonly label = input<string>('');
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly required = input<boolean>(false);
}
