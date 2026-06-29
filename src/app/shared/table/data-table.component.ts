import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { LucideAngularModule, Pencil, Trash2 } from 'lucide-angular';
import { EmptyComponent } from '../ui/empty/empty.component';
import { TagComponent, TagTone } from '../ui/tag/tag.component';
import { SpinnerComponent } from '../ui/spinner/spinner.component';

export interface ColumnDef<T = any> {
  key: keyof T & string;
  label: string;
  width?: string;
  align?: 'left' | 'right' | 'center';
  format?: (row: T) => string | number;
  template?: 'pill' | 'switch' | 'text';
  /** Si se define, la celda renderiza una <app-tag> con este label/tono. */
  tag?: (row: T) => { label: string; tone: TagTone } | null;
}

export interface RowAction<T = any> {
  icon?: any;
  label?: string;
  tone?: 'primary' | 'danger' | 'neutral';
  show?: (row: T) => boolean;
  onClick: (row: T) => void;
}

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
