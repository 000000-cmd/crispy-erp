import {  Routes } from "@angular/router";
import { SysLayoutComponent } from "../layout/sys/SysLayout.component";


export const MOON_ROUTES: Routes = [
    {
        path:'',
        component:SysLayoutComponent,
        children:[
            {
                path:'listas',
                loadComponent:() =>
                    import('./listas.component').then(m => m.SysListaComponent)
                
            },
            {
                path:'constantes',
                loadComponent: () =>
                    import('./constantes.component').then(m => m.SysConstantesComponent)
            }
        ]
    }
]