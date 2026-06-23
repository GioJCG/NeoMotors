import { Routes } from '@angular/router';

export const clienteRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/cliente-list-page/cliente-list-page.component').then(
            (c) => c.ClienteListPageComponent,
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/cliente-form-page/cliente-form-page.component').then(
            (c) => c.ClienteFormPageComponent,
          ),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/cliente-form-page/cliente-form-page.component').then(
            (c) => c.ClienteFormPageComponent,
          ),
      },
    ],
  },
];
