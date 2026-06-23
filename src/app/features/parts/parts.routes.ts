import { Routes } from '@angular/router';

export const partRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/parts-list-page/parts-list-page.component').then((c) => c.PartsListPageComponent),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/parts-form-page/parts-form-page.component').then((c) => c.PartsFormPageComponent),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/parts-form-page/parts-form-page.component').then((c) => c.PartsFormPageComponent),
      },
    ],
  },
];
