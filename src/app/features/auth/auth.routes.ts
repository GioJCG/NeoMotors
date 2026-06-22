import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login-page/login-page.component').then(
        (c) => c.LoginPageComponent,
      ),
  },
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
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password-page/forgot-password-page.component').then(
        (c) => c.ForgotPasswordPageComponent,
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/reset-password-page/reset-password-page.component').then(
        (c) => c.ResetPasswordPageComponent,
      ),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
