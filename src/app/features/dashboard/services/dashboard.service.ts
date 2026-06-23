import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { OrderStatsResponse, RevenueResponse, StockAlert, TechnicianEfficiency } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/dashboard`;

  getOrderStats(): Observable<OrderStatsResponse> {
    return this.http.get<OrderStatsResponse>(`${this.apiUrl}/order-stats`);
  }

  getRevenue(desde?: string, hasta?: string): Observable<RevenueResponse> {
    const params = new URLSearchParams();
    if (desde) params.set('desde', desde);
    if (hasta) params.set('hasta', hasta);
    return this.http.get<RevenueResponse>(`${this.apiUrl}/revenue?${params}`);
  }

  getStockAlerts(): Observable<StockAlert[]> {
    return this.http.get<StockAlert[]>(`${this.apiUrl}/stock-alerts`);
  }

  getTechnicianEfficiency(): Observable<TechnicianEfficiency[]> {
    return this.http.get<TechnicianEfficiency[]>(`${this.apiUrl}/technician-efficiency`);
  }
}
