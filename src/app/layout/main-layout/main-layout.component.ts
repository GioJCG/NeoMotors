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

        <a class="brand" routerLink="/">
          @if (brandingService.logoUrl(); as logo) {
            <img [src]="logo" alt="Logo" class="brand-logo" />
          } @else {
            <mat-icon class="brand-icon">business</mat-icon>
          }
          <span class="brand-name">{{ brandingService.companyName() || userService.currentCompanyName() || 'Mi Empresa' }}</span>
        </a>

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
            @if (userService.hasRole('SuperUsuario')) {
              <a routerLink="/companies" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}" (click)="toggleMenu()">
                <mat-icon>business</mat-icon>
                Empresas
              </a>
            }

            @if (userService.currentCompanyId() && (userService.hasAnyRole(['AdministradorEmpresa', 'SuperUsuario']))) {
              <a routerLink="/users" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}" (click)="toggleMenu()">
                <mat-icon>group</mat-icon>
                Usuarios
              </a>
            }

            @if (userService.currentCompanyId() && userService.hasAnyRole(['AdministradorEmpresa', 'SupervisorSucursal', 'SuperUsuario'])) {
              <a routerLink="/dashboard" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}" (click)="toggleMenu()">
                <mat-icon>dashboard</mat-icon>
                Dashboard
              </a>
            }

            @if (userService.currentCompanyId() && userService.hasAnyRole(['AdministradorEmpresa', 'SuperUsuario'])) {
              <a [routerLink]="['/branches']" [queryParams]="{ empresaId: userService.currentCompanyId() }" routerLinkActive="active-link" (click)="toggleMenu()">
                <mat-icon>store</mat-icon>
                Sucursales
              </a>
            }

            @if (userService.currentCompanyId()) {
              <a routerLink="/customers" routerLinkActive="active-link" (click)="toggleMenu()">
                <mat-icon>people</mat-icon>
                Clientes
              </a>
              <a routerLink="/vehicles" routerLinkActive="active-link" (click)="toggleMenu()">
                <mat-icon>directions_car</mat-icon>
                Vehículos
              </a>
            }

            @if (userService.currentCompanyId() && userService.hasAnyRole(['AdministradorEmpresa', 'SupervisorSucursal', 'SuperUsuario'])) {
              <a routerLink="/appointments" routerLinkActive="active-link" (click)="toggleMenu()">
                <mat-icon>calendar_today</mat-icon>
                Citas
              </a>
            }

            @if (userService.currentCompanyId()) {
              <a routerLink="/work-orders/reception" routerLinkActive="active-link" (click)="toggleMenu()">
                <mat-icon>assignment_returned</mat-icon>
                Recepción
              </a>
              <a routerLink="/work-orders" routerLinkActive="active-link" (click)="toggleMenu()">
                <mat-icon>build</mat-icon>
                Órdenes
              </a>
              <a routerLink="/quotes" routerLinkActive="active-link" (click)="toggleMenu()">
                <mat-icon>request_quote</mat-icon>
                Cotizaciones
              </a>
            }

            @if (userService.currentCompanyId() && userService.hasAnyRole(['AdministradorEmpresa', 'SupervisorSucursal', 'SuperUsuario'])) {
              <a routerLink="/suppliers" routerLinkActive="active-link" (click)="toggleMenu()">
                <mat-icon>local_shipping</mat-icon>
                Proveedores
              </a>
              <a routerLink="/purchase-orders" routerLinkActive="active-link" (click)="toggleMenu()">
                <mat-icon>shopping_cart</mat-icon>
                Compras
              </a>
              <a routerLink="/parts" routerLinkActive="active-link" (click)="toggleMenu()">
                <mat-icon>handyman</mat-icon>
                Refacciones
              </a>
              <a routerLink="/inventory" routerLinkActive="active-link" (click)="toggleMenu()">
                <mat-icon>inventory_2</mat-icon>
                Inventario
              </a>
            }

            @if (userService.currentCompanyId()) {
              <a routerLink="/cash-desk" routerLinkActive="active-link" (click)="toggleMenu()">
                <mat-icon>point_of_sale</mat-icon>
                Caja
              </a>
              <a routerLink="/billing" routerLinkActive="active-link" (click)="toggleMenu()">
                <mat-icon>receipt_long</mat-icon>
                Facturación
              </a>
              <a routerLink="/fiscal/csd" routerLinkActive="active-link" (click)="toggleMenu()">
                <mat-icon>verified</mat-icon>
                CSD
              </a>
            }

            @if (userService.currentCompanyId() && userService.hasAnyRole(['AdministradorEmpresa', 'SupervisorSucursal', 'SuperUsuario'])) {
              <a routerLink="/notifications" routerLinkActive="active-link" (click)="toggleMenu()">
                <mat-icon>notifications</mat-icon>
                Notificaciones
              </a>
              <a routerLink="/audit-logs" routerLinkActive="active-link" (click)="toggleMenu()">
                <mat-icon>receipt_long</mat-icon>
                Auditoría
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
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: inherit;
      min-width: 0;
    }

    .brand-logo {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      object-fit: contain;
    }

    .brand-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .brand-name {
      font-weight: 600;
      font-size: 16px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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

    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: inherit;
    }

    .brand-logo {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      object-fit: contain;
    }

    .brand-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .brand-name {
      font-weight: 600;
      font-size: 16px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 240px;
    }

    .sidenav {
      position: fixed;
      top: 64px;
      left: 0;
      width: 240px;
      height: calc(100vh - 64px);
      background: var(--brand-primary, #1976d2);
      border-right: 1px solid rgba(0,0,0,0.12);
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
      color: rgba(255,255,255,0.87);
      font-size: 14px;
      transition: background 0.2s;
    }

    .nav-list a:hover {
      background: rgba(255,255,255,0.12);
    }

    .nav-list a.active-link {
      background: var(--brand-secondary, #ff5722);
      color: #fff;
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
  protected readonly brandingService = inject(BrandingService);
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

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.userService.clear();
    this.router.navigate(['/auth/login']);
  }
}
