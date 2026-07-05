import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { LucideAngularModule, Pencil, Trash2 } from 'lucide-angular';
import { EmptyComponent } from '../ui/empty/empty.component';
import { TagComponent } from '../ui/tag/tag.component';
import { SpinnerComponent } from '../ui/spinner/spinner.component';
import { ColumnDef, RowAction } from './data-table.types';

// Tipos del contrato en ./data-table.types (archivo propio); se re-exportan
// aqui porque son la API publica del componente para sus consumidores.
export type { ColumnDef, RowAction } from './data-table.types';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, EmptyComponent, SpinnerComponent, TagComponent],
  templateUrl: './data-table.component.html',
})
export class DataTableComponent<T = any> {
  readonly columns = input.required<ColumnDef<T>[]>();
  readonly rows = input<T[]>([]);
  readonly actions = input<RowAction<T>[]>([]);
  readonly loading = input<boolean>(false);
  readonly trackBy = input<(r: T) => any>((r: any) => r?.id ?? r);

  readonly editIcon = Pencil;
  readonly deleteIcon = Trash2;

  readonly colCount = computed(() => this.columns().length + (this.actions().length ? 1 : 0));

  actionsFor(row: T): RowAction<T>[] {
    return this.actions().filter(a => (a.show ? a.show(row) : true));
  }
}
