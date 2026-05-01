import { CommonModule } from '@angular/common';
import {
  Component, EnvironmentInjector, Injector, OnDestroy, OnInit,
  computed, effect, inject, input, output, signal,
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Subscription, isObservable, Observable, from, of } from 'rxjs';
import { ButtonComponent } from '../ui/button/button.component';
import { TPipe } from '../pipes/t.pipe';
import { FieldConfig, FormSchema, Option, OptionsSource } from './core/types';
import { buildValidators } from './core/validators';

import { TextFieldComponent } from './fields/text-field.component';
import { SelectFieldComponent } from './fields/select-field.component';
import { RadioFieldComponent } from './fields/radio-field.component';
import { CheckboxGroupFieldComponent } from './fields/checkbox-group-field.component';
import { CheckboxFieldComponent } from './fields/checkbox-field.component';
import { SwitchFieldComponent } from './fields/switch-field.component';
import { FileFieldComponent } from './fields/file-field.component';
import { FieldLabelComponent } from './fields/field-label.component';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, ButtonComponent, TPipe,
    TextFieldComponent, SelectFieldComponent, RadioFieldComponent,
    CheckboxGroupFieldComponent, CheckboxFieldComponent, SwitchFieldComponent, FileFieldComponent,
    FieldLabelComponent,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" (focusout)="onFocusOut($event)" class="grid gap-4" [style.gridTemplateColumns]="gridCols()">
      @for (f of visibleFields(); track f.key) {
        <div [attr.data-field]="f.key" [style.gridColumn]="span(f)">
          @if (showLabel(f)) {
            <df-field-label
              [forId]="f.key"
              [label]="f.label || ''"
              [required]="isRequired(f)"
              [icon]="f.icon"
              [tooltip]="f.tooltip"
              [tooltipVariant]="f.tooltipVariant ?? 'info'"
              [control]="form.get(f.key)"
            />
          }

          @switch (f.type) {
            @case ('select')        { <df-select-field [field]="f" [control]="form.get(f.key)!" [options]="optionsFor(f)" [hint]="hintFor(f)" /> }
            @case ('multiselect')   { <df-select-field [field]="f" [control]="form.get(f.key)!" [options]="optionsFor(f)" [hint]="hintFor(f)" /> }
            @case ('radio')         { <df-radio-field  [field]="f" [control]="form.get(f.key)!" [options]="optionsFor(f)" [hint]="hintFor(f)" /> }
            @case ('checkbox-group'){ <df-checkbox-group-field [field]="f" [control]="form.get(f.key)!" [options]="optionsFor(f)" [hint]="hintFor(f)" /> }
            @case ('checkbox')      { <df-checkbox-field [field]="f" [control]="form.get(f.key)!" [hint]="hintFor(f)" /> }
            @case ('switch')        { <df-switch-field [field]="f" [control]="form.get(f.key)!" [hint]="hintFor(f)" /> }
            @case ('file')          { <df-file-field [field]="f" [control]="form.get(f.key)!" [hint]="hintFor(f)" /> }
            @case ('hidden')        { }
            @case ('custom')        { <ng-container *ngComponentOutlet="f.customComponent!; inputs: { field: f, control: form.get(f.key)! }"></ng-container> }
            @default                { <df-text-field [field]="f" [control]="form.get(f.key)!" [hint]="hintFor(f)" /> }
          }
        </div>
      }

      @if (showSubmit()) {
        <div [style.gridColumn]="'span ' + (schema().cols ?? 12)">
          <app-button type="submit" [loading]="submitting()" [disabled]="form.invalid">
            {{ schema().submit?.label || ('common.save' | t) }}
          </app-button>
        </div>
      }
    </form>
  `,
})
export class DynamicFormComponent implements OnInit, OnDestroy {
  readonly schema = input.required<FormSchema>();
  readonly model = input<Record<string, any>>({});
  readonly submitting = input<boolean>(false);

  readonly submitValue = output<Record<string, any>>();
  readonly valueChange = output<Record<string, any>>();

  readonly form = new FormGroup({});

  private readonly injector = inject(EnvironmentInjector);
  private readonly subs: Subscription[] = [];
  private readonly resolvedOptions = signal<Record<string, Option[]>>({});
  private readonly resolvedHints = signal<Record<string, string>>({});

  readonly visibleFields = signal<FieldConfig[]>([]);

  readonly gridCols = computed(() => {
    const c = this.schema().cols ?? 12;
    return `repeat(${c}, minmax(0, 1fr))`;
  });

  ngOnInit(): void {
    this.buildForm();

    this.subs.push(this.form.valueChanges.subscribe(v => {
      this.recomputeVisibility();
      this.recomputeDisabled();
      this.recomputeRequired();
      this.recomputeHints();
      this.valueChange.emit(v as any);
    }));

    this.recomputeVisibility();
    this.recomputeDisabled();
    this.recomputeRequired();
    this.recomputeHints();

    for (const f of this.schema().fields) {
      this.resolveOptions(f);
      const ctx = this.makeCtx(f);
      f.hooks?.onInit?.(ctx);
    }
  }

  ngOnDestroy(): void {
    for (const s of this.subs) s.unsubscribe();
  }

  showSubmit(): boolean {
    const s = this.schema().submit;
    return s?.show !== false;
  }

  span(f: FieldConfig): string {
    const cols = this.schema().cols ?? 12;
    if (typeof f.width === 'number') return `span ${f.width}`;
    const w = f.width ?? 'full';
    const map = { full: cols, half: cols / 2, third: cols / 3, quarter: cols / 4 } as const;
    return `span ${Math.max(1, Math.round(map[w]))}`;
  }

  showLabel(f: FieldConfig): boolean {
    return !!f.label && !['checkbox', 'switch'].includes(f.type);
  }

  isRequired(f: FieldConfig): boolean {
    const c = this.form.get(f.key);
    if (!c) return false;
    return c.hasValidator(Validators.required) || (f.requiredWhen ? f.requiredWhen(this.form) : false);
  }

  optionsFor(f: FieldConfig): Option[] {
    return this.resolvedOptions()[f.key] ?? (Array.isArray(f.options) ? f.options : []);
  }

  /**
   * Hint resuelto para el campo. Si `hint` es funcion, se evaluo en la ultima
   * recomputacion (ngOnInit + cada valueChanges). Si es string, se devuelve tal
   * cual. Cadena vacia/null/undefined deja al field sin hint.
   */
  hintFor(f: FieldConfig): string {
    return this.resolvedHints()[f.key] ?? '';
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitValue.emit(this.form.getRawValue());
  }

  onFocusOut(ev: FocusEvent) {
    const wrapper = (ev.target as HTMLElement)?.closest('[data-field]');
    if (!wrapper) return;
    const next = ev.relatedTarget as HTMLElement | null;
    if (next && wrapper.contains(next)) return; // still inside the same field
    const key = wrapper.getAttribute('data-field')!;
    const f = this.schema().fields.find(x => x.key === key);
    if (!f?.hooks?.onBlur) return;
    f.hooks.onBlur(this.form.get(key)?.value, this.makeCtx(f));
  }

  // ---------- internals ----------

  private buildForm() {
    for (const f of this.schema().fields) {
      const validators: ValidatorFn[] = buildValidators(f.validators);
      const ctrl = new FormControl(
        { value: this.model()[f.key] ?? f.defaultValue ?? this.defaultFor(f), disabled: !!f.disabled },
        { validators },
      );
      this.form.addControl(f.key, ctrl);

      if (f.hooks?.onChange) {
        const sub = ctrl.valueChanges.subscribe(v => f.hooks!.onChange!(v, this.makeCtx(f)));
        this.subs.push(sub);
      }
      // onBlur is wired via host (focusout) → onFocusOut().
    }
  }

  private defaultFor(f: FieldConfig): any {
    if (f.type === 'checkbox-group' && f.multiple !== false) return [];
    if (f.type === 'multiselect') return [];
    if (f.type === 'switch' || f.type === 'checkbox') return false;
    return null;
  }

  private recomputeVisibility() {
    const next: FieldConfig[] = [];
    for (const f of this.schema().fields) {
      const visible = f.visibleWhen ? f.visibleWhen(this.form) : true;
      const ctrl = this.form.get(f.key);
      if (visible) {
        next.push(f);
        ctrl?.enable({ emitEvent: false });
      } else {
        ctrl?.disable({ emitEvent: false });
      }
    }
    this.visibleFields.set(next);
  }

  private recomputeDisabled() {
    for (const f of this.schema().fields) {
      const c = this.form.get(f.key);
      if (!c) continue;
      const should = f.disabled || (f.disabledWhen?.(this.form) ?? false);
      if (should && c.enabled) c.disable({ emitEvent: false });
      else if (!should && c.disabled && (f.visibleWhen?.(this.form) ?? true)) c.enable({ emitEvent: false });
    }
  }

  private recomputeHints() {
    const next: Record<string, string> = {};
    for (const f of this.schema().fields) {
      const h = f.hint;
      if (typeof h === 'function') {
        const ctrl = this.form.get(f.key);
        if (!ctrl) continue;
        const out = h({ form: this.form, control: ctrl, value: ctrl.value });
        if (out) next[f.key] = out;
      } else if (typeof h === 'string' && h.length > 0) {
        next[f.key] = h;
      }
    }
    this.resolvedHints.set(next);
  }

  private recomputeRequired() {
    for (const f of this.schema().fields) {
      const c = this.form.get(f.key);
      if (!c) continue;
      const dynamic = f.requiredWhen?.(this.form) ?? false;
      const baseValidators = buildValidators(f.validators);
      const final = dynamic && !baseValidators.some(v => v === Validators.required) ? [...baseValidators, Validators.required] : baseValidators;
      c.setValidators(final);
      c.updateValueAndValidity({ emitEvent: false });
    }
  }

  private resolveOptions(f: FieldConfig) {
    const src = f.options;
    if (!src) return;
    if (Array.isArray(src)) {
      this.resolvedOptions.update(o => ({ ...o, [f.key]: src }));
      return;
    }
    const ctx = this.makeCtx(f);
    const out = (src as any)(ctx);
    const obs: Observable<Option[]> = isObservable(out) ? out : (out instanceof Promise ? from(out) : of(out));
    const sub = obs.subscribe(opts => {
      this.resolvedOptions.update(o => ({ ...o, [f.key]: opts }));
    });
    this.subs.push(sub);
  }

  private makeCtx(f: FieldConfig) {
    return {
      form: this.form,
      control: this.form.get(f.key)!,
      field: f,
      injector: this.injector,
      get value() { return this.control.value; },
      setValue: (key: string, val: any) => this.form.get(key)?.setValue(val),
      patch: (p: Record<string, any>) => this.form.patchValue(p),
    };
  }
}
