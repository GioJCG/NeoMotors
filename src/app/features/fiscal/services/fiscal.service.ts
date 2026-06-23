import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CsdStatus, UploadCsdResponse } from '../models/fiscal.model';

@Injectable({ providedIn: 'root' })
export class FiscalService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/fiscal`;

  getCsdStatus(): Observable<CsdStatus> {
    return this.http.get<CsdStatus>(`${this.apiUrl}/csd-status`);
  }

  uploadCsd(certificadoCer: string, llaveKey: string, password: string): Observable<UploadCsdResponse> {
    return this.http.post<UploadCsdResponse>(`${this.apiUrl}/upload-csd`, {
      certificadoCer,
      llaveKey,
      password,
    });
  }
}
