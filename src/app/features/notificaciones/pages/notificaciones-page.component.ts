import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { NotificacionesService } from '../services/notificaciones.service';
import { Notificacion } from '../models/notificacion.model';

@Component({
  selector: 'app-notificaciones-page',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule,
    MatListModule, MatDividerModule, MatChipsModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Notificaciones</h1>
        @if (notifService.unreadCount() > 0) {
          <button mat-stroked-button (click)="markAllRead()">
            <mat-icon>done_all</mat-icon>
            Marcar todo leído
          </button>
        }
      </div>

      <mat-card>
        <mat-list>
          @for (n of notifications; track n.id) {
            <mat-list-item (click)="markRead(n)" [class.unread]="!n.leida">
              <mat-icon matListItemIcon class="notif-icon-{{ n.prioridad.toLowerCase() }}">
                {{ n.leida ? 'notifications_none' : 'notifications_active' }}
              </mat-icon>
              <div matListItemTitle>
                <span class="chip-prio chip-{{ n.prioridad.toLowerCase() }}">{{ n.prioridad }}</span>
                {{ n.titulo }}
              </div>
              <div matListItemLine>{{ n.mensaje }}</div>
              <div matListItemLine class="notif-meta">
                {{ n.createdAt | date:'dd/MM/yyyy HH:mm' }} &middot;
                {{ n.tipo }}
              </div>
              @if (!n.leida) {
                <button mat-icon-button matListItemMeta (click)="markRead(n); $event.stopPropagation()">
                  <mat-icon>check_circle</mat-icon>
                </button>
              }
            </mat-list-item>
            <mat-divider />
          } @empty {
            <div class="empty">No hay notificaciones</div>
          }
        </mat-list>
      </mat-card>
    </div>
  `,
  styles: `
    .page { padding: 24px; max-width: 800px; margin: 0 auto; }
    .page-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 16px;
    }
    .page-header h1 { margin: 0; font-size: 24px; font-weight: 500; }
    mat-card { border-radius: 8px; }
    .unread { background: #f0f7ff; }
    .empty { padding: 48px; text-align: center; color: #999; }
    .chip-prio {
      font-size: 10px; padding: 1px 6px; border-radius: 3px; font-weight: 600;
      margin-right: 6px;
    }
    .chip-alta, .chip-urgente { background: #ffe0e0; color: #c62828; }
    .chip-normal { background: #e3f2fd; color: #1565c0; }
    .chip-baja { background: #e8f5e9; color: #2e7d32; }
    .notif-meta { font-size: 12px; color: #999; }
    .notif-icon-alta, .notif-icon-urgente { color: #c62828; }
    .notif-icon-normal { color: #1565c0; }
    .notif-icon-baja { color: #2e7d32; }
  `,
})
export class NotificacionesPageComponent implements OnInit {
  readonly notifService = inject(NotificacionesService);
  notifications: Notificacion[] = [];

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll(): void {
    this.notifService.getAll(1, 100).subscribe((res) => {
      this.notifications = res.data;
    });
  }

  markRead(n: Notificacion): void {
    if (n.leida) return;
    this.notifService.markAsRead(n.id).subscribe(() => {
      n.leida = true;
      this.loadAll();
    });
  }

  markAllRead(): void {
    this.notifService.markAllAsRead().subscribe(() => {
      this.loadAll();
    });
  }
}
