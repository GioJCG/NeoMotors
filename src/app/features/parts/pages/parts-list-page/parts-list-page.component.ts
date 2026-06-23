import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { BaseListComponent, BaseColumnDef } from '../../../../shared/components/base-list/base-list.component';
import { PartsService } from '../../services/parts.service';
import { Part } from '../../models/part.model';

@Component({
  selector: 'app-parts-list-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatSnackBarModule, BaseListComponent],
  template: `
    <app-base-list
      title="Refacciones"
      subtitle="Catálogo de refacciones y materiales"
      [columns]="columns"
      [data]="parts()"
      [totalItems]="parts().length"
      [loading]="loading()"
      [searchTerm]="searchTerm()"
      searchPlaceholder="Código, nombre o descripción"
      emptyMessage="No se encontraron refacciones"
      (searchTermChange)="onSearch($event)"
      (pageChange)="onPageChange($event)"
    >
      <button toolbar-actions mat-flat-button color="primary" routerLink="/parts/new">
        <mat-icon>add</mat-icon> Nueva Refacción
      </button>

      <ng-template #actions let-part>
        <button mat-icon-button color="primary" [routerLink]="['/parts', part.id]" matTooltip="Editar">
          <mat-icon>edit</mat-icon>
        </button>
      </ng-template>
    </app-base-list>
  `,
  styles: [`:host { display: block; max-width: 1200px; margin: 24px auto; padding: 0 16px; }`],
})
export class PartsListPageComponent implements OnInit {
  private readonly partsService = inject(PartsService);
  private readonly snackBar = inject(MatSnackBar);

  readonly columns: BaseColumnDef[] = [
    { key: 'codigo', label: 'Código' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'unidad', label: 'Unidad' },
    { key: 'precio', label: 'Precio', type: 'text' },
    { key: 'costo', label: 'Costo', type: 'text' },
    { key: 'estado', label: 'Estado', type: 'chip',
      chipColor: (v: string) => v === 'ACTIVO' ? { bg: '#e8f5e9', color: '#2e7d32' } : { bg: '#f5f5f5', color: '#999' },
    },
  ];

  readonly parts = signal<Part[]>([]);
  readonly loading = signal(false);
  readonly searchTerm = signal('');

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.partsService.findAll().subscribe({
      next: (res) => { this.parts.set(res.data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.snackBar.open('Error al cargar refacciones', 'Cerrar', { duration: 3000 }); },
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.parts.set(
      this.parts().filter(
        (p) => !term || p.codigo.toLowerCase().includes(term.toLowerCase()) || p.nombre.toLowerCase().includes(term.toLowerCase()),
      ),
    );
  }

  onPageChange(_event: any): void {}
}
