import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Company, CreateCompanyRequest, UpdateCompanyRequest } from '../models/company.model';

@Injectable({ providedIn: 'root' })
export class CompaniesService {
  private readonly apiUrl = `${environment.apiUrl}/companies`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<Company[]> {
    return this.http.get<Company[]>(this.apiUrl);
  }

  findById(id: string): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateCompanyRequest): Observable<Company> {
    return this.http.post<Company>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateCompanyRequest): Observable<Company> {
    return this.http.put<Company>(`${this.apiUrl}/${id}`, dto);
  }

  remove(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
