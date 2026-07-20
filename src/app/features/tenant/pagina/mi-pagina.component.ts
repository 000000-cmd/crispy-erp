import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Upload, Trash2, ExternalLink, Globe, EyeOff,
  Eye, Sparkles, Pencil, Monitor, Smartphone, Scissors, Image as ImageIcon, MessageSquare, LayoutTemplate } from 'lucide-angular';

import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { AuthService } from '../../../core/auth/auth.service';
import { BusinessApi } from '../../admin/business/business.api';
import { Business, BusinessDomain } from '../../admin/business/business.model';
import { SedesApi } from '../sedes/sedes.api';
import { ServiciosApi } from '../servicios/servicios.api';
import { Branch } from '../sedes/sedes.model';
import { Offering } from '../servicios/servicios.model';

import { LandingApi } from '../../public-site/landing.api';
import { PublicLanding, assetUrl } from '../../public-site/landing.model';
import { TenantLandingComponent } from '../../public-site/tenant-landing.component';

/** Campos editables del borrador (espejo plano de business_landing). */
interface Draft {
  tagline: string; about: string; phone: string; whatsapp: string; contactEmail: string;
  instagram: string; facebook: string; heroImageUrl: string; scheduleText: string;
}

const EMPTY_DRAFT: Draft = {
  tagline: '', about: '', phone: '', whatsapp: '', contactEmail: '',
  instagram: '', facebook: '', heroImageUrl: '', scheduleText: '',
};

/**
 * Editor "Mi página": el dueño personaliza su landing pública con PREVIEW EN
 * VIVO — el panel derecho es EXACTAMENTE el componente de la página pública
 * alimentado por el borrador, así que cada tecla se refleja al instante.
 * Guardar persiste el borrador; Publicar lo hace visible en su subdominio.
 */
@Component({
  selector: 'app-mi-pagina',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, PageHeaderComponent, ButtonComponent, SkeletonComponent, TenantLandingComponent],
  templateUrl: './mi-pagina.component.html',
})
export class MiPaginaComponent {
  private readonly landingApi = inject(LandingApi);
  private readonly businessApi = inject(BusinessApi);
  private readonly sedesApi = inject(SedesApi);
  private readonly serviciosApi = inject(ServiciosApi);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);

  protected readonly uploadIcon = Upload;
  protected readonly trashIcon = Trash2;
  protected readonly linkIcon = ExternalLink;
  protected readonly globeIcon = Globe;
  protected readonly eyeOffIcon = EyeOff;
  protected readonly eyeIcon = Eye;
  protected readonly sparklesIcon = Sparkles;
  protected readonly pencilIcon = Pencil;
  protected readonly monitorIcon = Monitor;
  protected readonly phoneIcon = Smartphone;
  protected readonly scissorsIcon = Scissors;
  protected readonly imageIcon = ImageIcon;
  protected readonly forumIcon = MessageSquare;
  protected readonly heroIcon = LayoutTemplate;
  protected readonly assetUrl = assetUrl;

  readonly businessId = this.auth.user()?.businessId ?? null;

  readonly loading = signal(true);
  readonly business = signal<Business | null>(null);
  readonly branches = signal<Branch[]>([]);
  readonly offerings = signal<Offering[]>([]);
  readonly slug = signal<string | null>(null);

  readonly draft = signal<Draft>({ ...EMPTY_DRAFT });
  /** URLs (relativas) de la galería; se serializa a JSON al guardar/previsualizar. */
  readonly gallery = signal<string[]>([]);
  readonly published = signal(false);
  readonly dirty = signal(false);
  readonly saving = signal(false);
  readonly uploading = signal(false);

  /** El preview consume el MISMO shape que la página pública real. */
  readonly previewData = computed<PublicLanding | null>(() => {
    const b = this.business();
    if (!b) return null;
    const d = this.draft();
    return {
      business: {
        id: b.id, name: b.name, logoUrl: b.logoUrl,
        primaryColor: b.primaryColor, secondaryColor: b.secondaryColor,
        slug: this.slug() ?? '',
      },
      landing: {
        tagline: d.tagline, about: d.about, phone: d.phone, whatsapp: d.whatsapp,
        contactEmail: d.contactEmail, instagram: d.instagram, facebook: d.facebook,
        heroImageUrl: d.heroImageUrl, galleryJson: JSON.stringify(this.gallery()),
        scheduleText: d.scheduleText,
      },
      branches: this.branches().map(br => ({ name: br.name, addressLine: br.addressLine, phone: br.phone })),
      offerings: this.offerings().filter(o => o.isActive)
        .map(o => ({ name: o.name, description: o.description, price: o.price, durationMinutes: o.durationMinutes })),
    };
  });

  readonly publicUrl = computed(() => {
    const s = this.slug();
    return s ? `${location.origin}/?tenant=${s}` : null;
  });

  constructor() {
    const businessId = this.businessId;
    if (!businessId) { this.loading.set(false); return; }

    this.businessApi.get(businessId).subscribe({ next: b => this.business.set(b) });
    this.sedesApi.list(businessId).subscribe({ next: b => this.branches.set(b) });
    this.serviciosApi.list(businessId).subscribe({ next: o => this.offerings.set(o) });
    this.businessApi.listDomains(businessId).subscribe({
      next: (ds: BusinessDomain[]) => this.slug.set(ds.find(d => d.isPrimary)?.slug ?? ds[0]?.slug ?? null),
    });

    this.landingApi.byBusiness(businessId).subscribe({
      next: l => {
        if (l) {
          this.draft.set({
            tagline: l.tagline ?? '', about: l.about ?? '', phone: l.phone ?? '',
            whatsapp: l.whatsapp ?? '', contactEmail: l.contactEmail ?? '',
            instagram: l.instagram ?? '', facebook: l.facebook ?? '',
            heroImageUrl: l.heroImageUrl ?? '', scheduleText: l.scheduleText ?? '',
          });
          try { this.gallery.set(JSON.parse(l.galleryJson ?? '[]')); } catch { this.gallery.set([]); }
          this.published.set(!!l.published);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  /** Un solo punto de mutación del borrador: refresca preview y marca dirty. */
  patch<K extends keyof Draft>(key: K, value: Draft[K]) {
    this.draft.update(d => ({ ...d, [key]: value }));
    this.dirty.set(true);
  }

  uploadHero(input: HTMLInputElement) {
    const file = input.files?.[0];
    if (!file || !this.businessId) return;
    this.uploading.set(true);
    this.landingApi.uploadAsset(this.businessId, file).subscribe({
      next: url => { this.patch('heroImageUrl', url); this.uploading.set(false); input.value = ''; },
      error: () => { this.uploading.set(false); input.value = ''; },
    });
  }

  uploadGallery(input: HTMLInputElement) {
    const file = input.files?.[0];
    if (!file || !this.businessId) return;
    this.uploading.set(true);
    this.landingApi.uploadAsset(this.businessId, file).subscribe({
      next: url => {
        this.gallery.update(g => [...g, url]);
        this.dirty.set(true);
        this.uploading.set(false);
        input.value = '';
      },
      error: () => { this.uploading.set(false); input.value = ''; },
    });
  }

  removeGalleryItem(url: string) {
    this.gallery.update(g => g.filter(u => u !== url));
    this.dirty.set(true);
  }

  clearHero() { this.patch('heroImageUrl', ''); }

  /** Guarda el borrador sin cambiar el estado de publicación. */
  save() { this.persist(this.published(), 'Página guardada'); }

  /** Publica (o despublica) y guarda en el mismo upsert. */
  togglePublish() {
    const next = !this.published();
    this.persist(next, next ? '¡Tu página está publicada! 🎉' : 'Página despublicada');
  }

  private persist(published: boolean, okMessage: string) {
    if (!this.businessId) return;
    const d = this.draft();
    this.saving.set(true);
    this.landingApi.upsert(this.businessId, {
      tagline: d.tagline || null, about: d.about || null, phone: d.phone || null,
      whatsapp: d.whatsapp || null, contactEmail: d.contactEmail || null,
      instagram: d.instagram || null, facebook: d.facebook || null,
      heroImageUrl: d.heroImageUrl || null, galleryJson: JSON.stringify(this.gallery()),
      scheduleText: d.scheduleText || null, published,
    }).subscribe({
      next: saved => {
        this.published.set(!!saved.published);
        this.dirty.set(false);
        this.saving.set(false);
        this.toast.success(okMessage);
      },
      error: () => this.saving.set(false),
    });
  }
}
