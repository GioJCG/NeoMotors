import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((r) => r.authRoutes),
  },
  {
    path: 'companies',
    loadChildren: () =>
      import('./features/companies/companies.routes').then((r) => r.companyRoutes),
  },
  {
    path: 'branches',
    loadChildren: () =>
      import('./features/branches/branches.routes').then((r) => r.branchRoutes),
  },
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },
];
