import { Routes } from '@angular/router';

export const purchaseOrderRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/po-list-page/po-list-page.component').then((c) => c.PoListPageComponent),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/po-form-page/po-form-page.component').then((c) => c.PoFormPageComponent),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/po-form-page/po-form-page.component').then((c) => c.PoFormPageComponent),
      },
    ],
  },
];
