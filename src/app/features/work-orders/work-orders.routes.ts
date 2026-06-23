import { Routes } from '@angular/router';

export const workOrderRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/wo-list-page/wo-list-page.component').then(
            (c) => c.WoListPageComponent,
          ),
      },
      {
        path: 'reception',
        loadComponent: () =>
          import('./pages/reception-page/reception-page.component').then(
            (c) => c.ReceptionPageComponent,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/wo-detail-page/wo-detail-page.component').then(
            (c) => c.WoDetailPageComponent,
          ),
      },
    ],
  },
];
