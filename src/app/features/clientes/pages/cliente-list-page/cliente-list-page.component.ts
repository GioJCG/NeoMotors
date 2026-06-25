import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseListComponent, BaseColumnDef } from '../../../../shared/components/base-list/base-list.component';
import { ClientesService } from '../../services/clientes.service';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-cliente-list-page',
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
      title="Clientes"
      subtitle="Gestión de clientes de la empresa"
      [columns]="columns"
      [data]="clientes()"
      [totalItems]="clientes().length"
      [loading]="loading()"
      [searchTerm]="searchTerm()"
      searchPlaceholder="Nombre, RFC o email"
      emptyMessage="No se encontraron clientes"
      [pageSize]="pageSize"
      (searchTermChange)="onSearch($event)"
      (pageChange)="onPageChange($event)"
    >
      <button
        toolbar-actions
        mat-flat-button
        color="primary"
        routerLink="/customers/new"
      >
        <mat-icon>add</mat-icon>
        Nuevo Cliente
      </button>

      <ng-template #actions let-cliente>
        <button mat-icon-button color="primary" [routerLink]="['/customers', cliente.id, 'edit']" matTooltip="Editar">
          <mat-icon>edit</mat-icon>
        </button>
        <button
          mat-icon-button
          color="warn"
          (click)="confirmDelete(cliente)"
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
export class ClienteListPageComponent implements OnInit {
  private readonly clientesService = inject(ClientesService);
  private readonly snackBar = inject(MatSnackBar);

  readonly columns: BaseColumnDef[] = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'rfc', label: 'RFC' },
    { key: 'email', label: 'Email' },
    { key: 'telefono', label: 'Teléfono' },
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

  readonly clientes = signal<Cliente[]>([]);
  readonly loading = signal(false);
  readonly searchTerm = signal('');
  readonly pageSize = 10;

  ngOnInit(): void {
    this.loadClientes();
  }

  private loadClientes(): void {
    this.loading.set(true);
    this.clientesService.findAll().subscribe({
      next: (res) => {
        this.clientes.set(res ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar clientes', 'Cerrar', { duration: 3000 });
      },
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.clientes.set(
      this.clientes().filter(
        (c) =>
          !term ||
          c.nombre.toLowerCase().includes(term.toLowerCase()) ||
          (c.rfc && c.rfc.toLowerCase().includes(term.toLowerCase())) ||
          (c.email && c.email.toLowerCase().includes(term.toLowerCase())),
      ),
    );
  }

  onPageChange(_event: any): void {
  }

  confirmDelete(cliente: Cliente): void {
    const confirmed = confirm(`¿Desactivar el cliente "${cliente.nombre}"?`);
    if (!confirmed) return;

    this.clientesService.remove(cliente.id).subscribe({
      next: () => {
        this.snackBar.open('Cliente desactivado exitosamente', 'Cerrar', { duration: 3000 });
        this.loadClientes();
      },
      error: () => {
        this.snackBar.open('Error al desactivar cliente', 'Cerrar', { duration: 3000 });
      },
    });
  }
}
