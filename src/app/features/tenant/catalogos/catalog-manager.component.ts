import { Component, inject, input, output, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Trash2 } from 'lucide-angular';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { CategoriasApi } from './categorias.api';
import { SpecialtiesApi } from './specialties.api';
import { OfferingCategory, Specialty } from './catalog.model';

/**
 * Gestor de catálogos del negocio: categorías y especialidades de servicios.
 * Se abre como modal desde Servicios; CRUD inline (crear/eliminar) de ambas
 * listas. El renombrado no está en el alcance de Fase A (solo alta/baja).
 */
@Component({
  selector: 'app-catalog-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ModalComponent, ButtonComponent, InputComponent],
  templateUrl: './catalog-manager.component.html',
})
export class CatalogManagerComponent {
  private readonly categoriasApi = inject(CategoriasApi);
  private readonly specialtiesApi = inject(SpecialtiesApi);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  readonly businessId = input.required<string>();
  readonly open = input(false);
  readonly onClose = output<void>();

  protected readonly plusIcon = Plus;
  protected readonly trashIcon = Trash2;

  readonly categories = signal<OfferingCategory[]>([]);
  readonly specialties = signal<Specialty[]>([]);
  readonly newCategory = signal('');
  readonly newSpecialty = signal('');

  constructor() {
    effect(() => { if (this.open()) this.reload(); });
  }

  private reload() {
    const bid = this.businessId();
    this.categoriasApi.list(bid).subscribe({ next: c => this.categories.set(c) });
    this.specialtiesApi.list(bid).subscribe({ next: s => this.specialties.set(s) });
  }

  addCategory() {
    const name = this.newCategory().trim();
    if (!name) return;
    // displayOrder explícito: el back rechaza NULL en esa columna (NOT NULL sin
    // default efectivo vía MapStruct); la UI no ofrece reordenar en Fase A.
    this.categoriasApi.create({ businessId: this.businessId(), name, displayOrder: this.categories().length }).subscribe({
      next: () => { this.newCategory.set(''); this.toast.success('Categoría creada'); this.reload(); },
    });
  }

  async removeCategory(c: OfferingCategory) {
    const ok = await this.confirm.ask({ title: 'Eliminar categoría', message: `¿Eliminar "${c.name}"?`, tone: 'danger', confirmText: 'Eliminar' });
    if (!ok) return;
    this.categoriasApi.remove(c.id).subscribe({ next: () => { this.toast.success('Categoría eliminada'); this.reload(); } });
  }

  addSpecialty() {
    const name = this.newSpecialty().trim();
    if (!name) return;
    // displayOrder explícito: mismo motivo que en addCategory().
    this.specialtiesApi.create({ businessId: this.businessId(), name, displayOrder: this.specialties().length }).subscribe({
      next: () => { this.newSpecialty.set(''); this.toast.success('Especialidad creada'); this.reload(); },
    });
  }

  async removeSpecialty(s: Specialty) {
    const ok = await this.confirm.ask({ title: 'Eliminar especialidad', message: `¿Eliminar "${s.name}"?`, tone: 'danger', confirmText: 'Eliminar' });
    if (!ok) return;
    this.specialtiesApi.remove(s.id).subscribe({ next: () => { this.toast.success('Especialidad eliminada'); this.reload(); } });
  }
}
