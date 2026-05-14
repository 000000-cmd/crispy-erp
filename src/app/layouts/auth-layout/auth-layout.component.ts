import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '../../core/theme/theme.service';
import { LucideAngularModule, Moon, Sun } from 'lucide-angular';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, LucideAngularModule],
  templateUrl: './auth-layout.component.html',
})
export class AuthLayoutComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly moonIcon = Moon;
  protected readonly sunIcon = Sun;
}
