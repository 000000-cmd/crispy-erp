import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Router } from '@angular/router';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'tenant' | 'admin' | 'user' | string; // roles extensibles
  token: string;
  refreshToken?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private _user = new BehaviorSubject<UserSession | null>(null);

  user$ = this._user.asObservable();

  constructor(private router: Router) {}

  // -----------------------------
  // LOGIN
  // -----------------------------
  login(email: string, password: string): Observable<UserSession> {
    // Aquí iría tu API real — esto es una maqueta:
    const mockResponse: UserSession = {
      id: '123',
      name: 'Juan Pérez',
      email,
      role: 'tenant',
      token: 'fake-jwt-token',
      refreshToken: 'fake-refresh'
    };

    this._user.next(mockResponse); 
    localStorage.setItem('session', JSON.stringify(mockResponse));

    return of(mockResponse);
  }

  // -----------------------------
  // LOGOUT
  // -----------------------------
  logout() {
    this._user.next(null);
    localStorage.removeItem('session');
    this.router.navigate(['/login']);
  }

  // -----------------------------
  // CARGAR SESIÓN DEL STORAGE
  // -----------------------------
  restoreSession() {
    const data = localStorage.getItem('session');
    if (data) {
      const session: UserSession = JSON.parse(data);
      this._user.next(session);
    }
  }

  // -----------------------------
  // OBTENER USUARIO ACTUAL
  // -----------------------------
  get currentUser(): UserSession | null {
    return this._user.value;
  }

  get isLogged(): boolean {
    return !!this._user.value;
  }

  get role(): string | null {
    return this._user.value?.role ?? null;
  }

  // -----------------------------
  // REFRESH TOKEN (opcional)
  // -----------------------------
  refreshToken(): Observable<boolean> {
    const user = this.currentUser;
    if (!user?.refreshToken) return of(false);

    // Lógica real del refresh aquí
    return of(true);
  }
}
