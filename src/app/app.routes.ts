import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((r) => r.authRoutes),
  },
  {
    path: '',
    loadChildren: () =>
      import('./layout/layout.routes').then((r) => r.layoutRoutes),
  },
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },
];
