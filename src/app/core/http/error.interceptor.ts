import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenStorage } from '../auth/token.storage';
import { ToastService } from '../../shared/ui/toast/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const storage = inject(TokenStorage);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        storage.clear();
        router.navigate(['/login']);
      } else if (err.status === 403) {
        toast.error('No tienes permisos para esta acción');
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
