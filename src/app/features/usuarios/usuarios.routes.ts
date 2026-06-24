import { Routes } from '@angular/router';

export const usuarioRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/users-list/users-list-page.component').then(
        (c) => c.UsersListPageComponent,
      ),
  },
];
