import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseListComponent, BaseColumnDef } from '../../../../shared/components/base-list/base-list.component';
import { PurchaseOrdersService } from '../../services/purchase-orders.service';
import { PurchaseOrder } from '../../models/purchase-order.model';

@Component({
  selector: 'app-po-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    BaseListComponent,
  ],
  template: `
    <app-base-list
      title="Órdenes de Compra"
      subtitle="Compras a proveedores de refacciones y materiales"
      [columns]="columns"
      [data]="orders()"
      [totalItems]="orders().length"
      [loading]="loading()"
      [searchTerm]="searchTerm()"
      searchPlaceholder="Folio, proveedor o estado"
      emptyMessage="No se encontraron órdenes de compra"
      [showActions]="false"
      (searchTermChange)="onSearch($event)"
      (pageChange)="onPageChange($event)"
    >
      <button
        toolbar-actions
        mat-flat-button
        color="primary"
        routerLink="/purchase-orders/new"
      >
        <mat-icon>add</mat-icon>
        Nueva Orden de Compra
      </button>

      <ng-template #actions let-order>
        <button mat-icon-button color="primary" [routerLink]="['/purchase-orders', order.id]" matTooltip="Ver detalle">
          <mat-icon>visibility</mat-icon>
        </button>
      </ng-template>
    </app-base-list>
  `,
  styles: [`:host { display: block; max-width: 1200px; margin: 24px auto; padding: 0 16px; }`],
})
export class PoListPageComponent implements OnInit {
  private readonly poService = inject(PurchaseOrdersService);
  private readonly snackBar = inject(MatSnackBar);

  readonly columns: BaseColumnDef[] = [
    { key: 'folio', label: 'Folio' },
    { key: 'proveedor', label: 'Proveedor', type: 'object', displayKey: 'nombre' },
    {
      key: 'estado',
      label: 'Estado',
      type: 'chip',
      chipColor: (value: string) => {
        const colors: Record<string, { bg: string; color: string }> = {
          BORRADOR: { bg: '#f5f5f5', color: '#616161' },
          ENVIADA: { bg: '#e3f2fd', color: '#1565c0' },
          RECIBIDA: { bg: '#e8f5e9', color: '#2e7d32' },
          CANCELADA: { bg: '#fce4ec', color: '#c62828' },
        };
        return colors[value] || { bg: '#f5f5f5', color: '#333' };
      },
    },
    { key: 'subtotal', label: 'Subtotal', type: 'text' },
    { key: 'total', label: 'Total', type: 'text' },
    { key: 'createdAt', label: 'Fecha' },
  ];

  readonly orders = signal<PurchaseOrder[]>([]);
  readonly loading = signal(false);
  readonly searchTerm = signal('');

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.poService.findAll().subscribe({
      next: (res) => { this.orders.set(res.data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.snackBar.open('Error al cargar órdenes', 'Cerrar', { duration: 3000 }); },
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.orders.set(
      this.orders().filter(
        (o) =>
          !term ||
          o.folio.toLowerCase().includes(term.toLowerCase()) ||
          o.estado.toLowerCase().includes(term.toLowerCase()) ||
          (o.proveedor && o.proveedor.nombre.toLowerCase().includes(term.toLowerCase())),
      ),
    );
  }

  onPageChange(_event: any): void {}
}
