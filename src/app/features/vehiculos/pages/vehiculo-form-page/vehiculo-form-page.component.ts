import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { BaseFormComponent } from '../../../../shared/components/base-form/base-form.component';
import { VehiculosService } from '../../services/vehiculos.service';
import { ClientesService } from '../../../clientes/services/clientes.service';
import { Cliente } from '../../../clientes/models/cliente.model';
import { Marca, Modelo } from '../../models/vehiculo.model';

@Component({
  selector: 'app-vehiculo-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    BaseFormComponent,
  ],
  template: `
    <app-base-form
      [title]="(isEditMode() ? 'Editar Vehículo' : 'Nuevo Vehículo')"
      [subtitle]="(isEditMode() ? 'Actualiza los datos del vehículo' : 'Registra un nuevo vehículo')"
      [formGroup]="vehiculoForm"
      [saving]="saving()"
      [error]="error()"
      [submitLabel]="(isEditMode() ? 'Guardar cambios' : 'Crear vehículo')"
      cancelRoute="/vehicles"
      (submit)="onSubmit()"
    >
      <div class="form-row">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Cliente</mat-label>
          <mat-select formControlName="clienteId">
            @for (c of clientes(); track c.id) {
              <mat-option [value]="c.id">{{ c.nombre }} {{ c.rfc ? '(' + c.rfc + ')' : '' }}</mat-option>
            }
          </mat-select>
          @if (vehiculoForm.get('clienteId')?.hasError('required') && vehiculoForm.get('clienteId')?.touched) {
            <mat-error>El cliente es requerido</mat-error>
          }
        </mat-form-field>
      </div>

      <div class="form-row">
        <mat-form-field appearance="outline" class="half-width">
          <mat-label>Marca</mat-label>
          <mat-select formControlName="marcaId" (selectionChange)="onMarcaChange($event.value)">
            @if (marcas().length === 0) {
              <mat-option value="" disabled>No hay marcas disponibles</mat-option>
            }
            @for (m of marcas(); track m.id) {
              <mat-option [value]="m.id">{{ m.nombre }}</mat-option>
            }
          </mat-select>
          @if (vehiculoForm.get('marcaId')?.hasError('required') && vehiculoForm.get('marcaId')?.touched) {
            <mat-error>La marca es requerida</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="half-width">
          <mat-label>Modelo</mat-label>
          <mat-select formControlName="modeloId">
            @if (modelos().length === 0) {
              <mat-option value="" disabled>No hay modelos disponibles</mat-option>
            }
            @for (m of modelos(); track m.id) {
              <mat-option [value]="m.id">{{ m.nombre }}</mat-option>
            }
          </mat-select>
          @if (vehiculoForm.get('modeloId')?.hasError('required') && vehiculoForm.get('modeloId')?.touched) {
            <mat-error>El modelo es requerido</mat-error>
          }
        </mat-form-field>
      </div>

      <div class="form-row">
        <mat-form-field appearance="outline" class="half-width">
          <mat-label>Placa</mat-label>
          <input matInput formControlName="placa" placeholder="ABC-1234" />
          @if (vehiculoForm.get('placa')?.hasError('required') && vehiculoForm.get('placa')?.touched) {
            <mat-error>La placa es requerida</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="half-width">
          <mat-label>Número de Serie (VIN)</mat-label>
          <input matInput formControlName="numeroSerie" placeholder="3HGCM82633A123456" />
        </mat-form-field>
      </div>

      <div class="form-row">
        <mat-form-field appearance="outline" class="half-width">
          <mat-label>Año</mat-label>
          <input matInput formControlName="anio" type="number" placeholder="2024" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="half-width">
          <mat-label>Color</mat-label>
          <input matInput formControlName="color" placeholder="Rojo" />
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
export class VehiculoFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly vehiculosService = inject(VehiculosService);
  private readonly clientesService = inject(ClientesService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  readonly isEditMode = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly clientes = signal<Cliente[]>([]);
  readonly marcas = signal<Marca[]>([]);
  readonly modelos = signal<Modelo[]>([]);
  private vehiculoId: string | null = null;

  readonly vehiculoForm: FormGroup = this.fb.group({
    clienteId: ['', [Validators.required]],
    marcaId: ['', [Validators.required]],
    modeloId: ['', [Validators.required]],
    placa: ['', [Validators.required]],
    numeroSerie: [''],
    anio: [''],
    color: [''],
  });

  ngOnInit(): void {
    this.loadClientes();
    this.loadMarcas();

    this.vehiculoId = this.route.snapshot.paramMap.get('id');
    if (this.vehiculoId) {
      this.isEditMode.set(true);
      this.loadVehiculo(this.vehiculoId);
    }
  }

  private loadClientes(): void {
    this.clientesService.findAll().subscribe({
      next: (res) => this.clientes.set((res ?? []).filter((c) => c.estado === 'ACTIVO')),
    });
  }

  private loadMarcas(): void {
    this.vehiculosService.findAllMarcas().subscribe({
      next: (res) => this.marcas.set(res ?? []),
      error: (err) => {
        console.error('Error al cargar marcas:', err);
        this.snackBar.open('Error al cargar marcas', 'Cerrar', { duration: 3000 });
      },
    });
  }

  onMarcaChange(marcaId: string): void {
    this.vehiculoForm.patchValue({ modeloId: '' });
    this.modelos.set([]);
    if (marcaId) {
      this.vehiculosService.findModelosByMarca(marcaId).subscribe({
        next: (res) => this.modelos.set(res ?? []),
        error: (err) => {
          console.error('Error al cargar modelos:', err);
          this.snackBar.open('Error al cargar modelos', 'Cerrar', { duration: 3000 });
        },
      });
    }
  }

  private loadVehiculo(id: string): void {
    this.vehiculosService.findById(id).subscribe({
      next: (v) => {
        this.vehiculoForm.patchValue({
          clienteId: v.clienteId,
          marcaId: v.marcaId,
          modeloId: v.modeloId,
          placa: v.placa,
          numeroSerie: v.numeroSerie || '',
          anio: v.anio || '',
          color: v.color || '',
        });
        if (v.marcaId) {
          this.onMarcaChange(v.marcaId);
        }
      },
      error: () => {
        this.snackBar.open('Error al cargar el vehículo', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/vehicles']);
      },
    });
  }

  onSubmit(): void {
    if (this.vehiculoForm.invalid) return;

    this.saving.set(true);
    this.error.set(null);

    const dto = this.vehiculoForm.value;

    const request = this.isEditMode()
      ? this.vehiculosService.update(this.vehiculoId!, dto)
      : this.vehiculosService.create(dto);

    request.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEditMode() ? 'Vehículo actualizado exitosamente' : 'Vehículo creado exitosamente',
          'Cerrar',
          { duration: 3000 },
        );
        this.router.navigate(['/vehicles']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al guardar el vehículo');
        this.saving.set(false);
      },
    });
  }
}
