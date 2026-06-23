import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BaseFormComponent } from '../../../../shared/components/base-form/base-form.component';
import { PartsService } from '../../services/parts.service';

@Component({
  selector: 'app-parts-form-page',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSnackBarModule, MatButtonModule, MatIconModule, BaseFormComponent,
  ],
  template: `
    <app-base-form
      [title]="isEditMode() ? 'Editar Refacción' : 'Nueva Refacción'"
      [subtitle]="isEditMode() ? 'Actualiza los datos de la refacción' : 'Registra una nueva refacción o material'"
      [formGroup]="partsForm"
      [saving]="saving()"
      [error]="error()"
      [submitLabel]="isEditMode() ? 'Guardar cambios' : 'Crear refacción'"
      cancelRoute="/parts"
      (submit)="onSubmit()"
    >
      <div class="form-row">
        <mat-form-field appearance="outline" class="half-width">
          <mat-label>Código</mat-label>
          <input matInput formControlName="codigo" placeholder="REF-001" />
          @if (partsForm.get('codigo')?.hasError('required') && partsForm.get('codigo')?.touched) {
            <mat-error>Requerido</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline" class="half-width">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" placeholder="Filtro de aceite" />
          @if (partsForm.get('nombre')?.hasError('required') && partsForm.get('nombre')?.touched) {
            <mat-error>Requerido</mat-error>
          }
        </mat-form-field>
      </div>

      <div class="form-row">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="descripcion" rows="2" placeholder="Descripción detallada"></textarea>
        </mat-form-field>
      </div>

      <div class="form-row">
        <mat-form-field appearance="outline" class="third-width">
          <mat-label>Unidad</mat-label>
          <mat-select formControlName="unidad">
            <mat-option value="PIEZA">Pieza</mat-option>
            <mat-option value="LITRO">Litro</mat-option>
            <mat-option value="KILO">Kilogramo</mat-option>
            <mat-option value="METRO">Metro</mat-option>
            <mat-option value="SERVICIO">Servicio</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="third-width">
          <mat-label>Precio de venta</mat-label>
          <input matInput type="number" min="0" step="0.01" formControlName="precio" placeholder="0.00" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="third-width">
          <mat-label>Costo</mat-label>
          <input matInput type="number" min="0" step="0.01" formControlName="costo" placeholder="0.00" />
        </mat-form-field>
      </div>
    </app-base-form>
  `,
  styles: `
    .form-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 8px; }
    .full-width { width: 100%; }
    .half-width { flex: 1; min-width: 200px; }
    .third-width { flex: 1; min-width: 150px; }
  `,
})
export class PartsFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly partsService = inject(PartsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  readonly isEditMode = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  private partId: string | null = null;

  readonly partsForm: FormGroup = this.fb.group({
    codigo: ['', [Validators.required]],
    nombre: ['', [Validators.required]],
    descripcion: [''],
    unidad: ['PIEZA'],
    precio: [0, [Validators.min(0)]],
    costo: [0, [Validators.min(0)]],
  });

  ngOnInit(): void {
    this.partId = this.route.snapshot.paramMap.get('id');
    if (this.partId) {
      this.isEditMode.set(true);
      this.load();
    }
  }

  private load(): void {
    this.partsService.findById(this.partId!).subscribe({
      next: (res) => {
        const p = res.data;
        this.partsForm.patchValue({
          codigo: p.codigo,
          nombre: p.nombre,
          descripcion: p.descripcion || '',
          unidad: p.unidad,
          precio: p.precio,
          costo: p.costo,
        });
      },
      error: () => {
        this.snackBar.open('Error al cargar refacción', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/parts']);
      },
    });
  }

  onSubmit(): void {
    if (this.partsForm.invalid) return;
    this.saving.set(true);
    this.error.set(null);

    const dto = {
      ...this.partsForm.value,
      precio: Number(this.partsForm.value.precio) || 0,
      costo: Number(this.partsForm.value.costo) || 0,
    };

    const request = this.isEditMode()
      ? this.partsService.update(this.partId!, dto)
      : this.partsService.create(dto);

    request.subscribe({
      next: () => {
        this.snackBar.open(this.isEditMode() ? 'Refacción actualizada' : 'Refacción creada', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/parts']);
      },
      error: (err) => { this.error.set(err.error?.message || 'Error al guardar'); this.saving.set(false); },
    });
  }
}
