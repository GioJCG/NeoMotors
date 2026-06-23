import { Routes } from '@angular/router';

export const citaRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/citas-page/citas-page.component').then(
        (c) => c.CitasPageComponent,
      ),
  },
];
