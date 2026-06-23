import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { BaseFormComponent } from '../../../../shared/components/base-form/base-form.component';
import { ClientesService } from '../../services/clientes.service';

@Component({
  selector: 'app-cliente-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    BaseFormComponent,
  ],
  template: `
    <app-base-form
      [title]="(isEditMode() ? 'Editar Cliente' : 'Nuevo Cliente')"
      [subtitle]="(isEditMode() ? 'Actualiza los datos del cliente' : 'Registra un nuevo cliente')"
      [formGroup]="clienteForm"
      [saving]="saving()"
      [error]="error()"
      [submitLabel]="(isEditMode() ? 'Guardar cambios' : 'Crear cliente')"
      cancelRoute="/customers"
      (submit)="onSubmit()"
    >
      <div class="form-row">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre del cliente</mat-label>
          <input matInput formControlName="nombre" placeholder="Juan Pérez" />
          @if (clienteForm.get('nombre')?.hasError('required') && clienteForm.get('nombre')?.touched) {
            <mat-error>El nombre es requerido</mat-error>
          }
        </mat-form-field>
      </div>

      <div class="form-row">
        <mat-form-field appearance="outline" class="half-width">
          <mat-label>RFC</mat-label>
          <input matInput formControlName="rfc" placeholder="PEPJ800101ABC" maxlength="13" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="half-width">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email" placeholder="juan@example.com" />
        </mat-form-field>
      </div>

      <div class="form-row">
        <mat-form-field appearance="outline" class="half-width">
          <mat-label>Teléfono</mat-label>
          <input matInput formControlName="telefono" placeholder="3312345678" />
        </mat-form-field>
      </div>

      <div class="form-row">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Dirección</mat-label>
          <input matInput formControlName="direccion" placeholder="Av. Principal #123, Col. Centro" />
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
  `,
})
export class ClienteFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly clientesService = inject(ClientesService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  readonly isEditMode = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  private clienteId: string | null = null;

  readonly clienteForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    rfc: ['', [Validators.maxLength(13)]],
    email: [''],
    telefono: [''],
    direccion: [''],
  });

  ngOnInit(): void {
    this.clienteId = this.route.snapshot.paramMap.get('id');
    if (this.clienteId) {
      this.isEditMode.set(true);
      this.loadCliente(this.clienteId);
    }
  }

  private loadCliente(id: string): void {
    this.clientesService.findById(id).subscribe({
      next: (res) => {
        const c = res.data;
        this.clienteForm.patchValue({
          nombre: c.nombre,
          rfc: c.rfc || '',
          email: c.email || '',
          telefono: c.telefono || '',
          direccion: c.direccion || '',
        });
      },
      error: () => {
        this.snackBar.open('Error al cargar el cliente', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/customers']);
      },
    });
  }

  onSubmit(): void {
    if (this.clienteForm.invalid) return;

    this.saving.set(true);
    this.error.set(null);

    const dto = this.clienteForm.value;

    const request = this.isEditMode()
      ? this.clientesService.update(this.clienteId!, dto)
      : this.clientesService.create(dto);

    request.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEditMode() ? 'Cliente actualizado exitosamente' : 'Cliente creado exitosamente',
          'Cerrar',
          { duration: 3000 },
        );
        this.router.navigate(['/customers']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al guardar el cliente');
        this.saving.set(false);
      },
    });
  }
}
