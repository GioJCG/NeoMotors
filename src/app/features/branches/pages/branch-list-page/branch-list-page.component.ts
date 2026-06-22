import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BranchesService } from '../../services/branches.service';
import { Branch } from '../../models/branch.model';
import { UserService } from '../../../../core/services/user.service';
import { RolDirective } from '../../../../core/directives/rol.directive';

@Component({
  selector: 'app-branch-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatCheckboxModule,
    RolDirective,
  ],
  template: `
    <div class="page-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Sucursales</mat-card-title>
          <mat-card-subtitle>Gestión de sucursales de la empresa</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="toolbar">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Buscar sucursales</mat-label>
              <input matInput [(ngModel)]="searchTerm" (input)="onSearch()" placeholder="Nombre o dirección" />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <button
              *appRol="['SuperUsuario', 'AdministradorEmpresa']"
              mat-flat-button
              color="primary"
              [routerLink]="['/branches/new']" [queryParams]="{ empresaId: empresaId() }"
            >
              <mat-icon>add</mat-icon>
              Nueva Sucursal
            </button>
          </div>

          @if (loading()) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else {
            <div class="table-container">
              <table mat-table [dataSource]="filteredBranches()" class="branches-table">
                <ng-container matColumnDef="nombre">
                  <th mat-header-cell *matHeaderCellDef>Nombre</th>
                  <td mat-cell *matCellDef="let b">
                    {{ b.nombre }}
                    @if (b.esMatriz) {
                      <mat-chip class="matriz-chip" highlighted>Matriz</mat-chip>
                    }
                  </td>
                </ng-container>

                <ng-container matColumnDef="direccion">
                  <th mat-header-cell *matHeaderCellDef>Dirección</th>
                  <td mat-cell *matCellDef="let b">{{ b.direccion || '—' }}</td>
                </ng-container>

                <ng-container matColumnDef="telefono">
                  <th mat-header-cell *matHeaderCellDef>Teléfono</th>
                  <td mat-cell *matCellDef="let b">{{ b.telefono || '—' }}</td>
                </ng-container>

                <ng-container matColumnDef="esMatriz">
                  <th mat-header-cell *matHeaderCellDef>Matriz</th>
                  <td mat-cell *matCellDef="let b">
                    <mat-checkbox [checked]="b.esMatriz" disabled></mat-checkbox>
                  </td>
                </ng-container>

                <ng-container matColumnDef="estado">
                  <th mat-header-cell *matHeaderCellDef>Estado</th>
                  <td mat-cell *matCellDef="let b">
                    <mat-chip [class.active-chip]="b.estado === 'ACTIVA'" [class.inactive-chip]="b.estado !== 'ACTIVA'">
                      {{ b.estado }}
                    </mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="acciones">
                  <th mat-header-cell *matHeaderCellDef>Acciones</th>
                  <td mat-cell *matCellDef="let b">
                    <button mat-icon-button color="primary" [routerLink]="['/branches', b.id, 'edit']" matTooltip="Editar">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button
                      *appRol="['SuperUsuario', 'AdministradorEmpresa']"
                      mat-icon-button
                      color="warn"
                      (click)="confirmDelete(b)"
                      matTooltip="Desactivar"
                    >
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

                @if (filteredBranches().length === 0) {
                  <tr class="mat-row">
                    <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
                      No se encontraron sucursales
                    </td>
                  </tr>
                }
              </table>
            </div>

            <mat-paginator
              [length]="totalItems()"
              [pageSize]="pageSize"
              [pageSizeOptions]="[5, 10, 25, 50]"
              (page)="onPageChange($event)"
              showFirstLastButtons
            >
            </mat-paginator>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .page-container {
      max-width: 1200px;
      margin: 24px auto;
      padding: 0 16px;
    }

    mat-card-header {
      margin-bottom: 16px;
    }

    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 280px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .table-container {
      overflow-x: auto;
    }

    .branches-table {
      width: 100%;
    }

    .no-data {
      text-align: center;
      padding: 24px;
      color: #999;
      font-style: italic;
    }

    .matriz-chip {
      margin-left: 8px;
      background: #e3f2fd !important;
      color: #1565c0 !important;
      font-size: 11px;
    }

    .active-chip {
      background: #e8f5e9 !important;
      color: #2e7d32 !important;
    }

    .inactive-chip {
      background: #fce4ec !important;
      color: #c62828 !important;
    }
  `,
})
export class BranchListPageComponent implements OnInit {
  private readonly branchesService = inject(BranchesService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  readonly branches = signal<Branch[]>([]);
  readonly loading = signal(false);
  readonly searchTerm = signal('');
  readonly totalItems = signal(0);
  readonly pageSize = 10;
  readonly currentPage = signal(0);
  readonly empresaId = signal('');

  readonly displayedColumns = ['nombre', 'direccion', 'telefono', 'esMatriz', 'estado', 'acciones'];

  readonly filteredBranches = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const all = this.branches();
    if (!term) return all;
    return all.filter(
      (b) =>
        b.nombre.toLowerCase().includes(term) ||
        (b.direccion && b.direccion.toLowerCase().includes(term)),
    );
  });

  ngOnInit(): void {
    const empresaIdParam = this.route.snapshot.queryParamMap.get('empresaId');
    if (empresaIdParam) {
      this.empresaId.set(empresaIdParam);
      this.loadBranches();
    } else {
      this.snackBar.open('Seleccione una empresa para ver sus sucursales', 'Cerrar', { duration: 5000 });
    }
  }

  private loadBranches(): void {
    this.loading.set(true);
    this.branchesService.findAll(this.empresaId()).subscribe({
      next: (res) => {
        this.branches.set(res.data);
        this.totalItems.set(res.data.length);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar sucursales', 'Cerrar', { duration: 3000 });
      },
    });
  }

  onSearch(): void {
    this.currentPage.set(0);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
  }

  confirmDelete(branch: Branch): void {
    if (branch.esMatriz) {
      this.snackBar.open('No se puede desactivar la sucursal matriz', 'Cerrar', { duration: 3000 });
      return;
    }
    const confirmed = confirm(`¿Desactivar la sucursal "${branch.nombre}"?`);
    if (!confirmed) return;

    this.branchesService.remove(branch.id).subscribe({
      next: () => {
        this.snackBar.open('Sucursal desactivada exitosamente', 'Cerrar', { duration: 3000 });
        this.loadBranches();
      },
      error: () => {
        this.snackBar.open('Error al desactivar sucursal', 'Cerrar', { duration: 3000 });
      },
    });
  }
}
