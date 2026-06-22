import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Branch, CreateBranchRequest, UpdateBranchRequest } from '../models/branch.model';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class BranchesService {
  private readonly apiUrl = `${environment.apiUrl}/branches`;

  constructor(private readonly http: HttpClient) {}

  findAll(empresaId: string): Observable<ApiResponse<Branch[]>> {
    const params = new HttpParams().set('empresaId', empresaId);
    return this.http.get<ApiResponse<Branch[]>>(this.apiUrl, { params });
  }

  findById(id: string): Observable<ApiResponse<Branch>> {
    return this.http.get<ApiResponse<Branch>>(`${this.apiUrl}/${id}`);
  }

  create(empresaId: string, dto: CreateBranchRequest): Observable<ApiResponse<Branch>> {
    const params = new HttpParams().set('empresaId', empresaId);
    return this.http.post<ApiResponse<Branch>>(this.apiUrl, dto, { params });
  }

  update(id: string, dto: UpdateBranchRequest): Observable<ApiResponse<Branch>> {
    return this.http.put<ApiResponse<Branch>>(`${this.apiUrl}/${id}`, dto);
  }

  remove(id: string): Observable<ApiResponse<{ message: string }>> {
    return this.http.delete<ApiResponse<{ message: string }>>(`${this.apiUrl}/${id}`);
  }
}
