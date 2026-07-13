import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule, Phone, Mail, MapPin, Clock, Instagram, Facebook,
  MessageCircle, CalendarClock, Sparkles, ChevronDown,
} from 'lucide-angular';
import { formatCOP } from '../../shared/util/money';
import { PublicLanding, assetUrl, parseGallery } from './landing.model';

/**
 * Página pública del NEGOCIO (la que se ve al entrar por su subdominio).
 * 100% data-driven: recibe el agregado `PublicLanding` y pinta hero, servicios,
 * sedes, galería, horario y contacto con la paleta del negocio (el BrandingService
 * ya aplicó sus colores). La reutiliza tal cual el editor "Mi página" como
 * preview en vivo — por eso NO hace fetch propio.
 */
@Component({
  selector: 'app-tenant-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './tenant-landing.component.html',
})
export class TenantLandingComponent {
  readonly data = input.required<PublicLanding>();
  /** Modo preview (editor): desactiva navegación real de los CTAs. */
  readonly preview = input(false);

  protected readonly phoneIcon = Phone;
  protected readonly mailIcon = Mail;
  protected readonly pinIcon = MapPin;
  protected readonly clockIcon = Clock;
  protected readonly igIcon = Instagram;
  protected readonly fbIcon = Facebook;
  protected readonly waIcon = MessageCircle;
  protected readonly calendarIcon = CalendarClock;
  protected readonly sparklesIcon = Sparkles;
  protected readonly chevronDown = ChevronDown;
  protected readonly fmt = formatCOP;

  readonly logo = computed(() => assetUrl(this.data().business.logoUrl));
  readonly hero = computed(() => assetUrl(this.data().landing.heroImageUrl));
  readonly gallery = computed(() => parseGallery(this.data().landing.galleryJson));

  readonly waLink = computed(() => {
    const wa = (this.data().landing.whatsapp ?? '').replace(/\D+/g, '');
    return wa ? `https://wa.me/${wa}` : null;
  });
  readonly igLink = computed(() => {
    const ig = (this.data().landing.instagram ?? '').trim();
    if (!ig) return null;
    return ig.startsWith('http') ? ig : `https://instagram.com/${ig.replace(/^@/, '')}`;
  });
  readonly fbLink = computed(() => {
    const fb = (this.data().landing.facebook ?? '').trim();
    if (!fb) return null;
    return fb.startsWith('http') ? fb : `https://facebook.com/${fb}`;
  });

  readonly hasContact = computed(() => {
    const l = this.data().landing;
    return !!(l.phone || l.whatsapp || l.contactEmail || this.igLink() || this.fbLink());
  });
}
