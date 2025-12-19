import { Component } from "@angular/core";
import { SidebarSysComponent } from "./components/SidebarSys.component";
import { RouterOutlet } from "@angular/router";


@Component({
    selector:'sys-layout',
    standalone: true,
    imports: [RouterOutlet, SidebarSysComponent],
    template:`
    <div class="flex min-h-screen text-(--text-color) bg-(--bg-light) dark:bg-(--bg-dark)">
        <sidebar-sys/>
        <div class="flex flex-col flex-1">
            <main class="main p-8">
                <router-outlet />
            </main>
        </div>
    </div>
    
    `
})

export class SysLayoutComponent{

}