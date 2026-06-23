import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Quote, CreateQuoteRequest, UpdateQuoteRequest } from '../models/quote.model';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class QuotesService {
  private readonly apiUrl = `${environment.apiUrl}/quotes`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<ApiResponse<Quote[]>> {
    return this.http.get<ApiResponse<Quote[]>>(this.apiUrl);
  }

  findById(id: string): Observable<ApiResponse<Quote>> {
    return this.http.get<ApiResponse<Quote>>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateQuoteRequest): Observable<ApiResponse<Quote>> {
    return this.http.post<ApiResponse<Quote>>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateQuoteRequest): Observable<ApiResponse<Quote>> {
    return this.http.put<ApiResponse<Quote>>(`${this.apiUrl}/${id}`, dto);
  }

  remove(id: string): Observable<ApiResponse<{ message: string }>> {
    return this.http.delete<ApiResponse<{ message: string }>>(`${this.apiUrl}/${id}`);
  }
}
