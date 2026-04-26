import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, startWith } from 'rxjs';

interface Crumb { label: string; url?: string; }

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="flex items-center gap-1.5 text-xs">
      @for (c of crumbs(); track c.label; let last = $last) {
        @if (c.url && !last) {
          <a [routerLink]="c.url" class="text-text-muted hover:text-text">{{ c.label }}</a>
        } @else {
          <span [class.text-text]="last" [class.font-medium]="last" [class.text-text-muted]="!last">{{ c.label }}</span>
        }
        @if (!last) { <span class="text-text-soft">/</span> }
      }
    </nav>
  `,
})
export class BreadcrumbsComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly nav = toSignal(
    this.router.events.pipe(filter(e => e instanceof NavigationEnd), startWith(null)),
    { initialValue: null },
  );

  readonly crumbs = computed<Crumb[]>(() => {
    void this.nav();
    const out: Crumb[] = [];
    let r: ActivatedRoute | null = this.route.root;
    let url = '';
    while (r) {
      const segs = r.snapshot.url.map(s => s.path).join('/');
      if (segs) url += `/${segs}`;
      const data = r.snapshot.data['crumb'];
      if (data) out.push({ label: data, url });
      r = r.firstChild;
    }
    return out;
  });
}
