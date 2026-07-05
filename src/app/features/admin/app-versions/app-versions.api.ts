import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';
import { ApiService } from '../../../core/http/api.service';
import { MICROSERVICES, ms } from '../../../core/http/microservices';
import { AppVersion, AppVersionUpload } from './app-versions.model';

const path = (p: string) => ms(MICROSERVICES.SYSTEM, p);

@Injectable({ providedIn: 'root' })
export class AppVersionsApi {
  private readonly api = inject(ApiService);

  list(): Observable<AppVersion[]> { return this.api.get(path('app-versions')); }

  upload(u: AppVersionUpload): Observable<AppVersion> {
    const form = new FormData();
    form.append('file', u.file, u.file.name);
    form.append('version', u.version);
    form.append('versionCode', String(u.versionCode));
    if (u.notes) form.append('notes', u.notes);
    form.append('publish', String(u.publish));
    return this.api.post(path('app-versions'), form);
  }

  publish(id: string): Observable<AppVersion> { return this.api.patch(path(`app-versions/${id}/publish`)); }
  remove(id: string): Observable<void> { return this.api.delete(path(`app-versions/${id}`)); }

  /** Link ESTABLE y compartible: siempre sirve la versión vigente. */
  latestDownloadUrl(): string {
    return `${environment.apiUrl.replace(/\/$/, '')}/system/public/app-versions/latest/download`;
  }

  /** Descarga de una versión puntual del histórico. */
  downloadUrl(id: string): string {
    return `${environment.apiUrl.replace(/\/$/, '')}/system/public/app-versions/${id}/download`;
  }
}
