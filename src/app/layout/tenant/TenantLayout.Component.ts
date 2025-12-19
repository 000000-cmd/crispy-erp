import { Component } from "@angular/core";
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { HeaderComponent } from "./components/header/header.component";
import { RouterOutlet } from "@angular/router";


@Component({
    selector:'tenant-layout',
    standalone: true,
    imports:[RouterOutlet, SidebarComponent, HeaderComponent],
    template:`
    <div class="flex min-h-screen text-(--text-color) bg-(--bg-light) dark:bg-(--bg-dark)">
        <sidebar></sidebar>
        <div class="flex flex-col flex-1">
            <header-erp></header-erp>
                <main class="main p-8">
                    <router-outlet />
                </main>
        </div>
    </div>
    `

})

export class TenantLayoutComponent{

}