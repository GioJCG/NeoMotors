import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseListComponent, BaseColumnDef } from '../../../../shared/components/base-list/base-list.component';
import { WorkOrdersService } from '../../services/work-orders.service';
import { WorkOrder } from '../../models/work-order.model';

@Component({
  selector: 'app-wo-list-page',
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
      title="Órdenes de Trabajo"
      subtitle="Historial de recepciones y órdenes de trabajo"
      [columns]="columns"
      [data]="ordenes()"
      [totalItems]="ordenes().length"
      [loading]="loading()"
      [searchTerm]="searchTerm()"
      searchPlaceholder="Folio, cliente o placa"
      emptyMessage="No se encontraron órdenes de trabajo"
      [pageSize]="pageSize"
      [showActions]="false"
      (searchTermChange)="onSearch($event)"
      (pageChange)="onPageChange($event)"
    >
      <button
        toolbar-actions
        mat-flat-button
        color="primary"
        routerLink="/work-orders/reception"
      >
        <mat-icon>add</mat-icon>
        Nueva Recepción
      </button>

      <ng-template #actions let-orden>
        <button mat-icon-button color="primary" [routerLink]="['/work-orders', orden.id]" matTooltip="Ver detalle">
          <mat-icon>visibility</mat-icon>
        </button>
      </ng-template>
    </app-base-list>
  `,
  styles: `
    :host { display: block; max-width: 1200px; margin: 24px auto; padding: 0 16px; }
  `,
})
export class WoListPageComponent implements OnInit {
  private readonly workOrdersService = inject(WorkOrdersService);
  private readonly snackBar = inject(MatSnackBar);

  readonly columns: BaseColumnDef[] = [
    { key: 'folio', label: 'Folio' },
    { key: 'cliente', label: 'Cliente', type: 'object', displayKey: 'nombre' },
    { key: 'vehiculo', label: 'Vehículo', type: 'object', displayKey: 'placa' },
    {
      key: 'estado',
      label: 'Estado',
      type: 'chip',
      chipColor: (value: string) => {
        const colors: Record<string, { bg: string; color: string }> = {
          RECIBIDO: { bg: '#e3f2fd', color: '#1565c0' },
          DIAGNOSTICO: { bg: '#fff3e0', color: '#e65100' },
          PRESUPUESTADO: { bg: '#fce4ec', color: '#c62828' },
          APROBADO: { bg: '#e8f5e9', color: '#2e7d32' },
          TRABAJANDO: { bg: '#f3e5f5', color: '#6a1b9a' },
          TERMINADO: { bg: '#e8f5e9', color: '#1b5e20' },
          ENTREGADO: { bg: '#e0f2f1', color: '#004d40' },
        };
        return colors[value] || { bg: '#f5f5f5', color: '#333' };
      },
    },
    { key: 'createdAt', label: 'Fecha', type: 'text' },
  ];

  readonly ordenes = signal<WorkOrder[]>([]);
  readonly loading = signal(false);
  readonly searchTerm = signal('');
  readonly pageSize = 10;

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.workOrdersService.findAll().subscribe({
      next: (res) => {
        this.ordenes.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar órdenes de trabajo', 'Cerrar', { duration: 3000 });
      },
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.ordenes.set(
      this.ordenes().filter(
        (o) =>
          !term ||
          o.folio.toLowerCase().includes(term.toLowerCase()) ||
          (o.cliente && o.cliente.nombre.toLowerCase().includes(term.toLowerCase())) ||
          (o.vehiculo && o.vehiculo.placa.toLowerCase().includes(term.toLowerCase())),
      ),
    );
  }

  onPageChange(_event: any): void {
  }
}
