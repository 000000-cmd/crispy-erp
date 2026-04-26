import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { LucideAngularModule, Pencil, Trash2 } from 'lucide-angular';
import { EmptyComponent } from '../ui/empty/empty.component';
import { SpinnerComponent } from '../ui/spinner/spinner.component';

export interface ColumnDef<T = any> {
  key: keyof T & string;
  label: string;
  width?: string;
  align?: 'left' | 'right' | 'center';
  format?: (row: T) => string | number;
  template?: 'pill' | 'switch' | 'text';
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
  imports: [CommonModule, LucideAngularModule, EmptyComponent, SpinnerComponent],
  template: `
    <div class="rounded-lg border border-border bg-surface overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-surface-muted text-text-muted text-[11px] uppercase tracking-wide">
            <tr>
              @for (c of columns(); track c.key) {
                <th class="px-4 py-2.5 text-left font-medium" [style.width]="c.width || ''">{{ c.label }}</th>
              }
              @if (actions().length) { <th class="px-4 py-2.5 text-right font-medium w-px">Acciones</th> }
            </tr>
          </thead>
          <tbody>
            @if (loading()) {
              <tr><td [attr.colspan]="colCount()" class="px-4 py-8 text-center text-text-muted">
                <app-spinner [size]="22" /> <span class="ml-2 text-xs">Cargando…</span>
              </td></tr>
            } @else if (!rows().length) {
              <tr><td [attr.colspan]="colCount()"><app-empty /></td></tr>
            } @else {
              @for (row of rows(); track trackBy()(row)) {
                <tr class="border-t border-border hover:bg-surface-hover transition-colors">
                  @for (c of columns(); track c.key) {
                    <td class="px-4 py-2.5" [class.text-right]="c.align === 'right'" [class.text-center]="c.align === 'center'">
                      {{ c.format ? c.format(row) : row[c.key] }}
                    </td>
                  }
                  @if (actions().length) {
                    <td class="px-4 py-2 text-right whitespace-nowrap">
                      @for (a of actionsFor(row); track $index) {
                        <button
                          (click)="a.onClick(row)"
                          class="inline-flex items-center justify-center h-7 w-7 rounded-md ml-1 text-text-muted hover:bg-surface-muted"
                          [class.hover:text-rose-600]="a.tone === 'danger'"
                          [class.hover:text-primary-600]="a.tone === 'primary' || !a.tone"
                          [title]="a.label || ''"
                        >
                          @if (a.icon) { <lucide-icon [img]="a.icon" [size]="14"></lucide-icon> }
                          @else { {{ a.label }} }
                        </button>
                      }
                    </td>
                  }
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
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
