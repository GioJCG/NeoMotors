import { Routes } from '@angular/router';

export const inventoryRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/inventory-page/inventory-page.component').then((c) => c.InventoryPageComponent),
      },
    ],
  },
];
