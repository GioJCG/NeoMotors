import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';

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
      },
      {
        path: 'branches',
        loadChildren: () =>
          import('../features/branches/branches.routes').then((r) => r.branchRoutes),
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
      },
      {
        path: 'purchase-orders',
        loadChildren: () =>
          import('../features/purchase-orders/purchase-orders.routes').then((r) => r.purchaseOrderRoutes),
      },
      {
        path: 'parts',
        loadChildren: () =>
          import('../features/parts/parts.routes').then((r) => r.partRoutes),
      },
      {
        path: 'inventory',
        loadChildren: () =>
          import('../features/inventory/inventory.routes').then((r) => r.inventoryRoutes),
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
      },
      {
        path: 'fiscal',
        loadChildren: () =>
          import('../features/fiscal/fiscal.routes').then((r) => r.fiscalRoutes),
      },
      {
        path: '',
        redirectTo: 'companies',
        pathMatch: 'full',
      },
    ],
  },
];
