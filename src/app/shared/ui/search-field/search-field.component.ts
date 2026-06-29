import { Component, input, model } from '@angular/core';
import { LucideAngularModule, Search } from 'lucide-angular';

/**
 * Campo de busqueda del design system: input con lupa correctamente espaciada.
 *
 *   <app-search-field [(value)]="q" placeholder="Buscar…" />
 *   <app-search-field [value]="query()" (valueChange)="onSearch($event)" />
 *
 * El consumidor decide el debounce; este componente solo emite el valor.
 */
@Component({
  selector: 'app-search-field',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './search-field.component.html',
})
export class SearchFieldComponent {
  readonly value = model<string>('');
  readonly placeholder = input<string>('Buscar…');

  protected readonly searchIcon = Search;

  protected onInput(v: string) { this.value.set(v); }
}
