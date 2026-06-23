import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Cita, CreateCitaRequest, UpdateCitaRequest, AvailabilitySlot } from '../models/cita.model';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class CitasService {
  private readonly apiUrl = `${environment.apiUrl}/appointments`;

  constructor(private readonly http: HttpClient) {}

  findAll(fecha?: string, sucursalId?: string): Observable<ApiResponse<Cita[]>> {
    let params: any = {};
    if (fecha) params.fecha = fecha;
    if (sucursalId) params.sucursalId = sucursalId;
    return this.http.get<ApiResponse<Cita[]>>(this.apiUrl, { params });
  }

  findById(id: string): Observable<ApiResponse<Cita>> {
    return this.http.get<ApiResponse<Cita>>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateCitaRequest): Observable<ApiResponse<Cita>> {
    return this.http.post<ApiResponse<Cita>>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateCitaRequest): Observable<ApiResponse<Cita>> {
    return this.http.put<ApiResponse<Cita>>(`${this.apiUrl}/${id}`, dto);
  }

  remove(id: string): Observable<ApiResponse<{ message: string }>> {
    return this.http.delete<ApiResponse<{ message: string }>>(`${this.apiUrl}/${id}`);
  }

  getAvailability(fecha: string, sucursalId?: string): Observable<ApiResponse<{ occupiedSlots: AvailabilitySlot[] }>> {
    let params: any = { fecha };
    if (sucursalId) params.sucursalId = sucursalId;
    return this.http.get<ApiResponse<{ occupiedSlots: AvailabilitySlot[] }>>(`${this.apiUrl}/availability`, { params });
  }
}
