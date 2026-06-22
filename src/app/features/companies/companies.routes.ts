import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const companyRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/company-list-page/company-list-page.component').then(
            (c) => c.CompanyListPageComponent,
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/company-form-page/company-form-page.component').then(
            (c) => c.CompanyFormPageComponent,
          ),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/company-form-page/company-form-page.component').then(
            (c) => c.CompanyFormPageComponent,
          ),
      },
    ],
  },
];
