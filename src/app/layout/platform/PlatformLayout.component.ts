import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterModule, RouterOutlet } from "@angular/router";
import { LucideAngularModule, ChartColumn, Package, Calendar, Users, DollarSign, Settings } from 'lucide-angular';


@Component({
    selector:'platform-layout',
    standalone:true,
    imports: [LucideAngularModule, CommonModule, RouterModule,RouterOutlet],
    template:`
    <aside class="w-64 h-screen flex flex-col">

        <div class="w-full h-[77px]  flex items-center justify-center border-b border-gray-300">
            <h1 class="">ERP Platform</h1>
        </div>

        <nav class="mt-5">
            <ul class="flex flex-col gap-2 items-center">
                @for (link of links; track $index) {
                    <li 
                    [routerLink]="link.path"
                    routerLinkActive="active"
                    class="w-52 py-3 flex items-center px-2 rounded-lg gap-2 cursor-pointer 
                    transition-colors duration-200
                    hover:bg-(--hover-bg-light) dark:hover:bg-(--hover-bg-light)/20 "
                    >
                    <lucide-angular [name]="link.icon"></lucide-angular>
                    <span>{{ link.label }}</span>
                    </li>
                }
            </ul>
        </nav>

        <div class="w-full h-[77px] mt-auto flex items-center justify-center border-t border-gray-300">

                <div class="flex items-center gap-3 px-2">
                    <div class="w-9 h-9 bg-linear-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-sm">
                        AD
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm text-black truncate">
                            Admin
                        </p>
                        <p class="text-xs text-gray-500 truncate">
                            admin@empresa.com
                        </p>
                    </div>
                </div>

        </div>


    </aside>

            <div class="flex flex-col flex-1">

                <main class="main p-8 bg-(--bg-light)  overflow-y-auto">
                    <router-outlet />
                </main>
        </div>
    `,

    host:{
        class: 'flex'
    }
})

export class PlatformLayoutComponent{

    readonly links = [
    { label: 'Dashboard',       path: '/tenant/estadistica', icon: ChartColumn },
    { label: 'Módulos ERM',     path: '/tenant/inventario',  icon: Package },
    { label: 'Usuarios',        path: '/tenant/citas',       icon: Calendar },
    { label: 'Actividad',       path: '/tenant/empleados',   icon: Users },
    { label: 'Facturación',     path: '/tenant/nomina',      icon: DollarSign},
    { label: 'Configuración',   path: '/tenant/config',      icon: Settings },
    { label: 'Soporte',         path: '/tenant/config',      icon: Settings },

  ];

}