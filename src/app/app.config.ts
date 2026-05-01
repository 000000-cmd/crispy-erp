import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withPreloading } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/http/auth.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // `withPreloading(PreloadAllModules)` baja en background todos los chunks
    // lazy declarados con `loadComponent`/`loadChildren` apenas el bundle
    // principal arranca. Asi, al hacer click en un item del menu por primera
    // vez no hay download de chunk: el cambio de pantalla es inmediato y el
    // page se monta con su propio estado de loading (signals + skeleton del
    // data-table) sin congelar la UI.
    provideRouter(routes, withComponentInputBinding(), withPreloading(PreloadAllModules)),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, errorInterceptor])),
  ],
};
