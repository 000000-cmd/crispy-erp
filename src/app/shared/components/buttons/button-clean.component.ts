import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

@Component({
  selector: 'button-clean',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <button
      (click)="onClick()"
      class="flex w-full items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition
             focus:outline-none focus:ring-2 focus:ring-blue-500/40"
      [ngClass]="{
        'bg-blue-600 text-white hover:bg-blue-700': variant === 'filled',
        'border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white': variant === 'outlined'
      }"
    >
      @if(icon){
        <lucide-icon [name]="icon" class="w-4 h-4" />
      }

      <span>{{ label }}</span>
    </button>
  `,
})
export class ButtonCleanComponent {
  @Input() label!: string;
  @Input() icon?: LucideIconData
  @Input() variant: 'filled' | 'outlined' = 'filled';

  @Output() pressed = new EventEmitter<void>();

  onClick() {
    this.pressed.emit();
  }
}
