import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { OrderStatsResponse, RevenueResponse, StockAlert, TechnicianEfficiency } from '../models/dashboard.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/dashboard`;

  getOrderStats(): Observable<OrderStatsResponse> {
    return this.http.get<ApiResponse<OrderStatsResponse>>(`${this.apiUrl}/order-stats`).pipe(map((r) => r.data));
  }

  getRevenue(desde?: string, hasta?: string): Observable<RevenueResponse> {
    const params = new URLSearchParams();
    if (desde) params.set('desde', desde);
    if (hasta) params.set('hasta', hasta);
    return this.http.get<ApiResponse<RevenueResponse>>(`${this.apiUrl}/revenue?${params}`).pipe(map((r) => r.data));
  }

  getStockAlerts(): Observable<StockAlert[]> {
    return this.http.get<ApiResponse<StockAlert[]>>(`${this.apiUrl}/stock-alerts`).pipe(map((r) => r.data));
  }

  getTechnicianEfficiency(): Observable<TechnicianEfficiency[]> {
    return this.http.get<ApiResponse<TechnicianEfficiency[]>>(`${this.apiUrl}/technician-efficiency`).pipe(map((r) => r.data));
  }
}
