import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { NotificacionesService } from '../../services/notificaciones.service';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
  ],
  template: `
    <button
      mat-icon-button
      [matMenuTriggerFor]="notifMenu"
      [matBadge]="notifService.unreadCount()"
      matBadgeColor="warn"
      matBadgeSize="small"
      class="notif-btn"
    >
      <mat-icon>notifications</mat-icon>
    </button>
    <mat-menu #notifMenu="matMenu" class="notif-menu" xPosition="before">
      <div class="notif-header">
        <strong>Notificaciones</strong>
        @if (notifService.unreadCount() > 0) {
          <button mat-button class="mark-all-btn" (click)="markAllRead()">
            Marcar todo leído
          </button>
        }
      </div>
      <mat-divider />
      @if (notifService.notifications().length === 0) {
        <div class="notif-empty">Sin notificaciones nuevas</div>
      }
      @for (n of notifService.notifications(); track n.id) {
        <button mat-menu-item class="notif-item" (click)="markRead(n.id)">
          <div class="notif-item-content">
            <div class="notif-title">
              <span class="notif-prio notif-prio-{{ n.prioridad.toLowerCase() }}">{{ n.prioridad }}</span>
              {{ n.titulo }}
            </div>
            <div class="notif-msg">{{ n.mensaje }}</div>
            <div class="notif-date">{{ n.createdAt | date:'dd/MM HH:mm' }}</div>
          </div>
        </button>
      }
      <mat-divider />
      <button mat-menu-item routerLink="/notifications" class="notif-view-all">
        <mat-icon>list</mat-icon>
        Ver todas
      </button>
    </mat-menu>
  `,
  styles: `
    .notif-btn { margin-left: 4px; }
    .notif-menu { min-width: 320px; max-width: 380px; }
    .notif-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 16px;
    }
    .mark-all-btn { font-size: 12px; line-height: 28px; }
    .notif-empty {
      padding: 24px 16px; text-align: center; color: #999; font-size: 13px;
    }
    .notif-item { height: auto !important; padding: 8px 16px !important; white-space: normal; }
    .notif-item-content { display: flex; flex-direction: column; gap: 2px; width: 100%; }
    .notif-title { font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 6px; }
    .notif-prio {
      font-size: 10px; padding: 1px 5px; border-radius: 3px; font-weight: 600;
    }
    .notif-prio-alta, .notif-prio-urgente { background: #ffe0e0; color: #c62828; }
    .notif-prio-normal { background: #e3f2fd; color: #1565c0; }
    .notif-prio-baja { background: #e8f5e9; color: #2e7d32; }
    .notif-msg { font-size: 12px; color: #666; line-height: 1.3; }
    .notif-date { font-size: 11px; color: #999; margin-top: 2px; }
    .notif-view-all { font-size: 13px; }
  `,
})
export class NotificationPanelComponent implements OnInit, OnDestroy {
  readonly notifService = inject(NotificacionesService);

  ngOnInit(): void {
    this.notifService.startPolling();
  }

  ngOnDestroy(): void {
    this.notifService.stopPolling();
  }

  markRead(id: string): void {
    this.notifService.markAsRead(id).subscribe();
  }

  markAllRead(): void {
    this.notifService.markAllAsRead().subscribe();
  }
}
