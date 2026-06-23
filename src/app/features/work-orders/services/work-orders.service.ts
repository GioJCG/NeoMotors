import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { WorkOrder, CreateReceptionRequest, Diagnostico, CreateDiagnosticoRequest, TiempoTecnico } from '../models/work-order.model';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class WorkOrdersService {
  private readonly apiUrl = `${environment.apiUrl}/work-orders`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<ApiResponse<WorkOrder[]>> {
    return this.http.get<ApiResponse<WorkOrder[]>>(this.apiUrl);
  }

  findById(id: string): Observable<ApiResponse<WorkOrder>> {
    return this.http.get<ApiResponse<WorkOrder>>(`${this.apiUrl}/${id}`);
  }

  createReception(dto: CreateReceptionRequest): Observable<ApiResponse<{ reception: any; workOrder: WorkOrder; folio: string }>> {
    return this.http.post<ApiResponse<{ reception: any; workOrder: WorkOrder; folio: string }>>(`${this.apiUrl}/reception`, dto);
  }

  diagnose(id: string, dto: CreateDiagnosticoRequest): Observable<ApiResponse<Diagnostico>> {
    return this.http.post<ApiResponse<Diagnostico>>(`${this.apiUrl}/${id}/diagnose`, dto);
  }

  getDiagnosticos(id: string): Observable<ApiResponse<Diagnostico[]>> {
    return this.http.get<ApiResponse<Diagnostico[]>>(`${this.apiUrl}/${id}/diagnoses`);
  }

  trackTime(id: string, action: 'start' | 'pause' | 'resume' | 'stop'): Observable<ApiResponse<TiempoTecnico>> {
    return this.http.post<ApiResponse<TiempoTecnico>>(`${this.apiUrl}/${id}/track-time`, { action });
  }

  getTimeRecords(id: string): Observable<ApiResponse<TiempoTecnico[]>> {
    return this.http.get<ApiResponse<TiempoTecnico[]>>(`${this.apiUrl}/${id}/time-records`);
  }
}
