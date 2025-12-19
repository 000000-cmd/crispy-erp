import { Routes } from "@angular/router";
import { PlatformLayoutComponent } from "../layout/platform/PlatformLayout.component";


export const PLATFORM_ROUTES: Routes= [

    {
        path:'',
        component:PlatformLayoutComponent,
        children:[
            {
                path:'',
                pathMatch: 'full',
                redirectTo: 'dashboard'
            },
            {
                path:'dashboard',
                loadComponent: () =>
                    import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
            }

        ]
    }
]