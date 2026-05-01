import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { ApiService } from '../http/api.service';
import { MICROSERVICES, ms } from '../http/microservices';
import { AuthUser, LoginRequest, LoginResponse, UserKind, UserResponse } from './auth.types';
import { TokenStorage } from './token.storage';


/**
 * Roles que identifican a un usuario como administrador del sistema (no
 * relacionado a ningun tenant). Cualquier otro rol cae en TENANT_USER.
 * Mantener sincronizado con la siembra de roles del back.
 */
const SYSTEM_ADMIN_ROLES = new Set(['ADMIN', 'SUPER_ADMIN', 'SYSTEM_ADMIN']);

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly storage = inject(TokenStorage);
  private readonly router = inject(Router);

  private readonly _user = signal<AuthUser | null>(this.storage.getUser<AuthUser>());

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user() && !!this.storage.getAccess());
  readonly kind = computed<UserKind | null>(() => this._user()?.kind ?? null);
  readonly hasRole = (role: string) => (this._user()?.roles ?? []).includes(role);

  login(req: LoginRequest): Observable<AuthUser> {
    return this.api.post<LoginResponse>(ms(MICROSERVICES.AUTH, 'login'), req).pipe(
      tap(res => {
        this.storage.setAccess(res.tokens.accessToken);
        if (res.tokens.refreshToken) this.storage.setRefresh(res.tokens.refreshToken);
        const u = this.toAuthUser(res.user);
        this.storage.setUser(u);
        this._user.set(u);
      }),
      map(res => this.toAuthUser(res.user)),
    );
  }

  refreshMe(): Observable<AuthUser> {
    return this.api.get<UserResponse>(ms(MICROSERVICES.AUTH, 'users/me')).pipe(
      map(u => this.toAuthUser(u)),
      tap(u => { this.storage.setUser(u); this._user.set(u); }),
    );
  }

  logout(): void {
    // Best-effort: notificar al back; el storage se limpia siempre.
    const refreshToken = this.storage.getRefresh() ?? undefined;
    this.api.post(ms(MICROSERVICES.AUTH, 'logout'), { refreshToken }).subscribe({
      next: () => this.finishLogout(),
      error: () => this.finishLogout(),
    });
  }

  private finishLogout() {
    this.storage.clear();
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  /** Donde mandar a un usuario recien autenticado. */
  homeRoute(): string {
    const u = this._user();
    if (!u) return '/login';
    return u.kind === 'SYSTEM_ADMIN' ? '/admin' : '/tenant';
  }

  private toAuthUser(u: UserResponse): AuthUser {
    const roles = Array.from(u.roleCodes ?? []);
    const kind: UserKind = roles.some(r => SYSTEM_ADMIN_ROLES.has(r)) ? 'SYSTEM_ADMIN' : 'TENANT_USER';
    return {
      id: u.id,
      email: u.email,
      username: u.username,
      fullName: u.fullName ?? ([u.firstName, u.lastName].filter(Boolean).join(' ') || undefined),
      roles,
      kind,
      theme: u.theme,
      languageCode: u.languageCode,
    };
  }
}
