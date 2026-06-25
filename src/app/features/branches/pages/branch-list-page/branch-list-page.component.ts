import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseListComponent, BaseColumnDef } from '../../../../shared/components/base-list/base-list.component';
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
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    BaseListComponent,
    RolDirective,
  ],
  template: `
    <app-base-list
      title="Sucursales"
      subtitle="Gestión de sucursales de la empresa"
      [columns]="columns"
      [data]="branches()"
      [totalItems]="branches().length"
      [loading]="loading()"
      [searchTerm]="searchTerm()"
      searchPlaceholder="Nombre o dirección"
      emptyMessage="No se encontraron sucursales"
      [pageSize]="pageSize"
      (searchTermChange)="onSearch($event)"
      (pageChange)="onPageChange($event)"
    >
      <button
        toolbar-actions
        *appRol="['SuperUsuario', 'AdministradorEmpresa']"
        mat-flat-button
        color="primary"
        [routerLink]="['/branches/new']"
        [queryParams]="{ empresaId: empresaId() }"
      >
        <mat-icon>add</mat-icon>
        Nueva Sucursal
      </button>

      <ng-template #actions let-branch>
        <button mat-icon-button color="primary" [routerLink]="['/branches', branch.id, 'edit']" matTooltip="Editar">
          <mat-icon>edit</mat-icon>
        </button>
        <button
          *appRol="['SuperUsuario', 'AdministradorEmpresa']"
          mat-icon-button
          color="warn"
          (click)="confirmDelete(branch)"
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
export class BranchListPageComponent implements OnInit {
  private readonly branchesService = inject(BranchesService);
  private readonly userService = inject(UserService);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  readonly columns: BaseColumnDef[] = [
    {
      key: 'nombre',
      label: 'Nombre',
    },
    { key: 'direccion', label: 'Dirección' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'esMatriz', label: 'Matriz', type: 'checkbox' },
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

  readonly branches = signal<Branch[]>([]);
  private readonly allBranches = signal<Branch[]>([]);
  readonly loading = signal(false);
  readonly searchTerm = signal('');
  readonly pageSize = 10;
  readonly empresaId = signal('');

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
        const data = res ?? [];
        this.allBranches.set(data);
        this.branches.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar sucursales', 'Cerrar', { duration: 3000 });
      },
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    if (!term) {
      this.branches.set(this.allBranches());
    } else {
      this.branches.set(
        this.allBranches().filter(
          (b) =>
            b.nombre.toLowerCase().includes(term.toLowerCase()) ||
            (b.direccion && b.direccion.toLowerCase().includes(term.toLowerCase())),
        ),
      );
    }
  }

  onPageChange(_event: any): void {
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
