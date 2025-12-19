import { Component, Input, forwardRef, Optional, Self} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, AbstractControl, FormGroupDirective, NgControl, FormsModule } from '@angular/forms';
import {BadgeAlert, BadgeCheck, LucideAngularModule, LucideIconData, User} from 'lucide-angular';

import { BaseInputLabel } from '../label-input.component';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'input-clean',
  standalone: true,
  imports: [LucideAngularModule, FormsModule, BaseInputLabel, CommonModule],
    providers: [


  ],
  template: `
    <div class="flex flex-col gap-2">
      @if(iconLabel || label){
      <label-input
        [id]="id"
        [icon]="iconLabel"
        [label]="label"
        [control]="control"
        [tooltipText]="tooltipText"
        [showStateColors]="showStateColors"/>
        }

      <div class="relative">

        @if(iconInput){
          <lucide-angular
              [name]="iconInput"
              class="absolute z-3 left-1.5 inset-y-0 my-auto w-5 h-5 text-gray-600 dark:text-gray-400"
          />
        }
        <input
          [id]="id"
          [type]="type"
          [placeholder]="placeholder"
          [(ngModel)]="value"
          (input)="onChange($event.target.value)"
          (blur)="onTouched()"
          
          class="rounded-md p-2.5 w-full min-w-0 h-10 transition-all duration-300
                focus:ring-2 focus:ring-purple-300 focus:outline-none"

          [ngStyle]="{
            width: widthInput || null
          }"
          
          [ngClass]="{
            'pl-9': iconInput,
            
            ' bg-white dark:bg-[#364153] border-2 border-slate-400 backdrop-blur-sm hover:bg-white dark:hover:bg-[#303a4b] focus:border-(--primary-color)':
              variant === 'outlined',

            
            'bg-white/50 dark:bg-gray-700/85 border border-transparent focus:border-(--primary-color)':
              variant === 'filled',

            
            'border-red-500': showStateColors && hasError,
            'border-green-500':
              showStateColors && !hasError && control?.valid && (control?.touched || control?.dirty)
          }"
        />
      </div>
    </div>
    @if (errorMessage) {
      <span class="text-red-600 text-sm">{{ errorMessage }}</span>
    }
  `
})
export class InputCleanComponent implements ControlValueAccessor {
  @Input() id = '';
  @Input() type: string = 'text';
  @Input() placeholder = '';
  @Input() label: string = '';
  @Input() iconLabel?: LucideIconData;
  @Input() widthInput?: string; 
  @Input() mask? : string
  @Input() helperText? : String;
  @Input() tooltipText?: string;
  @Input() showStateColors: Boolean = true;
  @Input() iconInput?:  LucideIconData;
  @Input() variant: 'outlined' | 'filled' = 'outlined';

  readonly validIcon = BadgeCheck;
  readonly invalidIcon = BadgeAlert;

  constructor(@Optional() @Self() public ngControl: NgControl) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get control(): AbstractControl | null {
    return this.ngControl?.control ?? null;
  }

  get hasError(): boolean {
    return !!this.control?.invalid && (this.control?.touched || this.control?.dirty);
  }

  get errorMessage(): string | null {
    if (this.hasError && this.control?.errors?.['customError']) {
      return this.control.errors['customError'];
    }
    return null;
  }

  value!: string;

  onChange = (value: string) => {};
  onTouched = () => {};

  writeValue(obj: any): void {
    this.value = obj ?? '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  validate(_: any) {
  return null; // puedes extender con reglas custom
  }
}