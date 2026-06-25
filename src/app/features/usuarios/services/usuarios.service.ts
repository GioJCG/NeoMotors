import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Usuario, CreateUsuarioRequest, UpdateUsuarioRequest } from '../models/usuario.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly apiUrl = `${environment.apiUrl}/users`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<Usuario[]> {
    return this.http.get<ApiResponse<Usuario[]>>(this.apiUrl).pipe(map((r) => r.data));
  }

  findById(id: string): Observable<Usuario> {
    return this.http.get<ApiResponse<Usuario>>(`${this.apiUrl}/${id}`).pipe(map((r) => r.data));
  }

  create(dto: CreateUsuarioRequest): Observable<Usuario> {
    return this.http.post<ApiResponse<Usuario>>(this.apiUrl, dto).pipe(map((r) => r.data));
  }

  update(id: string, dto: UpdateUsuarioRequest): Observable<{ message: string }> {
    return this.http.put<ApiResponse<{ message: string }>>(`${this.apiUrl}/${id}`, dto).pipe(map((r) => r.data));
  }

  toggleStatus(id: string): Observable<{ message: string; estado: string }> {
    return this.http.put<ApiResponse<{ message: string; estado: string }>>(`${this.apiUrl}/${id}/toggle-status`, {}).pipe(map((r) => r.data));
  }
}
