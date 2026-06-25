import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseListComponent, BaseColumnDef } from '../../../../shared/components/base-list/base-list.component';
import { VehiculosService } from '../../services/vehiculos.service';
import { Vehiculo } from '../../models/vehiculo.model';

@Component({
  selector: 'app-vehiculo-list-page',
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
      title="Vehículos"
      subtitle="Gestión de vehículos de la empresa"
      [columns]="columns"
      [data]="vehiculos()"
      [totalItems]="vehiculos().length"
      [loading]="loading()"
      [searchTerm]="searchTerm()"
      searchPlaceholder="Placa, VIN o cliente"
      emptyMessage="No se encontraron vehículos"
      [pageSize]="pageSize"
      (searchTermChange)="onSearch($event)"
      (pageChange)="onPageChange($event)"
    >
      <button
        toolbar-actions
        mat-flat-button
        color="primary"
        routerLink="/vehicles/new"
      >
        <mat-icon>add</mat-icon>
        Nuevo Vehículo
      </button>

      <ng-template #actions let-vehiculo>
        <button mat-icon-button color="primary" [routerLink]="['/vehicles', vehiculo.id, 'edit']" matTooltip="Editar">
          <mat-icon>edit</mat-icon>
        </button>
        <button
          mat-icon-button
          color="warn"
          (click)="confirmDelete(vehiculo)"
          matTooltip="Desactivar"
        >
          <mat-icon>delete</mat-icon>
        </button>
      </ng-template>
    </app-base-list>
  `,
  styles: `
    :host { display: block; max-width: 1200px; margin: 24px auto; padding: 0 16px; }
  `,
})
export class VehiculoListPageComponent implements OnInit {
  private readonly vehiculosService = inject(VehiculosService);
  private readonly snackBar = inject(MatSnackBar);

  readonly columns: BaseColumnDef[] = [
    { key: 'placa', label: 'Placa' },
    { key: 'marca', label: 'Marca', type: 'object', displayKey: 'nombre' },
    { key: 'modelo', label: 'Modelo', type: 'object', displayKey: 'nombre' },
    { key: 'cliente', label: 'Cliente', type: 'object', displayKey: 'nombre' },
    { key: 'numeroSerie', label: 'VIN' },
    { key: 'anio', label: 'Año' },
    {
      key: 'estado',
      label: 'Estado',
      type: 'chip',
      chipColor: (value: string) =>
        value === 'ACTIVO'
          ? { bg: '#e8f5e9', color: '#2e7d32' }
          : { bg: '#fce4ec', color: '#c62828' },
    },
  ];

  readonly vehiculos = signal<Vehiculo[]>([]);
  readonly loading = signal(false);
  readonly searchTerm = signal('');
  readonly pageSize = 10;

  ngOnInit(): void {
    this.loadVehiculos();
  }

  private loadVehiculos(): void {
    this.loading.set(true);
    this.vehiculosService.findAll().subscribe({
      next: (res) => {
        this.vehiculos.set(res ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar vehículos', 'Cerrar', { duration: 3000 });
      },
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.vehiculos.set(
      this.vehiculos().filter(
        (v) =>
          !term ||
          v.placa.toLowerCase().includes(term.toLowerCase()) ||
          (v.numeroSerie && v.numeroSerie.toLowerCase().includes(term.toLowerCase())) ||
          (v.cliente && v.cliente.nombre.toLowerCase().includes(term.toLowerCase())),
      ),
    );
  }

  onPageChange(_event: any): void {
  }

  confirmDelete(vehiculo: Vehiculo): void {
    const confirmed = confirm(`¿Desactivar el vehículo "${vehiculo.placa}"?`);
    if (!confirmed) return;

    this.vehiculosService.remove(vehiculo.id).subscribe({
      next: () => {
        this.snackBar.open('Vehículo desactivado exitosamente', 'Cerrar', { duration: 3000 });
        this.loadVehiculos();
      },
      error: () => {
        this.snackBar.open('Error al desactivar vehículo', 'Cerrar', { duration: 3000 });
      },
    });
  }
}
