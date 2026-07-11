import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LucideAngularModule, Bell, PanelLeftClose, PanelLeftOpen } from 'lucide-angular';
import { LayoutStateService } from './layout-state.service';
import { ThemeSwitchComponent } from '../../shared/ui/theme-switch/theme-switch.component';
import { LanguageToggleComponent } from './language-toggle.component';
import { TPipe } from '../../shared/pipes/t.pipe';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ThemeSwitchComponent, LanguageToggleComponent, TPipe],
  templateUrl: './topbar.component.html',
})
export class TopbarComponent {
  protected readonly layout = inject(LayoutStateService);
  protected readonly bellIcon = Bell;
  protected readonly openIcon = PanelLeftOpen;
  protected readonly closeIcon = PanelLeftClose;
}
