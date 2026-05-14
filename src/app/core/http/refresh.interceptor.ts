import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

/**
 * Interceptor que maneja el refresh transparente del access token.
 *
 * Flujo:
 *   1. Deja pasar la peticion normal.
 *   2. Si la respuesta es 401:
 *      a. Si la URL es del propio /auth/refresh o /auth/login -> rebota tal cual
 *         (no tiene sentido refrescar para esas).
 *      b. Si no, llama AuthService.refreshAccessToken() (cola compartida via
 *         shareReplay para no disparar 10 refresh paralelos cuando el dashboard
 *         hace 10 fetches simultaneos).
 *      c. Con el nuevo access token, reintenta la peticion original.
 *      d. Si el refresh tambien falla -> handleAuthFailure() limpia la sesion
 *         y navega a /login. La peticion original muere con el error original.
 *
 * Orden esperado en provideHttpClient: [auth, refresh, error].
 *   - auth: pone el Bearer
 *   - refresh: maneja 401 + retry
 *   - error: muestra toasts para los demas errores (4xx/5xx)
 */
export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  // No interceptar las llamadas de auth para evitar loops.
  if (isAuthEndpoint(req.url)) return next(req);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401) return throwError(() => err);

      const auth = inject(AuthService);
      return auth.refreshAccessToken().pipe(
        switchMap(newToken => next(req.clone({
          setHeaders: { Authorization: `Bearer ${newToken}` },
        }))),
        catchError(refreshErr => {
          // Refresh fallo -> sesion muerta.
          auth.handleAuthFailure();
          return throwError(() => err);
        }),
      );
    }),
  );
};

function isAuthEndpoint(url: string): boolean {
  return url.includes('/auth/refresh')
      || url.includes('/auth/login')
      || url.includes('/auth/logout');
}
