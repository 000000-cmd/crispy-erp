import { Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <span
      class="inline-block border-2 border-current border-t-transparent rounded-full animate-spin"
      [style.width.px]="size()"
      [style.height.px]="size()"
    ></span>
  `,
})
export class SpinnerComponent {
  readonly size = input<number>(16);
}
