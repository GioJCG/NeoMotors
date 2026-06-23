import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';
import { MainLayoutComponent } from './main-layout/main-layout.component';

export const layoutRoutes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
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
        path: '',
        redirectTo: 'companies',
        pathMatch: 'full',
      },
    ],
  },
];
