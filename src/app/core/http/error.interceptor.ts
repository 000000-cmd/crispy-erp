import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/ui/toast/toast.service';

/**
 * Interceptor de errores HTTP. Muestra toasts de feedback. NO toca 401 — eso
 * lo maneja `refreshInterceptor` que reintenta con refresh token y, solo si
 * el refresh tambien falla, limpia la sesion y manda al login.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        // Manejado por refreshInterceptor. Si llegamos aqui significa que el
        // refresh ya intento y fallo, o es un endpoint de auth. No molestar
        // al usuario con un toast — la pantalla de login es feedback suficiente.
      } else if (err.status === 403) {
        toast.error('No tienes permisos para esta acción');
      } else if (err.status === 0) {
        toast.error('No se pudo contactar al servidor.');
      } else if (err.status >= 500) {
        toast.error('Error del servidor. Intenta más tarde.');
      } else {
        const msg = err.error?.message ?? err.message ?? 'Ocurrió un error';
        toast.error(msg);
      }
      return throwError(() => err);
    }),
  );
};
