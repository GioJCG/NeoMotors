import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Vehiculo, CreateVehiculoRequest, UpdateVehiculoRequest, Marca, Modelo } from '../models/vehiculo.model';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class VehiculosService {
  private readonly apiUrl = `${environment.apiUrl}/vehicles`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<ApiResponse<Vehiculo[]>> {
    return this.http.get<ApiResponse<Vehiculo[]>>(this.apiUrl);
  }

  findById(id: string): Observable<ApiResponse<Vehiculo>> {
    return this.http.get<ApiResponse<Vehiculo>>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateVehiculoRequest): Observable<ApiResponse<Vehiculo>> {
    return this.http.post<ApiResponse<Vehiculo>>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateVehiculoRequest): Observable<ApiResponse<Vehiculo>> {
    return this.http.put<ApiResponse<Vehiculo>>(`${this.apiUrl}/${id}`, dto);
  }

  remove(id: string): Observable<ApiResponse<{ message: string }>> {
    return this.http.delete<ApiResponse<{ message: string }>>(`${this.apiUrl}/${id}`);
  }

  findAllMarcas(): Observable<ApiResponse<Marca[]>> {
    return this.http.get<ApiResponse<Marca[]>>(`${this.apiUrl}/catalog/marcas`);
  }

  findModelosByMarca(marcaId: string): Observable<ApiResponse<Modelo[]>> {
    return this.http.get<ApiResponse<Modelo[]>>(`${this.apiUrl}/catalog/marcas/${marcaId}/modelos`);
  }
}
