import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PillComponent } from '../ui/pill.component';
import { IconBadgeComponent } from '../ui/icon-badge.component';
import { LucideIconData } from 'lucide-angular';


@Component({
  selector:'card-module',
  standalone:true,
  imports:[CommonModule, IconBadgeComponent, PillComponent],
  template:`
    <div class="relative p-5 rounded-2xl border bg-white shadow-sm min-w-[260px]">

      <!-- Pill (arriba derecha) -->
      <div class="absolute top-3 right-3">
        <pill *ngIf="pillLabel"
              [label]="pillLabel">
        </pill>
      </div>

      <!-- Icono -->
      <icon-badge [icon]="icon" [color]="color"></icon-badge>

      <!-- Título -->
      <h3 class="mt-4 text-lg font-semibold">{{ title }}</h3>

      <!-- Usuarios -->
      <div class="flex justify-between mt-2 text-sm opacity-70">
        <span>Usuarios</span>
        <span>{{ used }}/{{ total }}</span>
      </div>

      <!-- Barra de progreso -->
      <div class="w-full h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
        <div class="h-full rounded-full"
             [ngClass]="progressColors[color]"
             [style.width.%]="progressPercentage">
        </div>
      </div>

      <!-- Vencimiento -->
      <div class="flex justify-between mt-4 text-sm opacity-70">
        <span>Vence</span>
        <span class="font-medium opacity-90">{{ expiration }}</span>
      </div>
    </div>
  `
})
export class CardModuleComponent {

  /* -------- INPUTS -------- */
  @Input() icon!: LucideIconData;
  @Input() color: 'green'| 'red'| 'gray' | 'blue' = 'blue';

  @Input() title!: string;

  @Input() used: number = 0;
  @Input() total: number = 100;

  @Input() expiration!: string;

  @Input() pillLabel?: string;
  @Input() pillColor?: string;

  /* -------- PROGRESO -------- */
  get progressPercentage(): number {
    if (this.total <= 0) return 0;
    return (this.used / this.total) * 100;
  }

  /* -------- COLORES -------- */
  progressColors = {
    'green': 'bg-orange-500',
    'red': 'bg-green-500',
    'gray': 'bg-yellow-400',
    'blue':  'bg-red-500'
  };

}
