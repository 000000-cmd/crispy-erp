import { Component } from '@angular/core';
import { PillComponent } from '../../shared/components/ui/pill.component';
import { LucideAngularModule, Moon, Sun } from 'lucide-angular';
import { ThemeService } from '../../shared/theme.service';

@Component({
  selector: 'header-erp',
  standalone: true,
  templateUrl: './header.component.html',
  imports: [PillComponent, LucideAngularModule, ]
})
export class HeaderComponent {
  readonly moonIcon = Moon;
  readonly sunIcon  = Sun;


  constructor(public themeService: ThemeService) {}

  get currentIcon() {
    return this.themeService.current === 'dark'
      ? this.sunIcon
      : this.moonIcon;
  }

  toggleTheme() {
    this.themeService.toggle();
  }
 
}
