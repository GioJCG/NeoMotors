import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Part, CreatePartRequest, UpdatePartRequest } from '../models/part.model';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class PartsService {
  private readonly apiUrl = `${environment.apiUrl}/parts`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<ApiResponse<Part[]>> {
    return this.http.get<ApiResponse<Part[]>>(this.apiUrl);
  }

  findById(id: string): Observable<ApiResponse<Part>> {
    return this.http.get<ApiResponse<Part>>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreatePartRequest): Observable<ApiResponse<Part>> {
    return this.http.post<ApiResponse<Part>>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdatePartRequest): Observable<ApiResponse<Part>> {
    return this.http.put<ApiResponse<Part>>(`${this.apiUrl}/${id}`, dto);
  }

  remove(id: string): Observable<ApiResponse<{ message: string }>> {
    return this.http.delete<ApiResponse<{ message: string }>>(`${this.apiUrl}/${id}`);
  }
}
