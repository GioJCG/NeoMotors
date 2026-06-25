import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';
import { roleGuard } from '../core/guards/role.guard';

export const layoutRoutes: Routes = [
  {
    path: 'onboarding/company',
    loadComponent: () =>
      import('../features/onboarding/pages/create-company/create-company-page.component').then(
        (c) => c.CreateCompanyPageComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: '',
    loadComponent: () =>
      import('./main-layout/main-layout.component').then((c) => c.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'companies',
        loadChildren: () =>
          import('../features/companies/companies.routes').then((r) => r.companyRoutes),
        canActivate: [roleGuard],
        data: { roles: ['SuperUsuario'] },
      },
      {
        path: 'branches',
        loadChildren: () =>
          import('../features/branches/branches.routes').then((r) => r.branchRoutes),
        canActivate: [roleGuard],
        data: { roles: ['SuperUsuario', 'AdministradorEmpresa', 'SupervisorSucursal'] },
      },
      {
        path: 'customers',
        loadChildren: () =>
          import('../features/clientes/clientes.routes').then((r) => r.clienteRoutes),
      },
      {
        path: 'vehicles',
        loadChildren: () =>
          import('../features/vehiculos/vehiculos.routes').then((r) => r.vehiculoRoutes),
      },
      {
        path: 'appointments',
        loadChildren: () =>
          import('../features/citas/citas.routes').then((r) => r.citaRoutes),
      },
      {
        path: 'work-orders',
        loadChildren: () =>
          import('../features/work-orders/work-orders.routes').then((r) => r.workOrderRoutes),
      },
      {
        path: 'quotes',
        loadChildren: () =>
          import('../features/quotes/quotes.routes').then((r) => r.quoteRoutes),
      },
      {
        path: 'suppliers',
        loadChildren: () =>
          import('../features/suppliers/suppliers.routes').then((r) => r.supplierRoutes),
        canActivate: [roleGuard],
        data: { roles: ['SuperUsuario', 'AdministradorEmpresa', 'SupervisorSucursal', 'Consulta'] },
      },
      {
        path: 'purchase-orders',
        loadChildren: () =>
          import('../features/purchase-orders/purchase-orders.routes').then((r) => r.purchaseOrderRoutes),
        canActivate: [roleGuard],
        data: { roles: ['SuperUsuario', 'AdministradorEmpresa', 'SupervisorSucursal', 'Consulta'] },
      },
      {
        path: 'parts',
        loadChildren: () =>
          import('../features/parts/parts.routes').then((r) => r.partRoutes),
        canActivate: [roleGuard],
        data: { roles: ['SuperUsuario', 'AdministradorEmpresa', 'SupervisorSucursal', 'Consulta'] },
      },
      {
        path: 'inventory',
        loadChildren: () =>
          import('../features/inventory/inventory.routes').then((r) => r.inventoryRoutes),
        canActivate: [roleGuard],
        data: { roles: ['SuperUsuario', 'AdministradorEmpresa', 'SupervisorSucursal', 'Consulta'] },
      },
      {
        path: 'cash-desk',
        loadChildren: () =>
          import('../features/cash-desk/cash-desk.routes').then((r) => r.cashDeskRoutes),
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('../features/notificaciones/notificaciones.routes').then((r) => r.notificacionesRoutes),
      },
      {
        path: 'audit-logs',
        loadChildren: () =>
          import('../features/audit-logs/audit-logs.routes').then((r) => r.auditLogRoutes),
        canActivate: [roleGuard],
        data: { roles: ['SuperUsuario', 'AdministradorEmpresa'] },
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('../features/dashboard/dashboard.routes').then((r) => r.dashboardRoutes),
      },
      {
        path: 'users',
        loadChildren: () =>
          import('../features/usuarios/usuarios.routes').then((r) => r.usuarioRoutes),
        canActivate: [roleGuard],
        data: { roles: ['SuperUsuario', 'AdministradorEmpresa'] },
      },
      {
        path: 'fiscal',
        loadChildren: () =>
          import('../features/fiscal/fiscal.routes').then((r) => r.fiscalRoutes),
        canActivate: [roleGuard],
        data: { roles: ['SuperUsuario', 'AdministradorEmpresa'] },
      },
      {
        path: '',
        redirectTo: 'companies',
        pathMatch: 'full',
      },
    ],
  },
];
