import { Routes } from '@angular/router';

export const branchRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/branch-list-page/branch-list-page.component').then(
            (c) => c.BranchListPageComponent,
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/branch-form-page/branch-form-page.component').then(
            (c) => c.BranchFormPageComponent,
          ),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/branch-form-page/branch-form-page.component').then(
            (c) => c.BranchFormPageComponent,
          ),
      },
    ],
  },
];
