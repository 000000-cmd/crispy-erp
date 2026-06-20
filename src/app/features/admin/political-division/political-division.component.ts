import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { Observable } from 'rxjs';
import {
  LucideAngularModule, Plus, Pencil, Trash2, Power, PowerOff,
  ChevronDown, ChevronRight, MapPin, Globe2, Map as MapPinned, Building2, Home,
} from 'lucide-angular';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { DrawerComponent } from '../../../shared/ui/drawer/drawer.component';
import { EmptyComponent } from '../../../shared/ui/empty/empty.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { AutocompleteComponent } from '../../../shared/ui/autocomplete/autocomplete.component';
import { AutocompleteOption } from '../../../shared/ui/autocomplete/autocomplete.types';
import { DynamicFormComponent } from '../../../shared/forms/dynamic-form.component';
import { FormSchema, Option } from '../../../shared/forms/core/types';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { collapse } from '../../../shared/animations';
import {
  LocationsApi, LocationHit, Country, Department, Municipality, Neighborhood,
  CountryRequest, DepartmentRequest, MunicipalityRequest, NeighborhoodRequest, NeighborhoodType,
} from '../../../core/location/locations.api';

type Level = 'country' | 'department' | 'municipality' | 'neighborhood';

/** Nodo unificado para render. Codes son las claves estables del search. */
interface Node {
  id: string;          // UUID (del back o vacio si solo viene del search)
  code: string;        // siempre presente
  name: string;
  enabled: boolean;    // por elastic siempre true tras ultimo evento; toggle se refleja al recargar
  raw?: LocationHit;
}

interface EditorState {
  mode: 'create' | 'edit';
  level: Level;
  /** Para create: nodo padre desde donde se abrio (codes). Para edit: snapshot completo. */
  parentCodes?: { countryCode?: string; departmentCode?: string; municipalityCode?: string };
  model?: any;
}

/**
 * Division Politica: arbol de tarjetas anidadas para administrar pais > depto >
 * municipio > barrio/vereda. Lectura via elastic (search-service), escritura
 * via system-service. Cada tarjeta tiene editar / inhabilitar / eliminar; los
 * contenedores aniaden boton "+" para crear hijos.
 */
@Component({
  selector: 'app-political-division',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ButtonComponent, DrawerComponent,
    EmptyComponent, SpinnerComponent, AutocompleteComponent, DynamicFormComponent],
  templateUrl: './political-division.component.html',
  animations: [collapse],
})
export class PoliticalDivisionComponent {
  private readonly api = inject(LocationsApi);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);

  // ----- icons -----
  protected readonly plusIcon = Plus;
  protected readonly editIcon = Pencil;
  protected readonly trashIcon = Trash2;
  protected readonly powerOnIcon = Power;
  protected readonly powerOffIcon = PowerOff;
  protected readonly down = ChevronDown;
  protected readonly right = ChevronRight;
  protected readonly globeIcon = Globe2;
  protected readonly mapIcon = MapPinned;
  protected readonly cityIcon = Building2;
  protected readonly homeIcon = Home;
  protected readonly pinIcon = MapPin;

  // ----- estado del arbol -----
  readonly countries = signal<Node[]>([]);
  readonly loadingCountries = signal(false);

  // departamentos por countryCode
  readonly departments = signal<Record<string, Node[]>>({});
  readonly loadingDepartments = signal<Record<string, boolean>>({});

  // municipios por departmentCode
  readonly municipalities = signal<Record<string, Node[]>>({});
  readonly loadingMunicipalities = signal<Record<string, boolean>>({});

  // barrios por municipalityCode
  readonly neighborhoods = signal<Record<string, Node[]>>({});
  readonly loadingNeighborhoods = signal<Record<string, boolean>>({});

  readonly openMap = signal<Record<string, boolean>>({});

  // ----- filtros (codes seleccionados) -----
  // Cada filtro restringe la lista del nivel correspondiente a un solo nodo
  // (el seleccionado). Set a null para volver a "mostrar todos".
  readonly countryFilter = signal<string | null>(null);
  readonly departmentFilter = signal<Record<string, string | null>>({});   // por countryCode
  readonly municipalityFilter = signal<Record<string, string | null>>({}); // por departmentCode
  readonly neighborhoodFilter = signal<Record<string, string | null>>({}); // por municipalityCode

  // searchFns reactivas (recomputan cuando cambia el padre filtrado)
  readonly countriesSearchFn = this.api.searchFn.countries();
  departmentsSearchFn(countryCode: string)  { return this.api.searchFn.departments(countryCode); }
  municipalitiesSearchFn(countryCode: string, departmentCode: string) {
    return this.api.searchFn.municipalities(countryCode, departmentCode);
  }
  neighborhoodsSearchFn(countryCode: string, departmentCode: string, municipalityCode: string) {
    return this.api.searchFn.neighborhoods(countryCode, departmentCode, municipalityCode);
  }

  // Listas filtradas
  readonly visibleCountries = computed(() => {
    const f = this.countryFilter();
    const all = this.countries();
    return f ? all.filter(c => c.code === f) : all;
  });
  visibleDepartments(countryCode: string): Node[] {
    const all = this.departments()[countryCode] ?? [];
    const f = this.departmentFilter()[countryCode];
    return f ? all.filter(d => d.code === f) : all;
  }
  visibleMunicipalities(departmentCode: string): Node[] {
    const all = this.municipalities()[departmentCode] ?? [];
    const f = this.municipalityFilter()[departmentCode];
    return f ? all.filter(m => m.code === f) : all;
  }
  visibleNeighborhoods(municipalityCode: string): Node[] {
    const all = this.neighborhoods()[municipalityCode] ?? [];
    const f = this.neighborhoodFilter()[municipalityCode];
    return f ? all.filter(n => n.code === f) : all;
  }

  // Setters (recibe la opcion seleccionada del autocomplete o null al limpiar)
  onCountryFilter(opt: AutocompleteOption | null) {
    this.countryFilter.set((opt?.value as string) ?? null);
  }
  onDepartmentFilter(countryCode: string, opt: AutocompleteOption | null) {
    this.departmentFilter.update(s => ({ ...s, [countryCode]: (opt?.value as string) ?? null }));
  }
  onMunicipalityFilter(departmentCode: string, opt: AutocompleteOption | null) {
    this.municipalityFilter.update(s => ({ ...s, [departmentCode]: (opt?.value as string) ?? null }));
  }
  onNeighborhoodFilter(municipalityCode: string, opt: AutocompleteOption | null) {
    this.neighborhoodFilter.update(s => ({ ...s, [municipalityCode]: (opt?.value as string) ?? null }));
  }

  // ----- editor (drawer) -----
  readonly editing = signal<EditorState | null>(null);
  readonly saving = signal(false);
  readonly dirty = signal(false);
  readonly dynForm = viewChild<DynamicFormComponent>('dynForm');
  submitForm() { this.dynForm()?.submit(); }

  readonly editorTitle = computed(() => {
    const e = this.editing();
    if (!e) return '';
    const noun = ({ country: 'país', department: 'departamento', municipality: 'municipio', neighborhood: 'barrio/vereda' })[e.level];
    return `${e.mode === 'create' ? 'Nuevo' : 'Editar'} ${noun}`;
  });

  constructor() { this.refreshCountries(); }

  // =================== CARGA (elastic) ===================

  refreshCountries() {
    this.loadingCountries.set(true);
    this.api.searchCountries('', 0, 500).subscribe({
      next: r => { this.countries.set(r.items.map(h => this.toNode(h, 'country'))); this.loadingCountries.set(false); },
      error: () => this.loadingCountries.set(false),
    });
  }

  loadDepartments(countryCode: string, force = false) {
    if (!force && this.departments()[countryCode]) return;
    this.loadingDepartments.update(s => ({ ...s, [countryCode]: true }));
    this.api.searchDepartments('', countryCode, 0, 500).subscribe({
      next: r => {
        this.departments.update(s => ({ ...s, [countryCode]: r.items.map(h => this.toNode(h, 'department')) }));
        this.loadingDepartments.update(s => ({ ...s, [countryCode]: false }));
      },
      error: () => this.loadingDepartments.update(s => ({ ...s, [countryCode]: false })),
    });
  }

  loadMunicipalities(departmentCode: string, countryCode: string, force = false) {
    if (!force && this.municipalities()[departmentCode]) return;
    this.loadingMunicipalities.update(s => ({ ...s, [departmentCode]: true }));
    this.api.searchMunicipalities('', countryCode, departmentCode, 0, 500).subscribe({
      next: r => {
        this.municipalities.update(s => ({ ...s, [departmentCode]: r.items.map(h => this.toNode(h, 'municipality')) }));
        this.loadingMunicipalities.update(s => ({ ...s, [departmentCode]: false }));
      },
      error: () => this.loadingMunicipalities.update(s => ({ ...s, [departmentCode]: false })),
    });
  }

  loadNeighborhoods(municipalityCode: string, departmentCode: string, countryCode: string, force = false) {
    if (!force && this.neighborhoods()[municipalityCode]) return;
    this.loadingNeighborhoods.update(s => ({ ...s, [municipalityCode]: true }));
    this.api.searchNeighborhoods('', countryCode, departmentCode, municipalityCode, undefined, 0, 500).subscribe({
      next: r => {
        this.neighborhoods.update(s => ({ ...s, [municipalityCode]: r.items.map(h => this.toNode(h, 'neighborhood')) }));
        this.loadingNeighborhoods.update(s => ({ ...s, [municipalityCode]: false }));
      },
      error: () => this.loadingNeighborhoods.update(s => ({ ...s, [municipalityCode]: false })),
    });
  }

  // =================== UI helpers ===================

  isOpen(key: string): boolean { return !!this.openMap()[key]; }
  toggleOpen(key: string) { this.openMap.update(s => ({ ...s, [key]: !s[key] })); }

  toggleCountry(c: Node) {
    const k = `c:${c.code}`;
    this.toggleOpen(k);
    if (this.isOpen(k)) {
      this.loadDepartments(c.code);
    } else {
      // Al colapsar limpia el filtro interno; asi al reabrir se ven todos
      // (el autocomplete dentro del @if se re-monta vacio).
      this.departmentFilter.update(s => ({ ...s, [c.code]: null }));
    }
  }

  toggleDept(d: Node, countryCode: string) {
    const k = `d:${d.code}`;
    this.toggleOpen(k);
    if (this.isOpen(k)) {
      this.loadMunicipalities(d.code, countryCode);
    } else {
      this.municipalityFilter.update(s => ({ ...s, [d.code]: null }));
    }
  }

  toggleMuni(m: Node, departmentCode: string, countryCode: string) {
    const k = `m:${m.code}`;
    this.toggleOpen(k);
    if (this.isOpen(k)) {
      this.loadNeighborhoods(m.code, departmentCode, countryCode);
    } else {
      this.neighborhoodFilter.update(s => ({ ...s, [m.code]: null }));
    }
  }

  private toNode(h: LocationHit, level: Level): Node {
    let id = '', code = '', name = '';
    switch (level) {
      case 'country':       id = h.countryId ?? '';      code = h.countryCode ?? '';      name = h.countryName ?? ''; break;
      case 'department':    id = h.departmentId ?? '';   code = h.departmentCode ?? '';   name = h.departmentName ?? ''; break;
      case 'municipality':  id = h.municipalityId ?? ''; code = h.municipalityCode ?? ''; name = h.municipalityName ?? ''; break;
      case 'neighborhood':  id = h.neighborhoodId ?? ''; code = h.neighborhoodCode ?? ''; name = h.neighborhoodName ?? ''; break;
    }
    const enabled = (h as any).enabled !== false; // si no viene, asumir true
    return { id, code, name, enabled, raw: h };
  }

  // =================== CREATE / EDIT (drawer) ===================

  openCreate(level: Level, parentCodes?: EditorState['parentCodes']) {
    this.dirty.set(false);
    const seed: any = { type: level === 'neighborhood' ? 'BARRIO' : undefined };
    // Pre-rellena ids del padre si los podemos resolver desde los Nodes ya cargados
    if (level === 'department' && parentCodes?.countryCode) {
      seed.countryId = this.countries().find(c => c.code === parentCodes!.countryCode)?.id || '';
    } else if (level === 'municipality' && parentCodes?.departmentCode) {
      const list = this.departments()[parentCodes.countryCode!] ?? [];
      seed.departmentId = list.find(d => d.code === parentCodes!.departmentCode)?.id || '';
    } else if (level === 'neighborhood' && parentCodes?.municipalityCode) {
      const list = this.municipalities()[parentCodes.departmentCode!] ?? [];
      seed.municipalityId = list.find(m => m.code === parentCodes!.municipalityCode)?.id || '';
    }
    this.editing.set({ mode: 'create', level, parentCodes, model: seed });
  }

  /**
   * Para edit necesitamos los campos completos. El search no trae officialName
   * etc., asi que pedimos al system-service por id.
   */
  openEdit(level: Level, node: Node, parentCodes?: EditorState['parentCodes']) {
    if (!node.id) {
      // Sin id no podemos editar (no hibrido elastic-only). Avisa.
      this.toast.error('No se pudo resolver el id del recurso');
      return;
    }
    this.dirty.set(false);
    const fetch$: Observable<any> =
      level === 'country' ? this.api.country(node.id)
      : level === 'department' ? this.api.department(node.id)
      : level === 'municipality' ? this.api.municipality(node.id)
      : this.api.neighborhood(node.id);

    fetch$.subscribe({
      next: full => this.editing.set({ mode: 'edit', level, parentCodes, model: full }),
      error: () => this.toast.error('No se pudo cargar el recurso'),
    });
  }

  closeEditor() { this.editing.set(null); this.dirty.set(false); }

  onSubmit(v: any) {
    const e = this.editing();
    if (!e) return;
    this.saving.set(true);
    const id = e.model?.id as string | undefined;

    this.persist(e.level, id, v).subscribe({
      next: () => {
        this.toast.success('Guardado');
        this.saving.set(false);
        this.closeEditor();
        this.refreshLevel(e.level, e.parentCodes);
      },
      error: () => this.saving.set(false),
    });
  }

  private persist(level: Level, id: string | undefined, v: any): Observable<unknown> {
    switch (level) {
      case 'country': {
        const body: CountryRequest = {
          code: v.code, name: v.name, officialName: v.officialName, isoCode3: v.isoCode3,
          numericCode: v.numericCode, phoneCode: v.phoneCode, currencyCode: v.currencyCode,
          currencySymbol: v.currencySymbol, continent: v.continent,
        };
        return id ? this.api.updateCountry(id, body) : this.api.createCountry(body);
      }
      case 'department': {
        const body: DepartmentRequest = { code: v.code, name: v.name, countryId: v.countryId };
        return id ? this.api.updateDepartment(id, body) : this.api.createDepartment(body);
      }
      case 'municipality': {
        const body: MunicipalityRequest = { code: v.code, name: v.name, departmentId: v.departmentId };
        return id ? this.api.updateMunicipality(id, body) : this.api.createMunicipality(body);
      }
      case 'neighborhood': {
        const body: NeighborhoodRequest = {
          code: v.code, name: v.name, type: v.type as NeighborhoodType, municipalityId: v.municipalityId,
        };
        return id ? this.api.updateNeighborhood(id, body) : this.api.createNeighborhood(body);
      }
    }
  }

  /** Schema dinamico segun nivel. */
  readonly schema = computed<FormSchema>(() => {
    const e = this.editing();
    if (!e) return { fields: [], submit: { show: false } };
    const codeField = { key: 'code', type: 'text' as const, label: 'Código', width: 'half' as const,
      validators: ['required' as const, { kind: 'pattern' as const, value: /^[A-Z0-9_-]+$/, message: 'Solo mayúsculas, números, _ y -' }] };
    const nameField = { key: 'name', type: 'text' as const, label: 'Nombre', width: 'half' as const, validators: ['required' as const] };

    switch (e.level) {
      case 'country': return {
        cols: 12, submit: { show: false },
        fields: [
          codeField, nameField,
          { key: 'officialName', type: 'text', label: 'Nombre oficial', width: 'full' },
          { key: 'isoCode3',     type: 'text', label: 'ISO 3',          width: 'quarter' },
          { key: 'numericCode',  type: 'text', label: 'Numérico',       width: 'quarter' },
          { key: 'phoneCode',    type: 'text', label: 'Tel',            width: 'quarter' },
          { key: 'continent',    type: 'text', label: 'Continente',     width: 'quarter' },
          { key: 'currencyCode', type: 'text', label: 'Moneda',         width: 'half' },
          { key: 'currencySymbol', type: 'text', label: 'Símbolo',      width: 'half' },
        ],
      };
      case 'department': return {
        cols: 12, submit: { show: false },
        fields: [
          codeField, nameField,
          { key: 'countryId', type: 'hidden', defaultValue: e.model?.countryId ?? '' },
        ],
      };
      case 'municipality': return {
        cols: 12, submit: { show: false },
        fields: [
          codeField, nameField,
          { key: 'departmentId', type: 'hidden', defaultValue: e.model?.departmentId ?? '' },
        ],
      };
      case 'neighborhood': return {
        cols: 12, submit: { show: false },
        fields: [
          codeField, nameField,
          { key: 'type', type: 'select', label: 'Tipo', width: 'half', validators: ['required'],
            options: [
              { value: 'BARRIO', label: 'Barrio' },
              { value: 'VEREDA', label: 'Vereda' },
              { value: 'CORREGIMIENTO', label: 'Corregimiento' },
              { value: 'OTRO', label: 'Otro' },
            ] as Option[] },
          { key: 'municipalityId', type: 'hidden', defaultValue: e.model?.municipalityId ?? '' },
        ],
      };
    }
  });

  // =================== TOGGLE / DELETE ===================

  async toggleEnabled(level: Level, node: Node, parentCodes?: EditorState['parentCodes']) {
    if (!node.id) { this.toast.error('Recurso sin id'); return; }
    const next = !node.enabled;
    const fn$ =
      level === 'country' ? this.api.toggleCountryEnabled(node.id, next)
      : level === 'department' ? this.api.toggleDepartmentEnabled(node.id, next)
      : level === 'municipality' ? this.api.toggleMunicipalityEnabled(node.id, next)
      : this.api.toggleNeighborhoodEnabled(node.id, next);
    fn$.subscribe({
      next: () => {
        this.toast.success(next ? 'Habilitado' : 'Inhabilitado');
        this.refreshLevel(level, parentCodes);
      },
    });
  }

  async askDelete(level: Level, node: Node, parentCodes?: EditorState['parentCodes']) {
    if (!node.id) { this.toast.error('Recurso sin id'); return; }
    const ok = await this.confirm.ask({
      title: 'Eliminar',
      message: `¿Eliminar "${node.name}"? Esta acción inhabilita el registro y lo oculta de las búsquedas.`,
      tone: 'danger',
      confirmText: this.i18n.t('common.delete'),
    });
    if (!ok) return;
    const fn$ =
      level === 'country' ? this.api.deleteCountry(node.id)
      : level === 'department' ? this.api.deleteDepartment(node.id)
      : level === 'municipality' ? this.api.deleteMunicipality(node.id)
      : this.api.deleteNeighborhood(node.id);
    fn$.subscribe({
      next: () => { this.toast.success('Eliminado'); this.refreshLevel(level, parentCodes); },
    });
  }

  /** Recarga el nivel afectado (y limpia caches descendientes si aplica). */
  private refreshLevel(level: Level, parents?: EditorState['parentCodes']) {
    switch (level) {
      case 'country':
        this.refreshCountries();
        this.departments.set({});
        this.municipalities.set({});
        this.neighborhoods.set({});
        break;
      case 'department':
        if (parents?.countryCode) this.loadDepartments(parents.countryCode, true);
        this.municipalities.set({});
        this.neighborhoods.set({});
        break;
      case 'municipality':
        if (parents?.departmentCode) this.loadMunicipalities(parents.departmentCode, parents.countryCode!, true);
        this.neighborhoods.set({});
        break;
      case 'neighborhood':
        if (parents?.municipalityCode) this.loadNeighborhoods(parents.municipalityCode, parents.departmentCode!, parents.countryCode!, true);
        break;
    }
  }
}
