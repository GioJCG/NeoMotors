import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseListComponent, BaseColumnDef } from '../../../../shared/components/base-list/base-list.component';
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
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    BaseListComponent,
    RolDirective,
  ],
  template: `
    <app-base-list
      title="Empresas"
      subtitle="Gestión de empresas del sistema"
      [columns]="columns"
      [data]="companies()"
      [totalItems]="companies().length"
      [loading]="loading()"
      [searchTerm]="searchTerm()"
      searchPlaceholder="Nombre, RFC o Razón Social"
      emptyMessage="No se encontraron empresas"
      [pageSize]="pageSize"
      (searchTermChange)="onSearch($event)"
      (pageChange)="onPageChange($event)"
    >


      <ng-template #actions let-company>
        <button mat-icon-button color="primary" [routerLink]="['/companies', company.id, 'edit']" matTooltip="Editar">
          <mat-icon>edit</mat-icon>
        </button>
        <button
          *appRol="['SuperUsuario']"
          mat-icon-button
          color="warn"
          (click)="confirmDelete(company)"
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
export class CompanyListPageComponent implements OnInit {
  private readonly companiesService = inject(CompaniesService);
  private readonly userService = inject(UserService);
  private readonly snackBar = inject(MatSnackBar);

  readonly columns: BaseColumnDef[] = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'rfc', label: 'RFC' },
    { key: 'razonSocial', label: 'Razón Social' },
    { key: 'regimenFiscal', label: 'Régimen Fiscal' },
    {
      key: 'estado',
      label: 'Estado',
      type: 'chip',
      chipColor: (value: string) =>
        value === 'ACTIVA'
          ? { bg: '#e8f5e9', color: '#2e7d32' }
          : { bg: '#fce4ec', color: '#c62828' },
    },
  ];

  readonly companies = signal<Company[]>([]);
  readonly loading = signal(false);
  readonly searchTerm = signal('');
  readonly totalItems = signal(0);
  readonly pageSize = 10;

  ngOnInit(): void {
    this.loadCompanies();
  }

  private loadCompanies(): void {
    this.loading.set(true);
    this.companiesService.findAll().subscribe({
      next: (res) => {
        this.companies.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar empresas', 'Cerrar', { duration: 3000 });
      },
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.companies.set(
      this.companies().filter(
        (c) =>
          !term ||
          c.nombre.toLowerCase().includes(term.toLowerCase()) ||
          c.rfc.toLowerCase().includes(term.toLowerCase()) ||
          c.razonSocial.toLowerCase().includes(term.toLowerCase()),
      ),
    );
  }

  onPageChange(_event: any): void {
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
