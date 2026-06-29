import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, of, switchMap } from 'rxjs';
import { LucideAngularModule, Pencil, Plus, Trash2, Phone, MapPin } from 'lucide-angular';

import { TagComponent } from '../../../../shared/ui/tag/tag.component';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { AutocompleteComponent } from '../../../../shared/ui/autocomplete/autocomplete.component';
import { AutocompleteOption, AutocompleteSearchFn } from '../../../../shared/ui/autocomplete/autocomplete.types';
import { CheckboxComponent } from '../../../../shared/ui/checkbox/checkbox.component';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { ConfirmService } from '../../../../shared/ui/confirm/confirm.service';
import { LocationsApi } from '../../../../core/location/locations.api';
import { SystemListsApi, CatalogItem } from '../../system-lists/system-lists.api';
import { ThirdPartyApi } from '../thirdparty.api';
import { ThirdPartyAddress, ThirdPartyContact } from '../thirdparty.model';

/** Reglas de validación/máscara por CÓDIGO de tipo de contacto (estable, migrado). */
interface ContactRule { mask: 'phone' | 'none'; pattern: RegExp; placeholder: string; help: string; }
const CONTACT_RULES: Record<string, ContactRule> = {
  MOBILE:    { mask: 'phone', pattern: /^3\d{2} \d{3} \d{4}$/, placeholder: '300 123 4567', help: 'Celular de 10 dígitos (empieza por 3).' },
  WHATSAPP:  { mask: 'phone', pattern: /^3\d{2} \d{3} \d{4}$/, placeholder: '300 123 4567', help: 'Número de WhatsApp (10 dígitos).' },
  PHONE:     { mask: 'phone', pattern: /^\d{3} \d{3} \d{4}$/, placeholder: '601 234 5678', help: 'Teléfono fijo de 10 dígitos.' },
  EMAIL:     { mask: 'none',  pattern: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, placeholder: 'correo@dominio.com', help: 'Correo electrónico válido.' },
  INSTAGRAM: { mask: 'none',  pattern: /^@?[A-Za-z0-9._]{2,30}$/, placeholder: '@usuario', help: 'Usuario de Instagram.' },
  OTHER:     { mask: 'none',  pattern: /^.{2,}$/, placeholder: 'Valor del contacto', help: '' },
};
const DEFAULT_RULE: ContactRule = CONTACT_RULES['OTHER'];

/**
 * CRUD hijos de un Tercero: CONTACTOS y DIRECCIONES (1:N).
 *
 * - Alta/edición en MODAL con los componentes del sistema (`app-autocomplete`
 *   como dropdown, `app-checkbox`), no controles nativos.
 * - Validación + MÁSCARA por código de tipo de contacto (MOBILE → teléfono…).
 * - Municipio capturado DIRECTO del `(selected)` del autocomplete (UUID en
 *   `meta.hit.municipalityId`), no de la meta anidada del picker.
 * - Una sola "principal" por tipo (auto-desmarca la anterior).
 * - Al crear, el formulario se REINICIA (no arrastra datos previos).
 */
@Component({
  selector: 'app-thirdparty-relations',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, LucideAngularModule,
    TagComponent, ModalComponent, AutocompleteComponent, CheckboxComponent,
  ],
  templateUrl: './thirdparty-relations.component.html',
})
export class ThirdPartyRelationsComponent {
  private readonly api = inject(ThirdPartyApi);
  private readonly lists = inject(SystemListsApi);
  private readonly locations = inject(LocationsApi);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly fb = inject(FormBuilder);

  readonly thirdPartyId = input.required<string>();

  protected readonly plusIcon = Plus;
  protected readonly editIcon = Pencil;
  protected readonly delIcon = Trash2;
  protected readonly phoneIcon = Phone;
  protected readonly pinIcon = MapPin;

  readonly contacts = signal<ThirdPartyContact[]>([]);
  readonly addresses = signal<ThirdPartyAddress[]>([]);
  readonly contactTypes = signal<CatalogItem[]>([]);
  readonly addressTypes = signal<CatalogItem[]>([]);
  readonly saving = signal(false);

  // Opciones para los dropdown (app-autocomplete con options estáticas).
  readonly contactTypeOptions = computed<AutocompleteOption[]>(() => this.contactTypes().map(t => ({ value: t.id, label: t.name })));
  readonly addressTypeOptions = computed<AutocompleteOption[]>(() => this.addressTypes().map(t => ({ value: t.id, label: t.name })));

  // ----- Modales -----
  readonly contactModalOpen = signal(false);
  readonly addressModalOpen = signal(false);
  readonly editingContactId = signal<string | null>(null);
  readonly editingAddressId = signal<string | null>(null);

  // Código del tipo de contacto seleccionado (gobierna máscara/validación/placeholder).
  readonly contactCode = signal<string>('');
  readonly contactRule = computed<ContactRule>(() => CONTACT_RULES[this.contactCode()] ?? DEFAULT_RULE);
  private reformatting = false;

  // Ubicación: búsqueda con app-autocomplete; el UUID se captura en (selected).
  private muniId = '';
  private neighId = '';
  readonly muniCode = signal<string>('');
  readonly muniLabel = signal('');
  readonly addressTouched = signal(false);
  readonly muniSearchFn: AutocompleteSearchFn = this.locations.searchFn.municipalities();
  readonly neighSearchFn = computed<AutocompleteSearchFn>(() =>
    this.locations.searchFn.neighborhoods(undefined, undefined, this.muniCode() || undefined));

  readonly contactForm: FormGroup = this.fb.group({
    contactTypeId: ['', Validators.required],
    value: ['', [Validators.required]],
    isPrimary: [false],
    notes: [''],
  });

  readonly addressForm: FormGroup = this.fb.group({
    addressTypeId: [''],
    line: ['', [Validators.required, Validators.maxLength(200)]],
    reference: ['', [Validators.maxLength(200)]],
    isPrimary: [false],
  });

  private readonly typeName = (items: CatalogItem[], id?: string | null) => items.find(i => i.id === id)?.name ?? '—';
  readonly contactTypeName = computed(() => (id?: string | null) => this.typeName(this.contactTypes(), id));
  readonly addressTypeName = computed(() => (id?: string | null) => this.typeName(this.addressTypes(), id));

  constructor() {
    this.lists.itemsEnabled('contact_type').subscribe(t => this.contactTypes.set(t ?? []));
    this.lists.itemsEnabled('address_type').subscribe(t => this.addressTypes.set(t ?? []));
    effect(() => { const id = this.thirdPartyId(); if (id) this.reload(id); });

    this.contactForm.get('contactTypeId')!.valueChanges.subscribe((id: string) => {
      this.contactCode.set(this.contactTypes().find(t => t.id === id)?.code ?? '');
      this.applyValueRules();
    });
    this.contactForm.get('value')!.valueChanges.subscribe((v: string) => {
      if (this.reformatting || this.contactRule().mask !== 'phone') return;
      const masked = this.maskPhone(v ?? '');
      if (masked !== v) {
        this.reformatting = true;
        this.contactForm.get('value')!.setValue(masked);
        this.reformatting = false;
      }
    });
  }

  private applyValueRules() {
    const ctrl = this.contactForm.get('value')!;
    ctrl.setValidators([Validators.required, Validators.pattern(this.contactRule().pattern)]);
    if (this.contactRule().mask === 'phone') {
      this.reformatting = true;
      ctrl.setValue(this.maskPhone(ctrl.value ?? ''));
      this.reformatting = false;
    }
    ctrl.updateValueAndValidity({ emitEvent: false });
  }

  private maskPhone(raw: string): string {
    const d = (raw ?? '').replace(/\D/g, '').slice(0, 10);
    const g: string[] = [];
    if (d.length) g.push(d.slice(0, 3));
    if (d.length > 3) g.push(d.slice(3, 6));
    if (d.length > 6) g.push(d.slice(6, 10));
    return g.join(' ');
  }

  private reload(id: string) {
    this.api.listContacts(id).subscribe(c => this.contacts.set(c ?? []));
    this.api.listAddresses(id).subscribe(a => this.addresses.set(a ?? []));
  }

  // ----------------------- CONTACTOS -----------------------
  openNewContact() {
    this.editingContactId.set(null);
    this.contactCode.set('');
    this.contactForm.reset({ contactTypeId: '', value: '', isPrimary: false, notes: '' });
    this.contactForm.get('value')!.setValidators([Validators.required]);
    this.contactForm.get('value')!.updateValueAndValidity({ emitEvent: false });
    this.contactModalOpen.set(true);
  }
  openEditContact(c: ThirdPartyContact) {
    this.editingContactId.set(c.id);
    this.contactForm.reset({ contactTypeId: c.contactTypeId, value: c.value, isPrimary: !!c.isPrimary, notes: c.notes ?? '' });
    this.contactCode.set(this.contactTypes().find(t => t.id === c.contactTypeId)?.code ?? '');
    this.applyValueRules();
    this.contactModalOpen.set(true);
  }
  closeContactModal() { this.contactModalOpen.set(false); }

  saveContact() {
    if (this.contactForm.invalid) { this.contactForm.markAllAsTouched(); return; }
    const v = this.contactForm.getRawValue();
    const editId = this.editingContactId();
    const payload = {
      thirdPartyId: this.thirdPartyId(),
      contactTypeId: v.contactTypeId,
      value: (v.value ?? '').trim(),
      isPrimary: !!v.isPrimary,
      notes: v.notes || undefined,
    };
    this.saving.set(true);
    const demote = (v.isPrimary
      ? this.contacts().find(c => c.contactTypeId === v.contactTypeId && c.isPrimary && c.id !== editId)
      : undefined);
    const pre: Observable<unknown> = demote ? this.api.updateContact(demote.id, { isPrimary: false }) : of(null);

    pre.pipe(switchMap(() => editId ? this.api.updateContact(editId, payload) : this.api.createContact(payload)))
      .subscribe({
        next: () => { this.toast.success(editId ? 'Contacto actualizado' : 'Contacto asignado'); this.saving.set(false); this.contactModalOpen.set(false); this.reload(this.thirdPartyId()); },
        error: () => this.saving.set(false),
      });
  }

  async deleteContact(c: ThirdPartyContact) {
    const ok = await this.confirm.ask({ title: 'Eliminar contacto', message: `¿Eliminar "${c.value}"?`, confirmText: 'Eliminar', tone: 'danger' });
    if (!ok) return;
    this.api.removeContact(c.id).subscribe({ next: () => { this.toast.success('Contacto eliminado'); this.reload(this.thirdPartyId()); } });
  }

  // ----------------------- DIRECCIONES -----------------------
  openNewAddress() {
    this.editingAddressId.set(null);
    this.addressForm.reset({ addressTypeId: '', line: '', reference: '', isPrimary: false });
    this.muniId = ''; this.neighId = ''; this.muniCode.set(''); this.muniLabel.set(''); this.addressTouched.set(false);
    this.addressModalOpen.set(true);
  }
  openEditAddress(a: ThirdPartyAddress) {
    this.editingAddressId.set(a.id);
    this.addressForm.reset({ addressTypeId: a.addressTypeId ?? '', line: a.line ?? '', reference: a.reference ?? '', isPrimary: !!a.isPrimary });
    this.muniId = a.municipalityId; this.neighId = a.neighborhoodId ?? ''; this.muniCode.set(''); this.addressTouched.set(false);
    this.muniLabel.set('');
    // Mostrar el municipio actual (nombre) para no obligar a re-buscarlo.
    if (a.municipalityId) this.locations.municipality(a.municipalityId).subscribe({ next: m => this.muniLabel.set(m?.name ?? ''), error: () => {} });
    this.addressModalOpen.set(true);
  }
  closeAddressModal() { this.addressModalOpen.set(false); }

  /** Captura del municipio: el UUID está en la opción seleccionada (meta.hit). */
  onMuniSelected(opt: AutocompleteOption | null) {
    const hit = opt?.meta?.['hit'] as Record<string, unknown> | undefined;
    this.muniId = (hit?.['municipalityId'] as string) ?? '';
    this.muniCode.set((hit?.['municipalityCode'] as string) ?? '');
    this.muniLabel.set(opt?.label ?? '');
    this.neighId = ''; // al cambiar municipio, se limpia el barrio
  }
  onNeighSelected(opt: AutocompleteOption | null) {
    const hit = opt?.meta?.['hit'] as Record<string, unknown> | undefined;
    this.neighId = (hit?.['neighborhoodId'] as string) ?? '';
  }

  saveAddress() {
    this.addressTouched.set(true);
    if (this.addressForm.invalid) this.addressForm.markAllAsTouched();
    if (!this.muniId) { this.toast.error('Selecciona el municipio en el buscador de ubicación.'); return; }
    if (this.addressForm.invalid) return;

    const v = this.addressForm.getRawValue();
    const editId = this.editingAddressId();
    const payload = {
      thirdPartyId: this.thirdPartyId(),
      addressTypeId: v.addressTypeId || undefined,
      municipalityId: this.muniId,
      neighborhoodId: this.neighId || undefined,
      line: (v.line ?? '').trim(),
      reference: v.reference || undefined,
      isPrimary: !!v.isPrimary,
    };
    this.saving.set(true);
    const demote = (v.isPrimary
      ? this.addresses().find(a => a.isPrimary && a.id !== editId)
      : undefined);
    const pre: Observable<unknown> = demote ? this.api.updateAddress(demote.id, { isPrimary: false }) : of(null);

    pre.pipe(switchMap(() => editId ? this.api.updateAddress(editId, payload) : this.api.createAddress(payload)))
      .subscribe({
        next: () => { this.toast.success(editId ? 'Dirección actualizada' : 'Dirección asignada'); this.saving.set(false); this.addressModalOpen.set(false); this.reload(this.thirdPartyId()); },
        error: () => this.saving.set(false),
      });
  }

  async deleteAddress(a: ThirdPartyAddress) {
    const ok = await this.confirm.ask({ title: 'Eliminar dirección', message: '¿Eliminar esta dirección?', confirmText: 'Eliminar', tone: 'danger' });
    if (!ok) return;
    this.api.removeAddress(a.id).subscribe({ next: () => { this.toast.success('Dirección eliminada'); this.reload(this.thirdPartyId()); } });
  }
}
