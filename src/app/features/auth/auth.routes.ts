import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register-page/register-page.component').then(
        (c) => c.RegisterPageComponent,
      ),
  },
  {
    path: 'verify',
    loadComponent: () =>
      import('./pages/verify-page/verify-page.component').then(
        (c) => c.VerifyPageComponent,
      ),
  },
  {
    path: '',
    redirectTo: 'register',
    pathMatch: 'full',
  },
];
