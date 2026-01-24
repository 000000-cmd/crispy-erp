import { Component, signal } from "@angular/core";
import { SidebarSysComponent } from "./components/SidebarSys.component";
import { Router, RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common";
import { SysSection } from "./components/SidebarSys.component";
import { SysListaComponent } from "../../moon/listas.component";
import { ThemeService } from "../../shared/theme.service";


@Component({
    selector:'sys-layout',
    standalone: true,
    imports: [SidebarSysComponent, CommonModule, SysListaComponent, RouterOutlet],
    template:`
    <div class="flex min-h-screen text-(--text-color) bg-(--bg-light) dark:bg-(--bg-dark)">
        <sidebar-sys
        (pathChange)="onPathChange($event)"

        />
        <div class="flex flex-col flex-1 bg-[#232433]">
            <main class="main p-8  ">
                <router-outlet/>
            </main>
        </div>
    </div>
    
    `
})


export class SysLayoutComponent{
constructor(public themeService: ThemeService, private router: Router) {}


    onPathChange(path: string) {
        console.log('Ruta recibida:', path);
        this.router.navigate([path]);
    }

}