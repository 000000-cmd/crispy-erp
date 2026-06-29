import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BrandingService } from '../branding/branding.service';

/** Métodos que mutan estado y, por tanto, generan publicaciones (outbox→Kafka). */
const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Adjunta `X-Business-Id` en las peticiones que mutan estado, cuando hay un
 * negocio en contexto (resuelto por subdominio en {@link BrandingService}).
 *
 * El back lo sella en el evento que publica a Kafka. Que se use o no del lado
 * servidor es decisión del back; el front simplemente lo provee cuando existe.
 * En lecturas (GET) no se envía: no generan publicación.
 */
export const businessInterceptor: HttpInterceptorFn = (req, next) => {
  if (!MUTATING.has(req.method.toUpperCase())) return next(req);

  const businessId = inject(BrandingService).branding()?.businessId;
  if (!businessId) return next(req);

  return next(req.clone({ setHeaders: { 'X-Business-Id': businessId } }));
};
