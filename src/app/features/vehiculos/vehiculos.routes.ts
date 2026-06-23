import { Routes } from '@angular/router';

export const vehiculoRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/vehiculo-list-page/vehiculo-list-page.component').then(
            (c) => c.VehiculoListPageComponent,
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/vehiculo-form-page/vehiculo-form-page.component').then(
            (c) => c.VehiculoFormPageComponent,
          ),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/vehiculo-form-page/vehiculo-form-page.component').then(
            (c) => c.VehiculoFormPageComponent,
          ),
      },
    ],
  },
];
