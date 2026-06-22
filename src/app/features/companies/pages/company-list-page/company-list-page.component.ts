import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CompaniesService } from '../../services/companies.service';
import { Company } from '../../models/company.model';
import { UserService } from '../../../../core/services/user.service';
import { RolDirective } from '../../../../core/directives/rol.directive';

@Component({
  selector: 'app-company-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
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
    MatDialogModule,
    RolDirective,
  ],
  template: `
    <div class="page-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Empresas</mat-card-title>
          <mat-card-subtitle>Gestión de empresas del sistema</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="toolbar">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Buscar empresas</mat-label>
              <input matInput [(ngModel)]="searchTerm" (input)="onSearch()" placeholder="Nombre, RFC o Razón Social" />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <button
              *appRol="['SuperUsuario']"
              mat-flat-button
              color="primary"
              routerLink="/companies/new"
            >
              <mat-icon>add</mat-icon>
              Nueva Empresa
            </button>
          </div>

          @if (loading()) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else {
            <div class="table-container">
              <table mat-table [dataSource]="filteredCompanies()" class="companies-table">
                <ng-container matColumnDef="nombre">
                  <th mat-header-cell *matHeaderCellDef>Nombre</th>
                  <td mat-cell *matCellDef="let c">{{ c.nombre }}</td>
                </ng-container>

                <ng-container matColumnDef="rfc">
                  <th mat-header-cell *matHeaderCellDef>RFC</th>
                  <td mat-cell *matCellDef="let c">
                    <code>{{ c.rfc }}</code>
                  </td>
                </ng-container>

                <ng-container matColumnDef="razonSocial">
                  <th mat-header-cell *matHeaderCellDef>Razón Social</th>
                  <td mat-cell *matCellDef="let c">{{ c.razonSocial }}</td>
                </ng-container>

                <ng-container matColumnDef="regimenFiscal">
                  <th mat-header-cell *matHeaderCellDef>Régimen Fiscal</th>
                  <td mat-cell *matCellDef="let c">{{ c.regimenFiscal }}</td>
                </ng-container>

                <ng-container matColumnDef="estado">
                  <th mat-header-cell *matHeaderCellDef>Estado</th>
                  <td mat-cell *matCellDef="let c">
                    <mat-chip [class.active-chip]="c.estado === 'ACTIVA'" [class.inactive-chip]="c.estado !== 'ACTIVA'">
                      {{ c.estado }}
                    </mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="acciones">
                  <th mat-header-cell *matHeaderCellDef>Acciones</th>
                  <td mat-cell *matCellDef="let c">
                    <button mat-icon-button color="primary" [routerLink]="['/companies', c.id, 'edit']" matTooltip="Editar">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button
                      *appRol="['SuperUsuario']"
                      mat-icon-button
                      color="warn"
                      (click)="confirmDelete(c)"
                      matTooltip="Desactivar"
                    >
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

                @if (filteredCompanies().length === 0) {
                  <tr class="mat-row">
                    <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
                      No se encontraron empresas
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

    .companies-table {
      width: 100%;
    }

    .companies-table code {
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 13px;
    }

    .no-data {
      text-align: center;
      padding: 24px;
      color: #999;
      font-style: italic;
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
export class CompanyListPageComponent implements OnInit {
  private readonly companiesService = inject(CompaniesService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly companies = signal<Company[]>([]);
  readonly loading = signal(false);
  readonly searchTerm = signal('');
  readonly totalItems = signal(0);
  readonly pageSize = 10;
  readonly currentPage = signal(0);

  readonly displayedColumns = ['nombre', 'rfc', 'razonSocial', 'regimenFiscal', 'estado', 'acciones'];

  readonly filteredCompanies = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const all = this.companies();
    if (!term) return all;
    return all.filter(
      (c) =>
        c.nombre.toLowerCase().includes(term) ||
        c.rfc.toLowerCase().includes(term) ||
        c.razonSocial.toLowerCase().includes(term),
    );
  });

  ngOnInit(): void {
    this.loadCompanies();
  }

  private loadCompanies(): void {
    this.loading.set(true);
    this.companiesService.findAll().subscribe({
      next: (res) => {
        this.companies.set(res.data);
        this.totalItems.set(res.data.length);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar empresas', 'Cerrar', { duration: 3000 });
      },
    });
  }

  onSearch(): void {
    this.currentPage.set(0);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
  }

  confirmDelete(company: Company): void {
    const confirmed = confirm(`¿Desactivar la empresa "${company.nombre}"?`);
    if (!confirmed) return;

    this.companiesService.remove(company.id).subscribe({
      next: () => {
        this.snackBar.open('Empresa desactivada exitosamente', 'Cerrar', { duration: 3000 });
        this.loadCompanies();
      },
      error: () => {
        this.snackBar.open('Error al desactivar empresa', 'Cerrar', { duration: 3000 });
      },
    });
  }
}
