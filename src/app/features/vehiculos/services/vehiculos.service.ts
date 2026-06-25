import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Vehiculo, CreateVehiculoRequest, UpdateVehiculoRequest, Marca, Modelo } from '../models/vehiculo.model';

@Injectable({ providedIn: 'root' })
export class VehiculosService {
  private readonly apiUrl = `${environment.apiUrl}/vehicles`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(this.apiUrl);
  }

  findById(id: string): Observable<Vehiculo> {
    return this.http.get<Vehiculo>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateVehiculoRequest): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateVehiculoRequest): Observable<Vehiculo> {
    return this.http.put<Vehiculo>(`${this.apiUrl}/${id}`, dto);
  }

  remove(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  findAllMarcas(): Observable<Marca[]> {
    return this.http.get<Marca[]>(`${this.apiUrl}/catalog/marcas`);
  }

  findModelosByMarca(marcaId: string): Observable<Modelo[]> {
    return this.http.get<Modelo[]>(`${this.apiUrl}/catalog/marcas/${marcaId}/modelos`);
  }
}
