import { Component } from "@angular/core";

@Component({
  selector: 'text-link',
  template: `
    <a class="text-sm text-blue-500 hover:underline cursor-pointer">
      <ng-content></ng-content>
    </a>
  `,
  standalone: true
})
export class TextLinkComponent {}
