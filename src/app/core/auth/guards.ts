import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { UserKind } from './auth.types';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  router.navigate(['/login']);
  return false;
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) return true;
  router.navigateByUrl(auth.homeRoute());
  return false;
};

export const kindGuard = (kind: UserKind): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) { router.navigate(['/login']); return false; }
  if (auth.kind() === kind) return true;
  router.navigateByUrl(auth.homeRoute());
  return false;
};

export const roleGuard = (...roles: string[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) { router.navigate(['/login']); return false; }
  if (roles.some(r => auth.hasRole(r))) return true;
  router.navigateByUrl(auth.homeRoute());
  return false;
};

/**
 * Gate del onboarding. "Crear negocio" deja de ser una funcionalidad permanente
 * y pasa a ser un gate de primera vez:
 *  - `requiresBusiness`: rutas operativas del tenant exigen tener negocio; si no,
 *    mandan al onboarding.
 *  - `onboardingGate`: si el dueño ya tiene negocio, el onboarding deja de existir
 *    como opción y redirige al dashboard.
 */
export const requiresBusiness: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.user()?.businessId ? true : router.createUrlTree(['/tenant/onboarding']);
};

export const onboardingGate: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.user()?.businessId ? router.createUrlTree(['/tenant/dashboard']) : true;
};
