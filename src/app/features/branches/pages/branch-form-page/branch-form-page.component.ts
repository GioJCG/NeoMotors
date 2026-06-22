import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { BranchesService } from '../../services/branches.service';

@Component({
  selector: 'app-branch-form-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ isEditMode() ? 'Editar Sucursal' : 'Nueva Sucursal' }}</mat-card-title>
          <mat-card-subtitle>
            {{ isEditMode() ? 'Actualiza los datos de la sucursal' : 'Registra una nueva sucursal' }}
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="branchForm" (ngSubmit)="onSubmit()" class="branch-form">
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

            <div class="form-row checkbox-row">
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

            @if (error(); as err) {
              <div class="error-message">
                <mat-icon color="warn">error</mat-icon>
                <span>{{ err }}</span>
              </div>
            }

            <div class="form-actions">
              <button mat-stroked-button type="button" [routerLink]="['/branches']" [queryParams]="{ empresaId: empresaId() }">
                Cancelar
              </button>
              <button mat-flat-button color="primary" type="submit" [disabled]="branchForm.invalid || saving()">
                @if (saving()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  {{ isEditMode() ? 'Guardar cambios' : 'Crear sucursal' }}
                }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .form-container {
      max-width: 700px;
      margin: 24px auto;
      padding: 0 16px;
    }

    mat-card-header {
      margin-bottom: 16px;
    }

    .branch-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      flex: 1;
      min-width: 200px;
    }

    .checkbox-row {
      margin: 8px 0;
    }

    .section-divider {
      margin: 16px 0;
    }

    .section-title {
      font-size: 16px;
      font-weight: 500;
      color: #666;
      margin: 0 0 8px;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: #fce4ec;
      border-radius: 4px;
      color: #c62828;
      font-size: 14px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;
    }

    .form-actions button mat-spinner {
      display: inline-block;
    }
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
        const b = res.data;
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
    if (this.branchForm.invalid) return;

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
