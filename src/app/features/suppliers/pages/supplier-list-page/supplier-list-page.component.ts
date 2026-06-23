import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { BaseListComponent, BaseColumnDef } from '../../../../shared/components/base-list/base-list.component';
import { SuppliersService } from '../../services/suppliers.service';
import { Supplier } from '../../models/supplier.model';

@Component({
  selector: 'app-supplier-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    BaseListComponent,
  ],
  template: `
    <app-base-list
      title="Proveedores"
      subtitle="Catálogo de proveedores de refacciones"
      [columns]="columns"
      [data]="suppliers()"
      [totalItems]="suppliers().length"
      [loading]="loading()"
      [searchTerm]="searchTerm()"
      searchPlaceholder="Nombre, RFC o contacto"
      emptyMessage="No se encontraron proveedores"
      [showActions]="false"
      (searchTermChange)="onSearch($event)"
      (pageChange)="onPageChange($event)"
    >
      <button
        toolbar-actions
        mat-flat-button
        color="primary"
        routerLink="/suppliers/new"
      >
        <mat-icon>add</mat-icon>
        Nuevo Proveedor
      </button>

      <ng-template #actions let-supplier>
        <button mat-icon-button color="primary" [routerLink]="['/suppliers', supplier.id]" matTooltip="Editar">
          <mat-icon>edit</mat-icon>
        </button>
      </ng-template>
    </app-base-list>
  `,
  styles: [`:host { display: block; max-width: 1200px; margin: 24px auto; padding: 0 16px; }`],
})
export class SupplierListPageComponent implements OnInit {
  private readonly suppliersService = inject(SuppliersService);
  private readonly snackBar = inject(MatSnackBar);

  readonly columns: BaseColumnDef[] = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'rfc', label: 'RFC' },
    { key: 'contacto', label: 'Contacto' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'email', label: 'Email' },
    { key: 'estado', label: 'Estado', type: 'chip',
      chipColor: (v: string) => v === 'ACTIVO' ? { bg: '#e8f5e9', color: '#2e7d32' } : { bg: '#f5f5f5', color: '#999' },
    },
  ];

  readonly suppliers = signal<Supplier[]>([]);
  readonly loading = signal(false);
  readonly searchTerm = signal('');

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.suppliersService.findAll().subscribe({
      next: (res) => { this.suppliers.set(res.data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.snackBar.open('Error al cargar proveedores', 'Cerrar', { duration: 3000 }); },
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.suppliers.set(
      this.suppliers().filter(
        (s) =>
          !term ||
          s.nombre.toLowerCase().includes(term.toLowerCase()) ||
          (s.rfc && s.rfc.toLowerCase().includes(term.toLowerCase())) ||
          (s.contacto && s.contacto.toLowerCase().includes(term.toLowerCase())),
      ),
    );
  }

  onPageChange(_event: any): void {}
}
