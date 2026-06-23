import { Routes } from '@angular/router';

export const supplierRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/supplier-list-page/supplier-list-page.component').then((c) => c.SupplierListPageComponent),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/supplier-form-page/supplier-form-page.component').then((c) => c.SupplierFormPageComponent),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/supplier-form-page/supplier-form-page.component').then((c) => c.SupplierFormPageComponent),
      },
    ],
  },
];
