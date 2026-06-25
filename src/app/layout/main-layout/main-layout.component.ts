import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { UserService } from '../../core/services/user.service';
import { BrandingService } from '../../core/services/branding.service';
import { ContextSelectorComponent } from '../context-selector/context-selector.component';
import { NotificationPanelComponent } from '../../features/notificaciones/components/notification-panel/notification-panel.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    ContextSelectorComponent,
    NotificationPanelComponent,
  ],
  template: `
    <div class="layout">
      <mat-toolbar color="primary" class="header">
        <button mat-icon-button class="menu-btn" (click)="toggleMenu()">
          <mat-icon>menu</mat-icon>
        </button>

        <span class="brand" routerLink="/">neoMotors</span>

        <span class="spacer"></span>

        <app-context-selector />

        @if (userService.currentCompanyId()) {
          <app-notification-panel />
        }

        <button mat-icon-button [matMenuTriggerFor]="userMenu" class="user-btn">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item disabled>
            <mat-icon>person</mat-icon>
            {{ userService.user()?.email }}
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            Cerrar sesión
          </button>
        </mat-menu>
      </mat-toolbar>

      @if (menuOpen()) {
        <div class="sidenav">
          <nav class="nav-list">
            @for (item of userService.menuItems(); track item.route) {
              <a
                mat-menu-item
                [routerLink]="item.route"
                [queryParams]="getMenuQueryParams(item)"
                (click)="toggleMenu()"
              >
                <mat-icon>{{ item.icon }}</mat-icon>
                {{ item.label }}
              </a>
            }
          </nav>
        </div>
      }

      <div class="content" [class.content-shifted]="menuOpen()">
        <router-outlet />
      </div>
    </div>
  `,
  styles: `
    .layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .header {
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      gap: 8px;
    }

    .brand {
      font-weight: 600;
      font-size: 20px;
      cursor: pointer;
      margin-right: 16px;
    }

    .spacer {
      flex: 1;
    }

    .menu-btn {
      margin-right: 4px;
    }

    .user-btn {
      margin-left: 8px;
    }

    .sidenav {
      position: fixed;
      top: 64px;
      left: 0;
      width: 240px;
      height: calc(100vh - 64px);
      background: var(--app-bg, #fff);
      border-right: 1px solid #e0e0e0;
      z-index: 99;
      overflow-y: auto;
      padding: 8px 0;
    }

    .nav-list {
      display: flex;
      flex-direction: column;
    }

    .nav-list a {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      text-decoration: none;
      color: #333;
      font-size: 14px;
    }

    .nav-list a:hover {
      background: #f5f5f5;
    }

    .content {
      flex: 1;
      background: var(--app-bg, #f5f5f5);
      transition: margin-left 0.3s ease;
    }

    .content-shifted {
      margin-left: 240px;
    }
  `,
})
export class MainLayoutComponent implements OnInit {
  readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly brandingService = inject(BrandingService);
  private menuOpenValue = false;

  menuOpen = () => this.menuOpenValue;

  constructor() {
    effect(() => {
      this.userService.currentCompanyId();
      this.brandingService.refresh();
    });
  }

  ngOnInit(): void {
    this.brandingService.init();
  }

  toggleMenu(): void {
    this.menuOpenValue = !this.menuOpenValue;
  }

  getMenuQueryParams(item: { route: string }): Record<string, string> | undefined {
    if (item.route === '/branches') {
      const id = this.userService.currentCompanyId();
      return id ? { empresaId: id } : undefined;
    }
    return undefined;
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.userService.clear();
    this.router.navigate(['/auth/login']);
  }
}
