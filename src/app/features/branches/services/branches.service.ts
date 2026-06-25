import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Branch, CreateBranchRequest, UpdateBranchRequest } from '../models/branch.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class BranchesService {
  private readonly apiUrl = `${environment.apiUrl}/branches`;

  constructor(private readonly http: HttpClient) {}

  findAll(empresaId: string): Observable<Branch[]> {
    const params = new HttpParams().set('empresaId', empresaId);
    return this.http.get<ApiResponse<Branch[]>>(this.apiUrl, { params }).pipe(map((r) => r.data));
  }

  findById(id: string): Observable<Branch> {
    return this.http.get<ApiResponse<Branch>>(`${this.apiUrl}/${id}`).pipe(map((r) => r.data));
  }

  create(empresaId: string, dto: CreateBranchRequest): Observable<Branch> {
    const params = new HttpParams().set('empresaId', empresaId);
    return this.http.post<ApiResponse<Branch>>(this.apiUrl, dto, { params }).pipe(map((r) => r.data));
  }

  update(id: string, dto: UpdateBranchRequest): Observable<Branch> {
    return this.http.put<ApiResponse<Branch>>(`${this.apiUrl}/${id}`, dto).pipe(map((r) => r.data));
  }

  remove(id: string): Observable<{ message: string }> {
    return this.http.delete<ApiResponse<{ message: string }>>(`${this.apiUrl}/${id}`).pipe(map((r) => r.data));
  }
}
