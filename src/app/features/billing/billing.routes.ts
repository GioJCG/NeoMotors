import { Routes } from '@angular/router';

export const billingRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/billing-list-page/billing-list-page.component').then(
            (c) => c.BillingListPageComponent,
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/billing-form-page/billing-form-page.component').then(
            (c) => c.BillingFormPageComponent,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/billing-detail-page/billing-detail-page.component').then(
            (c) => c.BillingDetailPageComponent,
          ),
      },
    ],
  },
];
