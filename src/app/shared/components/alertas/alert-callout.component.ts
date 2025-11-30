import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";


@Component({
  selector: 'alert-callout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="rounded-lg border p-4 text-sm leading-relaxed"
      [ngClass]="{
        'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/25 dark:border-blue-700 dark:text-blue-200' : type === 'info',
        'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-900/25 dark:border-yellow-700 dark:text-yellow-200' : type === 'warning',
        'bg-green-50 border-green-200 text-green-900 dark:bg-green-900/25 dark:border-green-700 dark:text-green-200': type === 'success',
        'bg-red-50 border-red-200 text-red-900 dark:bg-red-900/25 dark:border-red-700 dark:text-red-200': type === 'error',
        'bg-gray-50 border-gray-200 text-gray-900 dark:bg-gray-900/25 dark:border-gray-700 dark:text-gray-200 ': type === 'note'
      }"
    >
      <ng-container *ngIf="title">
        <p class="font-semibold mb-1">{{ title }}</p>
      </ng-container>

      <ng-content />
    </div>
  `,
})
export class AlertCalloutComponent {
  /** Variantes visuales */
  @Input() type: 'info' | 'warning' | 'success' | 'error' | 'note' = 'info';

  /** Título opcional (aparece en negrita al inicio) */
  @Input() title?: string;
}
