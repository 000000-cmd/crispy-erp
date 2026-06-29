import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '../../core/theme/theme.service';
import { BrandingService } from '../../core/branding/branding.service';
import { LucideAngularModule, Moon, Sun } from 'lucide-angular';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LucideAngularModule],
  templateUrl: './auth-layout.component.html',
})
export class AuthLayoutComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly branding = inject(BrandingService);
  protected readonly moonIcon = Moon;
  protected readonly sunIcon = Sun;
}
