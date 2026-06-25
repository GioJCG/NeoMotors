import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Branch, CreateBranchRequest, UpdateBranchRequest } from '../models/branch.model';

@Injectable({ providedIn: 'root' })
export class BranchesService {
  private readonly apiUrl = `${environment.apiUrl}/branches`;

  constructor(private readonly http: HttpClient) {}

  findAll(empresaId: string): Observable<Branch[]> {
    const params = new HttpParams().set('empresaId', empresaId);
    return this.http.get<Branch[]>(this.apiUrl, { params });
  }

  findActiveByCompany(empresaId: string): Observable<Branch[]> {
    const params = new HttpParams().set('empresaId', empresaId).set('estado', 'ACTIVA');
    return this.http.get<Branch[]>(this.apiUrl, { params });
  }

  findById(id: string): Observable<Branch> {
    return this.http.get<Branch>(`${this.apiUrl}/${id}`);
  }

  create(empresaId: string, dto: CreateBranchRequest): Observable<Branch> {
    const params = new HttpParams().set('empresaId', empresaId);
    return this.http.post<Branch>(this.apiUrl, dto, { params });
  }

  update(id: string, dto: UpdateBranchRequest): Observable<Branch> {
    return this.http.put<Branch>(`${this.apiUrl}/${id}`, dto);
  }

  remove(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
