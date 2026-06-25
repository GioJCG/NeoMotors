import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CompanyItem, BranchItem } from '../../shared/models/user.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class ContextService {
  private readonly apiUrl = `${environment.apiUrl}/context`;

  constructor(private readonly http: HttpClient) {}

  private unwrap<T>(obs: Observable<ApiResponse<T>>): Observable<T> {
    return obs.pipe(map((res) => res.data));
  }

  getCompanies(): Observable<CompanyItem[]> {
    return this.unwrap(
      this.http.get<ApiResponse<CompanyItem[]>>(`${this.apiUrl}/companies`),
    );
  }

  getBranches(empresaId: string): Observable<BranchItem[]> {
    return this.unwrap(
      this.http.get<ApiResponse<BranchItem[]>>(`${this.apiUrl}/branches`, {
        params: { empresaId },
      }),
    );
  }

  setActiveCompany(empresaId: string): Observable<{ message: string }> {
    return this.unwrap(
      this.http.put<ApiResponse<{ message: string }>>(`${this.apiUrl}/company`, { empresaId }),
    );
  }

  setActiveBranch(sucursalId: string): Observable<{ message: string }> {
    return this.unwrap(
      this.http.put<ApiResponse<{ message: string }>>(`${this.apiUrl}/branch`, { sucursalId }),
    );
  }
}
