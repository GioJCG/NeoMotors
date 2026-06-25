import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { CitasService } from '../../services/citas.service';
import { ClientesService } from '../../../clientes/services/clientes.service';
import { VehiculosService } from '../../../vehiculos/services/vehiculos.service';
import { Cita, CreateCitaRequest } from '../../models/cita.model';
import { Cliente } from '../../../clientes/models/cliente.model';
import { Vehiculo } from '../../../vehiculos/models/vehiculo.model';

@Component({
  selector: 'app-cita-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>
      @if (mode === 'create') { Nueva Cita }
      @else if (mode === 'edit') { Editar Cita }
      @else { Detalle de Cita }
    </h2>

    <mat-dialog-content>
      @if (mode === 'view') {
        <div class="detail">
          <p><strong>Cliente:</strong> {{ data.cita?.cliente?.nombre }}</p>
          <p><strong>Vehículo:</strong> {{ data.cita?.vehiculo?.placa }} ({{ data.cita?.vehiculo?.marca?.nombre }} {{ data.cita?.vehiculo?.modelo?.nombre }})</p>
          <p><strong>Fecha:</strong> {{ data.cita?.fecha | date:'dd/MM/yyyy' }}</p>
          <p><strong>Hora:</strong> {{ data.cita?.hora }}</p>
          <p><strong>Estado:</strong> {{ data.cita?.estado }}</p>
          @if (data.cita?.notas) {
            <p><strong>Notas:</strong> {{ data.cita?.notas }}</p>
          }
        </div>
      } @else {
        <div class="form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Cliente</mat-label>
            <mat-select [(ngModel)]="form.clienteId" (selectionChange)="onClienteChange($event.value)">
              @for (c of clientes(); track c.id) {
                <mat-option [value]="c.id">{{ c.nombre }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Vehículo</mat-label>
            <mat-select [(ngModel)]="form.vehiculoId">
              @for (v of vehiculos(); track v.id) {
                <mat-option [value]="v.id">{{ v.placa }} - {{ v.marca?.nombre }} {{ v.modelo?.nombre }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <div class="row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Fecha</mat-label>
              <input matInput [matDatepicker]="picker" [(ngModel)]="form.fechaDate" />
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Hora</mat-label>
              <input matInput type="time" [(ngModel)]="form.hora" />
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Notas</mat-label>
            <textarea matInput [(ngModel)]="form.notas" rows="3"></textarea>
          </mat-form-field>
        </div>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      @if (mode === 'view') {
        <button mat-button (click)="close()">Cerrar</button>
        <button mat-button color="primary" (click)="close('edit')">Editar</button>
        <button mat-button color="warn" (click)="close('delete')">Cancelar Cita</button>
      } @else {
        <button mat-button (click)="close()">Cancelar</button>
        <button mat-flat-button color="primary" (click)="save()" [disabled]="saving()">
          {{ saving() ? 'Guardando...' : (mode === 'edit' ? 'Guardar cambios' : 'Crear cita') }}
        </button>
      }
    </mat-dialog-actions>
  `,
  styles: `
    .detail p { margin: 8px 0; }
    .form { display: flex; flex-direction: column; gap: 16px; padding-top: 8px; }
    .row { display: flex; gap: 16px; }
    .full-width { width: 100%; }
    .half-width { flex: 1; }
  `,
})
export class CitaDialogComponent implements OnInit {
  private readonly citasService = inject(CitasService);
  private readonly clientesService = inject(ClientesService);
  private readonly vehiculosService = inject(VehiculosService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<CitaDialogComponent>);

  readonly clientes = signal<Cliente[]>([]);
  readonly vehiculos = signal<Vehiculo[]>([]);
  readonly saving = signal(false);

  mode: string;
  form: {
    clienteId: string;
    vehiculoId: string;
    fechaDate: Date | null;
    hora: string;
    notas: string;
  };

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.mode = data.mode;
    this.form = {
      clienteId: data.cita?.clienteId || '',
      vehiculoId: data.cita?.vehiculoId || '',
      fechaDate: data.defaultFecha ? new Date(data.defaultFecha) : (data.cita ? new Date(data.cita.fecha) : null),
      hora: data.cita?.hora || data.defaultHora || '',
      notas: data.cita?.notas || '',
    };
  }

  ngOnInit(): void {
    this.loadClientes();
    this.loadVehiculos();
  }

  private loadClientes(): void {
    this.clientesService.findAll().subscribe({
      next: (res) => this.clientes.set((res ?? []).filter((c) => c.estado === 'ACTIVO')),
    });
  }

  private loadVehiculos(): void {
    this.vehiculosService.findAll().subscribe({
      next: (res) => this.vehiculos.set((res ?? []).filter((v) => v.estado === 'ACTIVO')),
    });
  }

  onClienteChange(clienteId: string): void {
    this.form.vehiculoId = '';
  }

  save(): void {
    if (!this.form.clienteId || !this.form.vehiculoId || !this.form.fechaDate || !this.form.hora) {
      this.snackBar.open('Complete todos los campos requeridos', 'Cerrar', { duration: 3000 });
      return;
    }

    this.saving.set(true);
    const dto: CreateCitaRequest = {
      clienteId: this.form.clienteId,
      vehiculoId: this.form.vehiculoId,
      fecha: this.form.fechaDate.toISOString(),
      hora: this.form.hora + ':00',
      notas: this.form.notas || undefined,
    };

    const request = this.mode === 'edit' && this.data.cita?.id
      ? this.citasService.update(this.data.cita.id, dto)
      : this.citasService.create(dto);

    request.subscribe({
      next: () => {
        this.snackBar.open(
          this.mode === 'edit' ? 'Cita actualizada exitosamente' : 'Cita creada exitosamente',
          'Cerrar',
          { duration: 3000 },
        );
        this.dialogRef.close(true);
      },
      error: () => {
        this.snackBar.open('Error al guardar la cita', 'Cerrar', { duration: 3000 });
        this.saving.set(false);
      },
    });
  }

  close(result?: any): void {
    this.dialogRef.close(result);
  }
}
