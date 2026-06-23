import { Routes } from '@angular/router';

export const quoteRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/quote-list-page/quote-list-page.component').then(
            (c) => c.QuoteListPageComponent,
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/quote-form-page/quote-form-page.component').then(
            (c) => c.QuoteFormPageComponent,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/quote-form-page/quote-form-page.component').then(
            (c) => c.QuoteFormPageComponent,
          ),
      },
    ],
  },
];
