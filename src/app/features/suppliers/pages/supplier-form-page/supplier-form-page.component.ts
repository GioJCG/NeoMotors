import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BaseFormComponent } from '../../../../shared/components/base-form/base-form.component';
import { SuppliersService } from '../../services/suppliers.service';

@Component({
  selector: 'app-supplier-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    BaseFormComponent,
  ],
  template: `
    <app-base-form
      [title]="isEditMode() ? 'Editar Proveedor' : 'Nuevo Proveedor'"
      [subtitle]="isEditMode() ? 'Actualiza los datos del proveedor' : 'Registra un nuevo proveedor'"
      [formGroup]="supplierForm"
      [saving]="saving()"
      [error]="error()"
      [submitLabel]="isEditMode() ? 'Guardar cambios' : 'Crear proveedor'"
      cancelRoute="/suppliers"
      (submit)="onSubmit()"
    >
      <div class="form-row">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre del proveedor</mat-label>
          <input matInput formControlName="nombre" placeholder="Refaccionaria XYZ" />
          @if (supplierForm.get('nombre')?.hasError('required') && supplierForm.get('nombre')?.touched) {
            <mat-error>El nombre es requerido</mat-error>
          }
        </mat-form-field>
      </div>

      <div class="form-row">
        <mat-form-field appearance="outline" class="half-width">
          <mat-label>RFC</mat-label>
          <input matInput formControlName="rfc" placeholder="RFC" maxlength="13" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="half-width">
          <mat-label>Contacto</mat-label>
          <input matInput formControlName="contacto" placeholder="Nombre del contacto" />
        </mat-form-field>
      </div>

      <div class="form-row">
        <mat-form-field appearance="outline" class="half-width">
          <mat-label>Teléfono</mat-label>
          <input matInput formControlName="telefono" placeholder="3312345678" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="half-width">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email" placeholder="contacto@proveedor.com" />
        </mat-form-field>
      </div>

      <div class="form-row">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Dirección</mat-label>
          <textarea matInput formControlName="direccion" rows="2" placeholder="Dirección del proveedor"></textarea>
        </mat-form-field>
      </div>
    </app-base-form>
  `,
  styles: `
    .form-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 8px; }
    .full-width { width: 100%; }
    .half-width { flex: 1; min-width: 200px; }
  `,
})
export class SupplierFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly suppliersService = inject(SuppliersService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  readonly isEditMode = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  private supplierId: string | null = null;

  readonly supplierForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    rfc: ['', [Validators.maxLength(13)]],
    contacto: [''],
    telefono: [''],
    email: [''],
    direccion: [''],
  });

  ngOnInit(): void {
    this.supplierId = this.route.snapshot.paramMap.get('id');
    if (this.supplierId) {
      this.isEditMode.set(true);
      this.load();
    }
  }

  private load(): void {
    this.suppliersService.findById(this.supplierId!).subscribe({
      next: (res) => {
        const s = res.data;
        this.supplierForm.patchValue({
          nombre: s.nombre,
          rfc: s.rfc || '',
          contacto: s.contacto || '',
          telefono: s.telefono || '',
          email: s.email || '',
          direccion: s.direccion || '',
        });
      },
      error: () => {
        this.snackBar.open('Error al cargar proveedor', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/suppliers']);
      },
    });
  }

  onSubmit(): void {
    if (this.supplierForm.invalid) return;
    this.saving.set(true);
    this.error.set(null);

    const dto = this.supplierForm.value;
    const request = this.isEditMode()
      ? this.suppliersService.update(this.supplierId!, dto)
      : this.suppliersService.create(dto);

    request.subscribe({
      next: () => {
        this.snackBar.open(this.isEditMode() ? 'Proveedor actualizado' : 'Proveedor creado', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/suppliers']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al guardar');
        this.saving.set(false);
      },
    });
  }
}
