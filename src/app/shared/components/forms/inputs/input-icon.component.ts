  import { Component, Input, forwardRef, Optional, Self} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, AbstractControl, FormGroupDirective, NgControl, FormsModule } from '@angular/forms';
import {BadgeAlert, BadgeCheck, LucideAngularModule, LucideIconData, User} from 'lucide-angular';

import { BaseInputLabel } from '../label-input.component';



@Component({
  selector: 'input-icon',
  standalone: true,
  imports: [LucideAngularModule, FormsModule, BaseInputLabel],
    providers: [


  ],
  template: `
    <div class="flex flex-col gap-2">
        <label-input
        [id]="id"
        [icon]="iconLabel"
        [label]="label"
        [control]="control"
        [tooltipText]="tooltipText"
        [showStateColors]="showStateColors"/>
        

        <div class= "relative">
            <lucide-angular
                [name]="iconInput"
                class="absolute z-3 left-1.5 inset-y-0 my-auto w-5 h-5 text-gray-600"
            />
            <input
                [id]="id"
                [type]="type"
                [placeholder]="placeholder"
                [(ngModel)]="value"
                (input)="onChange($event.target.value)"
                (blur)="onTouched()"
                class=" w-full h-12 pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring min-w-0  p-2.5
                 bg-[#364153]
                transition-all duration-300 hover:bg-white
                focus:border-(--primary-color)  focus:ring-purple-300 backdrop-blur-sm  "
                
            [class.border-red-500]="showStateColors && hasError"
            [class.border-green-500]="showStateColors && !hasError && control?.valid && (control?.touched || control?.dirty)"
            />
        </div>
    </div>
    @if (errorMessage) {
      <span class="text-red-600 text-sm">{{ errorMessage }}</span>
    }
  `
})
export class InputIconComponent implements ControlValueAccessor {
  @Input() id = '';
  @Input() type: string = 'text';
  @Input() placeholder = '';
  @Input() label: string = '';
  @Input() iconLabel?: LucideIconData ;
  @Input() mask? : string
  @Input() helperText? : String
  @Input() tooltipText?: string;
  @Input() iconInput:  LucideIconData = User;
  @Input() showStateColors: Boolean = true;

  readonly defaultIcon = User;

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