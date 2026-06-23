import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from '../models/supplier.model';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class SuppliersService {
  private readonly apiUrl = `${environment.apiUrl}/suppliers`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<ApiResponse<Supplier[]>> {
    return this.http.get<ApiResponse<Supplier[]>>(this.apiUrl);
  }

  findById(id: string): Observable<ApiResponse<Supplier>> {
    return this.http.get<ApiResponse<Supplier>>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateSupplierRequest): Observable<ApiResponse<Supplier>> {
    return this.http.post<ApiResponse<Supplier>>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateSupplierRequest): Observable<ApiResponse<Supplier>> {
    return this.http.put<ApiResponse<Supplier>>(`${this.apiUrl}/${id}`, dto);
  }

  remove(id: string): Observable<ApiResponse<{ message: string }>> {
    return this.http.delete<ApiResponse<{ message: string }>>(`${this.apiUrl}/${id}`);
  }
}
