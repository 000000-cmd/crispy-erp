import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environments';
import { ApiResponse } from './api-response';

type Params = Record<string, string | number | boolean | null | undefined>;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl.replace(/\/$/, '');

  get<T>(path: string, params?: Params): Observable<T> {
    return this.http.get<ApiResponse<T>>(this.url(path), { params: this.buildParams(params) }).pipe(map(r => r.data));
  }

  post<T>(path: string, body?: unknown, params?: Params): Observable<T> {
    return this.http.post<ApiResponse<T>>(this.url(path), body ?? {}, { params: this.buildParams(params) }).pipe(map(r => r.data));
  }

  put<T>(path: string, body?: unknown): Observable<T> {
    return this.http.put<ApiResponse<T>>(this.url(path), body ?? {}).pipe(map(r => r.data));
  }

  patch<T>(path: string, body?: unknown): Observable<T> {
    return this.http.patch<ApiResponse<T>>(this.url(path), body ?? {}).pipe(map(r => r.data));
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(this.url(path)).pipe(map(r => r.data));
  }

  private url(path: string) {
    return path.startsWith('http') ? path : `${this.base}/${path.replace(/^\//, '')}`;
  }

  private buildParams(params?: Params): HttpParams | undefined {
    if (!params) return undefined;
    let p = new HttpParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== null && v !== undefined && v !== '') p = p.set(k, String(v));
    }
    return p;
  }
}
