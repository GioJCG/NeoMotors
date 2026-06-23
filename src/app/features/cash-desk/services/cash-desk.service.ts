import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CashDesk, CashDeskMovement, OpenCashDeskRequest, CloseCashDeskRequest, RegisterPaymentRequest, RegisterTransactionRequest } from '../models/cash-desk.model';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface CashDeskStatus {
  activa: (CashDesk & { movimientos: CashDeskMovement[] }) | null;
  historial: CashDesk[] | null;
}

@Injectable({ providedIn: 'root' })
export class CashDeskService {
  private readonly apiUrl = `${environment.apiUrl}/cash-desk`;

  constructor(private readonly http: HttpClient) {}

  getStatus(): Observable<ApiResponse<CashDeskStatus>> {
    return this.http.get<ApiResponse<CashDeskStatus>>(`${this.apiUrl}/status`);
  }

  getHistory(page = 1, limit = 20): Observable<ApiResponse<CashDesk[]>> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<ApiResponse<CashDesk[]>>(`${this.apiUrl}/history`, { params });
  }

  open(dto: OpenCashDeskRequest): Observable<ApiResponse<CashDesk>> {
    return this.http.post<ApiResponse<CashDesk>>(`${this.apiUrl}/open`, dto);
  }

  close(dto: CloseCashDeskRequest): Observable<ApiResponse<CashDesk>> {
    return this.http.post<ApiResponse<CashDesk>>(`${this.apiUrl}/close`, dto);
  }

  registerPayment(dto: RegisterPaymentRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/payment`, dto);
  }

  registerTransaction(dto: RegisterTransactionRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/transaction`, dto);
  }
}
