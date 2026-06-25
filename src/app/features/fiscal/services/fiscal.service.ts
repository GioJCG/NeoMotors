import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { CsdStatus, UploadCsdResponse } from '../models/fiscal.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class FiscalService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/fiscal`;

  getCsdStatus(): Observable<CsdStatus> {
    return this.http.get<ApiResponse<CsdStatus>>(`${this.apiUrl}/csd-status`).pipe(map((r) => r.data));
  }

  uploadCsd(certificadoCer: string, llaveKey: string, password: string): Observable<UploadCsdResponse> {
    return this.http.post<ApiResponse<UploadCsdResponse>>(`${this.apiUrl}/upload-csd`, {
      certificadoCer,
      llaveKey,
      password,
    }).pipe(map((r) => r.data));
  }
}
