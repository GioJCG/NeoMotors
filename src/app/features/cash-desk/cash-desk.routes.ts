import { Routes } from '@angular/router';

export const cashDeskRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/cash-desk-page/cash-desk-page.component').then((c) => c.CashDeskPageComponent),
      },
    ],
  },
];
