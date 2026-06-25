import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { BaseFormComponent } from '../../../../shared/components/base-form/base-form.component';
import { BranchesService } from '../../services/branches.service';

@Component({
  selector: 'app-branch-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatDividerModule,
    MatSnackBarModule,
    BaseFormComponent,
  ],
  template: `
    <app-base-form
      [title]="(isEditMode() ? 'Editar Sucursal' : 'Nueva Sucursal')"
      [subtitle]="(isEditMode() ? 'Actualiza los datos de la sucursal' : 'Registra una nueva sucursal')"
      [formGroup]="branchForm"
      [saving]="saving()"
      [error]="error()"
      [submitLabel]="(isEditMode() ? 'Guardar cambios' : 'Crear sucursal')"
      [cancelRoute]="'/branches'"
      [cancelQueryParams]="{ empresaId: empresaId() }"
      (submit)="onSubmit()"
    >
      <div class="form-row">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre de la sucursal</mat-label>
          <input matInput formControlName="nombre" placeholder="Sucursal Centro" />
          @if (branchForm.get('nombre')?.hasError('required') && branchForm.get('nombre')?.touched) {
            <mat-error>El nombre es requerido</mat-error>
          }
        </mat-form-field>
      </div>

      <div class="form-row">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Dirección</mat-label>
          <input matInput formControlName="direccion" placeholder="Av. Principal #123, Col. Centro" />
        </mat-form-field>
      </div>

      <div class="form-row">
        <mat-form-field appearance="outline" class="half-width">
          <mat-label>Teléfono</mat-label>
          <input matInput formControlName="telefono" placeholder="3312345678" />
        </mat-form-field>
      </div>

      <div class="checkbox-row">
        <mat-checkbox formControlName="esMatriz">Sucursal Matriz / Principal</mat-checkbox>
      </div>

      <mat-divider class="section-divider"></mat-divider>
      <h3 class="section-title">Georreferenciación (opcional)</h3>

      <div class="form-row">
        <mat-form-field appearance="outline" class="half-width">
          <mat-label>Latitud</mat-label>
          <input matInput formControlName="latitud" type="number" placeholder="20.6597" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="half-width">
          <mat-label>Longitud</mat-label>
          <input matInput formControlName="longitud" type="number" placeholder="-103.3496" />
        </mat-form-field>
      </div>
    </app-base-form>
  `,
  styles: `
    .form-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .full-width { width: 100%; }
    .half-width { flex: 1; min-width: 200px; }
    .checkbox-row { margin: 8px 0; }
    .section-divider { margin: 16px 0; }
    .section-title { font-size: 16px; font-weight: 500; color: #666; margin: 0 0 8px; }
  `,
})
export class BranchFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly branchesService = inject(BranchesService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  readonly isEditMode = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly empresaId = signal('');
  private branchId: string | null = null;

  readonly branchForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    direccion: [''],
    telefono: [''],
    esMatriz: [false],
    latitud: [null],
    longitud: [null],
  });

  ngOnInit(): void {
    const queryEmpresaId = this.route.snapshot.queryParamMap.get('empresaId');
    if (queryEmpresaId) {
      this.empresaId.set(queryEmpresaId);
    }

    this.branchId = this.route.snapshot.paramMap.get('id');
    if (this.branchId) {
      this.isEditMode.set(true);
      this.loadBranch(this.branchId);
    }
  }

  private loadBranch(id: string): void {
    this.branchesService.findById(id).subscribe({
      next: (res) => {
        const b = res;
        this.empresaId.set(b.empresaId);
        this.branchForm.patchValue({
          nombre: b.nombre,
          direccion: b.direccion || '',
          telefono: b.telefono || '',
          esMatriz: b.esMatriz,
          latitud: b.latitud,
          longitud: b.longitud,
        });
      },
      error: () => {
        this.snackBar.open('Error al cargar la sucursal', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/branches'], { queryParams: { empresaId: this.empresaId() } });
      },
    });
  }

  onSubmit(): void {
    if (this.branchForm.invalid || this.saving()) return;

    this.saving.set(true);
    this.error.set(null);

    const dto = this.branchForm.value;

    const request = this.isEditMode()
      ? this.branchesService.update(this.branchId!, dto)
      : this.branchesService.create(this.empresaId(), dto);

    request.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEditMode() ? 'Sucursal actualizada exitosamente' : 'Sucursal creada exitosamente',
          'Cerrar',
          { duration: 3000 },
        );
        this.router.navigate(['/branches'], { queryParams: { empresaId: this.empresaId() } });
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al guardar la sucursal');
        this.saving.set(false);
      },
    });
  }
}
