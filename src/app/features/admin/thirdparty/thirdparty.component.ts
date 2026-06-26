import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { LucideAngularModule, Pencil, Plus, Trash2 } from 'lucide-angular';

import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { DrawerComponent } from '../../../shared/ui/drawer/drawer.component';
import { DynamicFormComponent } from '../../../shared/forms/dynamic-form.component';
import { TPipe } from '../../../shared/pipes/t.pipe';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { I18nService } from '../../../core/i18n/i18n.service';

import {
  ColumnDef,
  DataTableComponent,
  RowAction
} from '../../../shared/table/data-table.component';

import {
  ThirdParty,
  ThirdPartyApi
} from './thirdparty.api';

import { SystemListsApi } from '../system-lists/system-lists.api';
import { buildThirdPartySchema } from './thirdparty-form';

@Component({
  selector: 'app-admin-third-parties',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    ButtonComponent,
    DrawerComponent,
    DataTableComponent,
    DynamicFormComponent,
    TPipe
  ],
  templateUrl: './thirdparty.component.html'
})
export class ThirdPartyComponent {

  private readonly api = inject(ThirdPartyApi);
  private readonly systemListsApi = inject(SystemListsApi);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);

  protected readonly plusIcon = Plus;

  readonly thirdParties = signal<ThirdParty[]>([]);

  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly editing = signal<Partial<ThirdParty> | null>(null);

  readonly dirty = signal(false);

  readonly dynForm =
    viewChild<DynamicFormComponent>('dynForm');

  submitForm() {
    this.dynForm()?.submit();
  }

  readonly schema = computed(() => {

    const editing = this.editing();

    if (!editing) {
      return null;
    }

    const schema = buildThirdPartySchema(
      this.systemListsApi,
      editing.id ? 'edit' : 'create'
    );

    return {
      ...schema,
      submit: {
        ...(schema.submit ?? {}),
        show: false
      }
    };

  });

  readonly columns = computed<ColumnDef<ThirdParty>[]>(() => {

    void this.i18n.dict();

    return [

      {
        key: 'documentNumber',
        label: 'Documento',
        width: '150px'
      },

      {
        key: 'type',
        label: 'Tipo',
        width: '120px'
      },

      {
        key: 'fullName' as any,
        label: 'Nombre',
        format: row => {

          if (row.type === 'COMPANY') {
            return row.businessName ?? '—';
          }

          return [
            row.firstName,
            row.secondName,
            row.firstLastName,
            row.secondLastName
          ]
            .filter(Boolean)
            .join(' ');

        }
      },

      {
        key: 'email',
        label: 'Correo'
      },

      {
        key: 'phone',
        label: 'Teléfono'
      },

      {
        key: 'active',
        label: 'Estado',
        align: 'center',
        format: r =>
          r.active
            ? this.i18n.t('common.active')
            : this.i18n.t('common.inactive')
      }

    ];

  });

  readonly actions = computed<RowAction<ThirdParty>[]>(() => {

    void this.i18n.dict();

    return [

      {
        icon: Pencil,
        label: this.i18n.t('common.edit'),
        tone: 'primary',
        onClick: row => this.openEdit(row)
      },

      {
        icon: Trash2,
        label: this.i18n.t('common.delete'),
        tone: 'danger',
        onClick: row => this.askDelete(row)
      }

    ];

  });

  constructor() {
    this.refresh();
  }

  refresh() {

    this.loading.set(true);

    this.api.list().subscribe({

      next: items => {

        this.thirdParties.set(items);

        this.loading.set(false);

      },

      error: () => this.loading.set(false)

    });

  }

  openCreate() {

    this.dirty.set(false);

    this.editing.set({

      type: 'PERSON',

      active: true

    });

  }

  openEdit(item: ThirdParty) {

    this.dirty.set(false);

    this.editing.set({

      ...item

    });

  }

  close() {

    this.editing.set(null);

    this.dirty.set(false);

  }

  onSubmit(value: any) {

    const editing = this.editing();

    if (!editing) {
      return;
    }

    this.saving.set(true);

    if (!editing.id) {

      this.api.create({

        type: value.type,

        documentTypeId: value.documentTypeId,

        documentNumber: value.documentNumber,

        firstName: value.firstName,

        secondName: value.secondName,

        firstLastName: value.firstLastName,

        secondLastName: value.secondLastName,

        businessName: value.businessName,

        tradeName: value.tradeName,

        email: value.email,

        phone: value.phone,

        active: value.active

      }).subscribe({

        next: () => {

          this.toast.success('Tercero creado correctamente');

          this.saving.set(false);

          this.close();

          this.refresh();

        },

        error: () => this.saving.set(false)

      });

    } else {

      this.api.update(editing.id, {

        type: value.type,

        documentTypeId: value.documentTypeId,

        documentNumber: value.documentNumber,

        firstName: value.firstName,

        secondName: value.secondName,

        firstLastName: value.firstLastName,

        secondLastName: value.secondLastName,

        businessName: value.businessName,

        tradeName: value.tradeName,

        email: value.email,

        phone: value.phone,

        active: value.active

      }).subscribe({

        next: () => {

          this.toast.success('Tercero actualizado correctamente');

          this.saving.set(false);

          this.close();

          this.refresh();

        },

        error: () => this.saving.set(false)

      });

    }

  }

  async askDelete(item: ThirdParty) {

    const ok = await this.confirm.ask({

      title: 'Eliminar tercero',

      message:
        `¿Desea eliminar el tercero "${item.documentNumber}"?`,

      confirmText: this.i18n.t('common.delete'),

      tone: 'danger'

    });

    if (!ok) {
      return;
    }

    this.api.remove(item.id).subscribe({

      next: () => {

        this.toast.success('Tercero eliminado correctamente');

        this.refresh();

      }

    });

  }

}