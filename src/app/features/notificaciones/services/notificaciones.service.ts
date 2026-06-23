import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, switchMap, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Notificacion, NotificacionListResponse, UnreadCount } from '../models/notificacion.model';

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/notifications`;

  readonly unreadCount = signal(0);
  readonly notifications = signal<Notificacion[]>([]);
  readonly total = signal(0);

  private pollingSubscription: any;

  startPolling(intervalMs = 30000): void {
    this.refresh();
    this.pollingSubscription = interval(intervalMs)
      .pipe(switchMap(() => this.loadNotifications()))
      .subscribe();
  }

  stopPolling(): void {
    this.pollingSubscription?.unsubscribe();
  }

  refresh(): void {
    this.loadNotifications().subscribe();
    this.loadUnreadCount().subscribe();
  }

  private loadNotifications(page = 1, limit = 10): Observable<NotificacionListResponse> {
    return this.http.get<NotificacionListResponse>(`${this.apiUrl}?page=${page}&limit=${limit}&leida=false`).pipe(
      tap((res) => {
        this.notifications.set(res.data);
        this.total.set(res.total);
      }),
    );
  }

  private loadUnreadCount(): Observable<UnreadCount> {
    return this.http.get<UnreadCount>(`${this.apiUrl}/unread-count`).pipe(
      tap((res) => this.unreadCount.set(res.count)),
    );
  }

  getAll(page = 1, limit = 50, leida?: string): Observable<NotificacionListResponse> {
    const params = `page=${page}&limit=${limit}${leida !== undefined ? `&leida=${leida}` : ''}`;
    return this.http.get<NotificacionListResponse>(`${this.apiUrl}?${params}`);
  }

  markAsRead(id: string): Observable<Notificacion> {
    return this.http.put<Notificacion>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => this.refresh()),
    );
  }

  markAllAsRead(): Observable<{ count: number }> {
    return this.http.put<{ count: number }>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => this.refresh()),
    );
  }
}
