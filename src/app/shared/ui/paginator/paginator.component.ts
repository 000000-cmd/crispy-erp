import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { LucideAngularModule, ChevronLeft, ChevronRight } from 'lucide-angular';

/** Paginador server-side reutilizable (page 0-based). */
@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './paginator.component.html',
})
export class PaginatorComponent {
  readonly page = input<number>(0);
  readonly totalPages = input<number>(0);
  readonly totalHits = input<number>(0);
  readonly pageChange = output<number>();

  protected readonly prevIcon = ChevronLeft;
  protected readonly nextIcon = ChevronRight;

  readonly canPrev = computed(() => this.page() > 0);
  readonly canNext = computed(() => this.page() + 1 < this.totalPages());

  prev() { if (this.canPrev()) this.pageChange.emit(this.page() - 1); }
  next() { if (this.canNext()) this.pageChange.emit(this.page() + 1); }
}
