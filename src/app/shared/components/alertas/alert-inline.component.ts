import { CommonModule } from "@angular/common";
import { Component, Input, OnChanges } from "@angular/core";
import { CircleAlert, InfoIcon, LucideAngularModule, TriangleAlert } from "lucide-angular";



@Component({
  selector: "alert-inline",
  template: `
    <div class="w-full rounded-xl p-4 flex items-start gap-4"
        [ngClass]="current.wrapper">

      <!-- Ícono -->
      <div class="text-xl mt-1" [ngClass]="current.icon">
        <lucide-icon [name]="currentIcon"></lucide-icon>
      </div>

      <!-- Título + mensaje -->
      <div class="flex-1">
        <h3 class="font-semibold" [ngClass]="current.title">{{ title }}</h3>
        <p class="text-gray-700 dark:text-gray-200 mt-1 text-sm">
          {{ message }}
        </p>
      </div>

      <!-- Badge / acción -->
      @if (badge) {
        <div class="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-semibold self-center">
          {{ badge }}
        </div>
      }
    </div>
  `,
  imports: [CommonModule, LucideAngularModule]
})  

export class AlertInlineComponent implements OnChanges {

  @Input() title: string = 'Alerta';
  @Input() message: string = ' Este es un mensaje de alerta importante.';
  @Input() badge: string = '8 paquetes'; // ejemplo: "8 paquetes"
  @Input() type: 'warning' | 'danger' | 'info' = 'warning';

  readonly infoIcon = InfoIcon;
  readonly warningIcon = TriangleAlert;
  readonly dangerIcon = CircleAlert;


  icon ={
    warning: this.warningIcon,
    danger: this.dangerIcon,
    info: this.infoIcon,
  }

  styles = {
    warning:  {
      wrapper: 'border border-orange-200 bg-orange-50  dark:border-amber-400 dark:bg-amber-950',
      title:   'text-orange-600 dark:text-amber-300',
      icon:    'text-orange-500',
    },
    danger: {
      wrapper: 'border border-red-200 bg-red-50',
      title:   'text-red-600',
      icon:    'text-red-500',
    },
    info: {
      wrapper: 'border border-blue-200 bg-blue-50',
      title:   'text-blue-600',
      icon:    'text-blue-500',
    }
  };

  current = this.styles.warning;
  currentIcon=  this.icon.warning
  ngOnChanges() {
    this.current = this.styles[this.type];
    this.currentIcon = this.icon[this.type];
  }

}