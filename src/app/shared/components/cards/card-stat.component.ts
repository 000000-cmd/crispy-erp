import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { LucideAngularModule, LucideIconData, Users } from "lucide-angular";


@Component({
  selector: "card-stat",
  standalone: true,
  imports: [LucideAngularModule, CommonModule],
  template: `
    <div class="w-full h-full bg-(--foreground-light) dark:bg-(--foreground-dark) p-5 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
        
      <div class="flex justify-between items-center">
        <p>{{ label }}</p>
        <lucide-angular
          [name]="icon"
          class="w-6 h-6 text-(--primary-color)">
        </lucide-angular>
      </div>

      <div>
        <p>{{ value }}</p>

        <p 
          [ngClass]="percentageChange >= 0 ? 'text-green-500' : 'text-red-500'"
          class="text-sm font-medium"
        >
          {{ percentageChange > 0 ? '+' : '' }}{{ percentageChange }}% {{ comparisonText }}
        </p>
      </div>

    </div>
  `,
})
export class CardStatComponent {

  @Input() icon: LucideIconData = Users;
  @Input() label: string = 'Clientes Hoy';
  @Input() value: number = 28;
  @Input() percentageChange: number = 12;
  @Input() comparisonText: string = "vs ayer";
}
