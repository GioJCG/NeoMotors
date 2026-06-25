import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FacturaFiscal, EmitirFacturaRequest, CancelarFacturaRequest, SatCatalogs, BillingStats } from '../models/billing.model';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class BillingService {
  private readonly apiUrl = `${environment.apiUrl}/billing`;

  constructor(private readonly http: HttpClient) {}

  issue(dto: EmitirFacturaRequest): Observable<ApiResponse<FacturaFiscal>> {
    return this.http.post<ApiResponse<FacturaFiscal>>(`${this.apiUrl}/issue`, dto);
  }

  findAll(params?: {
    page?: number;
    limit?: number;
    estado?: string;
    desde?: string;
    hasta?: string;
    q?: string;
  }): Observable<ApiResponse<FacturaFiscal[]>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page);
      if (params.limit) httpParams = httpParams.set('limit', params.limit);
      if (params.estado) httpParams = httpParams.set('estado', params.estado);
      if (params.desde) httpParams = httpParams.set('desde', params.desde);
      if (params.hasta) httpParams = httpParams.set('hasta', params.hasta);
      if (params.q) httpParams = httpParams.set('q', params.q);
    }
    return this.http.get<ApiResponse<FacturaFiscal[]>>(this.apiUrl, { params: httpParams });
  }

  findById(id: string): Observable<ApiResponse<FacturaFiscal>> {
    return this.http.get<ApiResponse<FacturaFiscal>>(`${this.apiUrl}/${id}`);
  }

  download(id: string, format: 'xml' | 'pdf'): Observable<ApiResponse<{ tipo: string; contenido: string; nombre: string }>> {
    return this.http.get<ApiResponse<{ tipo: string; contenido: string; nombre: string }>>(
      `${this.apiUrl}/${id}/download`,
      { params: new HttpParams().set('format', format) },
    );
  }

  cancel(id: string, dto: CancelarFacturaRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${id}/cancel`, dto);
  }

  getSatCatalogs(): Observable<ApiResponse<SatCatalogs>> {
    return this.http.get<ApiResponse<SatCatalogs>>(`${this.apiUrl}/sat-catalogs`);
  }

  getStats(): Observable<ApiResponse<BillingStats>> {
    return this.http.get<ApiResponse<BillingStats>>(`${this.apiUrl}/stats`);
  }
}
