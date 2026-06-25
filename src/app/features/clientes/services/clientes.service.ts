import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Cliente, CreateClienteRequest, UpdateClienteRequest } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly apiUrl = `${environment.apiUrl}/customers`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl);
  }

  findById(id: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateClienteRequest): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateClienteRequest): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, dto);
  }

  remove(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
