import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { InventoryItem, InventoryMovement, AdjustStockRequest, TransferStockRequest } from '../models/inventory.model';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly apiUrl = `${environment.apiUrl}/inventory`;

  constructor(private readonly http: HttpClient) {}

  getStock(sucursalId?: string): Observable<ApiResponse<InventoryItem[]>> {
    const params = sucursalId ? new HttpParams().set('sucursalId', sucursalId) : undefined;
    return this.http.get<ApiResponse<InventoryItem[]>>(this.apiUrl, { params });
  }

  getAlerts(): Observable<ApiResponse<InventoryItem[]>> {
    return this.http.get<ApiResponse<InventoryItem[]>>(`${this.apiUrl}/alerts`);
  }

  getMovements(refaccionId?: string, sucursalId?: string): Observable<ApiResponse<InventoryMovement[]>> {
    let params = new HttpParams();
    if (refaccionId) params = params.set('refaccionId', refaccionId);
    if (sucursalId) params = params.set('sucursalId', sucursalId);
    return this.http.get<ApiResponse<InventoryMovement[]>>(`${this.apiUrl}/movements`, { params });
  }

  adjustStock(dto: AdjustStockRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/adjust`, dto);
  }

  transfer(dto: TransferStockRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/transfer`, dto);
  }
}
