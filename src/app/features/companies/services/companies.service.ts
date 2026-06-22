import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Company, CreateCompanyRequest, UpdateCompanyRequest } from '../models/company.model';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class CompaniesService {
  private readonly apiUrl = `${environment.apiUrl}/companies`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<ApiResponse<Company[]>> {
    return this.http.get<ApiResponse<Company[]>>(this.apiUrl);
  }

  findById(id: string): Observable<ApiResponse<Company>> {
    return this.http.get<ApiResponse<Company>>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateCompanyRequest): Observable<ApiResponse<Company>> {
    return this.http.post<ApiResponse<Company>>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateCompanyRequest): Observable<ApiResponse<Company>> {
    return this.http.put<ApiResponse<Company>>(`${this.apiUrl}/${id}`, dto);
  }

  remove(id: string): Observable<ApiResponse<{ message: string }>> {
    return this.http.delete<ApiResponse<{ message: string }>>(`${this.apiUrl}/${id}`);
  }
}
