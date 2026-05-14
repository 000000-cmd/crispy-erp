import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withPreloading } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/http/auth.interceptor';
import { refreshInterceptor } from './core/http/refresh.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';
import { AuthService } from './core/auth/auth.service';

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

    // Orden importante:
    //  1. authInterceptor    -> agrega Bearer
    //  2. refreshInterceptor -> intercepta 401, refresca y reintenta
    //  3. errorInterceptor   -> toasts para errores no-auth
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, refreshInterceptor, errorInterceptor]),
    ),

    // Hidratacion de sesion en el arranque. Si en localStorage hay un token
    // pero ya esta expirado o el back lo invalido, el initializer lo detecta
    // (via /users/me) ANTES de que el router monte el admin layout. Asi nunca
    // pintamos /admin con sesion stale; el guard manda directo a /login.
    provideAppInitializer(() => {
      const auth = inject(AuthService);
      return auth.tryRestoreSession();
    }),
  ],
};
