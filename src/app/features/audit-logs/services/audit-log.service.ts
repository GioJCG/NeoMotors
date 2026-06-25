import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuditLogResponse } from '../models/audit-log.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/audit-logs`;

  findAll(filters: {
    page?: number;
    limit?: number;
    entidad?: string;
    accion?: string;
    usuarioId?: string;
    desde?: string;
    hasta?: string;
  }): Observable<AuditLogResponse> {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.entidad) params.set('entidad', filters.entidad);
    if (filters.accion) params.set('accion', filters.accion);
    if (filters.usuarioId) params.set('usuarioId', filters.usuarioId);
    if (filters.desde) params.set('desde', filters.desde);
    if (filters.hasta) params.set('hasta', filters.hasta);
    return this.http.get<ApiResponse<AuditLogResponse>>(`${this.apiUrl}?${params}`).pipe(map((r) => r.data));
  }
}
