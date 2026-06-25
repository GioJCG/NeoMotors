import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CompanyItem, BranchItem } from '../../shared/models/user.model';

export interface ContextCompany {
  id: string;
  nombre: string;
  rfc: string;
  colorPrimario?: string | null;
  colorSecundario?: string | null;
  logoUrl?: string | null;
  tema?: string | null;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class ContextService {
  private readonly apiUrl = `${environment.apiUrl}/context`;

  constructor(private readonly http: HttpClient) {}

  getCompanies(): Observable<CompanyItem[]> {
    return this.http.get<CompanyItem[]>(`${this.apiUrl}/companies`);
  }

  findCompanyById(id: string): Observable<ContextCompany> {
    return this.http.get<ContextCompany>(`${this.apiUrl}/company/${id}`);
  }

  getBranches(empresaId: string): Observable<BranchItem[]> {
    return this.http.get<BranchItem[]>(`${this.apiUrl}/branches`, {
      params: { empresaId },
    });
  }

  setActiveCompany(empresaId: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/company`, { empresaId });
  }

  setActiveBranch(sucursalId: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/branch`, { sucursalId });
  }
}
