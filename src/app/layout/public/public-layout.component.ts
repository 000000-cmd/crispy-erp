import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ThemeService } from "../../shared/theme.service";


@Component({
    selector:'public-layout',
    standalone: true,
    imports:[RouterOutlet],
    template:`
    <div class="flex min-h-screen items-center justify-center text-(--text-color) bg-(--bg-light) dark:bg-(--bg-dark)">
      <main class="w-full max-w-sm p-8">
        <router-outlet />
      </main>
    </div>

    `
})

export class PublicLayoutComponent{
  constructor(public themeService: ThemeService) {}
}