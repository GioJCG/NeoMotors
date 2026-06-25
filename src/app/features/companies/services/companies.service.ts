import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Company, CreateCompanyRequest, UpdateCompanyRequest } from '../models/company.model';

@Injectable({ providedIn: 'root' })
export class CompaniesService {
  private readonly apiUrl = `${environment.apiUrl}/companies`;

  constructor(private readonly http: HttpClient) {}

  private unwrap<T>(obs: Observable<{ success: boolean; data: T; timestamp: string }>): Observable<T> {
    return obs.pipe(map((res) => res.data));
  }

  findAll(): Observable<Company[]> {
    return this.unwrap(this.http.get<{ success: boolean; data: Company[]; timestamp: string }>(this.apiUrl));
  }

  findById(id: string): Observable<Company> {
    return this.unwrap(this.http.get<{ success: boolean; data: Company; timestamp: string }>(`${this.apiUrl}/${id}`));
  }

  create(dto: CreateCompanyRequest): Observable<Company> {
    return this.unwrap(this.http.post<{ success: boolean; data: Company; timestamp: string }>(this.apiUrl, dto));
  }

  update(id: string, dto: UpdateCompanyRequest): Observable<Company> {
    return this.unwrap(this.http.put<{ success: boolean; data: Company; timestamp: string }>(`${this.apiUrl}/${id}`, dto));
  }

  remove(id: string): Observable<{ message: string }> {
    return this.unwrap(this.http.delete<{ success: boolean; data: { message: string }; timestamp: string }>(`${this.apiUrl}/${id}`));
  }

  uploadLogo(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    return this.unwrap(this.http.post<{ success: boolean; data: { url: string }; timestamp: string }>(`${this.apiUrl}/logo`, formData));
  }
}
