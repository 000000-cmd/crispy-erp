import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, firstValueFrom, map, of, shareReplay, tap, throwError } from 'rxjs';
import { ApiService } from '../http/api.service';
import { MICROSERVICES, ms } from '../http/microservices';
import { AuthUser, LoginRequest, LoginResponse, TokenPairResponse, UserKind, UserResponse } from './auth.types';
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

  private readonly _permissions = signal<string[]>([]);
  readonly permissions = this._permissions.asReadonly();
  readonly hasPermission = (code: string) => this._permissions().includes(code);

  /** Carga los permisos efectivos del usuario (segun sus roles) desde system-service. */
  loadPermissions(): void {
    this.api.get<string[]>(ms(MICROSERVICES.SYSTEM, 'permissions/me')).pipe(
      catchError(() => of([] as string[])),
    ).subscribe(p => this._permissions.set(p ?? []));
  }

  login(req: LoginRequest): Observable<AuthUser> {
    return this.api.post<LoginResponse>(ms(MICROSERVICES.AUTH, 'login'), req).pipe(
      tap(res => this.establishSession(res)),
      map(res => this.toAuthUser(res.user)),
    );
  }

  /**
   * Alta self-service de un dueño + su negocio. El back crea la cuenta con rol
   * OWNER y devuelve los mismos tokens del login, así que dejamos la sesión
   * establecida y el usuario entra directo a su panel.
   */
  registerOwner(req: unknown): Observable<AuthUser> {
    return this.api.post<LoginResponse>(ms(MICROSERVICES.AUTH, 'register-owner'), req).pipe(
      tap(res => this.establishSession(res)),
      map(res => this.toAuthUser(res.user)),
    );
  }

  /** Persiste tokens + usuario y carga permisos tras un login/registro exitoso. */
  private establishSession(res: LoginResponse): void {
    this.storage.setAccess(res.tokens.accessToken);
    if (res.tokens.refreshToken) this.storage.setRefresh(res.tokens.refreshToken);
    const u = this.toAuthUser(res.user);
    this.storage.setUser(u);
    this._user.set(u);
    this.loadPermissions();
  }

  refreshMe(): Observable<AuthUser> {
    return this.api.get<UserResponse>(ms(MICROSERVICES.AUTH, 'users/me')).pipe(
      map(u => this.toAuthUser(u)),
      tap(u => { this.storage.setUser(u); this._user.set(u); this.loadPermissions(); }),
    );
  }

  // ---------------- Refresh tokens (cola compartida) ----------------

  /**
   * Refresh in-flight compartido. Si varias peticiones reciben 401 a la vez,
   * todas suscriben al MISMO observable. El primero dispara el POST /auth/refresh,
   * los demas reusan el resultado via shareReplay(1). Cuando termina, se limpia
   * el slot para permitir un siguiente ciclo.
   */
  private refreshing$: Observable<string> | null = null;

  refreshAccessToken(): Observable<string> {
    if (this.refreshing$) return this.refreshing$;

    const refreshToken = this.storage.getRefresh();
    if (!refreshToken) return throwError(() => new Error('No refresh token'));

    this.refreshing$ = this.api.post<TokenPairResponse>(
      ms(MICROSERVICES.AUTH, 'refresh'),
      { refreshToken },
    ).pipe(
      tap(tok => {
        this.storage.setAccess(tok.accessToken);
        if (tok.refreshToken) this.storage.setRefresh(tok.refreshToken);
      }),
      map(tok => tok.accessToken),
      shareReplay(1),
      finalize(() => { this.refreshing$ = null; }),
    );
    return this.refreshing$;
  }

  /**
   * Limpia la sesion del cliente (storage + signal + UI) y navega a /login.
   * Llamado por el refresh interceptor cuando el refresh token tampoco sirve,
   * y por logout().
   */
  handleAuthFailure(navigate = true) {
    this.storage.clear();
    this._user.set(null);
    this._permissions.set([]);
    if (navigate) this.router.navigate(['/login']);
  }

  /**
   * Hidrata el estado de auth en el arranque de la app. Si hay access token,
   * lo valida llamando GET /users/me. Si la llamada falla (incluso despues de
   * intentar refresh — el interceptor se encarga), limpia y deja al guard
   * mandar a /login. Asi NUNCA pintamos /admin con sesion stale.
   */
  async tryRestoreSession(): Promise<void> {
    if (!this.storage.getAccess()) {
      this.storage.clear();      // limpia user stale por si quedo
      this._user.set(null);
      return;
    }
    try {
      await firstValueFrom(this.refreshMe());
    } catch {
      // El interceptor de refresh ya hizo handleAuthFailure si fue 401.
      // Aqui forzamos el clean por cualquier otro error.
      this.handleAuthFailure(false);
    }
  }

  logout(): void {
    // Best-effort: notificar al back; el storage se limpia siempre.
    const refreshToken = this.storage.getRefresh() ?? undefined;
    this.api.post(ms(MICROSERVICES.AUTH, 'logout'), { refreshToken }).pipe(
      catchError(() => of(null)),
    ).subscribe(() => this.handleAuthFailure());
  }

  /** Donde mandar a un usuario recien autenticado. */
  homeRoute(): string {
    const u = this._user();
    if (!u) return '/login';
    // Admin del sistema -> /admin (su propia área). Resto (dueños) -> /tenant.
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
