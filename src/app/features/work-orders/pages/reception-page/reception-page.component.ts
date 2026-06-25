import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WorkOrdersService } from '../../services/work-orders.service';
import { ClientesService } from '../../../clientes/services/clientes.service';
import { VehiculosService } from '../../../vehiculos/services/vehiculos.service';
import { Cliente } from '../../../clientes/models/cliente.model';
import { Vehiculo } from '../../../vehiculos/models/vehiculo.model';

@Component({
  selector: 'app-reception-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatTooltipModule,
  ],
  template: `
    <div class="reception-page">
      <div class="header">
        <h1>Recepción de Vehículo</h1>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Cliente</mat-label>
                <mat-select [(ngModel)]="form.clienteId" (selectionChange)="onClienteChange($event.value)">
                  @for (c of clientes(); track c.id) {
                    <mat-option [value]="c.id">{{ c.nombre }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Vehículo</mat-label>
                <mat-select [(ngModel)]="form.vehiculoId">
                  @for (v of vehiculos(); track v.id) {
                    <mat-option [value]="v.id">{{ v.placa }} - {{ v.marca?.nombre }} {{ v.modelo?.nombre }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Kilometraje</mat-label>
                <input matInput type="number" [(ngModel)]="form.kilometraje" placeholder="45000" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Nivel de Combustible</mat-label>
                <mat-select [(ngModel)]="form.nivelCombustible">
                  <mat-option value="VACIO">Vacío</mat-option>
                  <mat-option value="1/4">1/4</mat-option>
                  <mat-option value="1/2">1/2</mat-option>
                  <mat-option value="3/4">3/4</mat-option>
                  <mat-option value="LLENO">Lleno</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Componentes Faltantes</mat-label>
                <input matInput [(ngModel)]="componentesText" placeholder="Espejo retrovisor izquierdo, Tapa de gasolina, ..." />
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Daños en la Carrocería</mat-label>
                <textarea matInput [(ngModel)]="form.daniosCarroceria" rows="3" placeholder="Rayón en puerta del conductor, abolladura en defensa trasera..."></textarea>
              </mat-form-field>
            </div>

            <div class="form-row">
              <label class="photo-label">Fotografías de Evidencia (máx. 4)</label>
              <div class="photo-grid">
                @for (photo of photos(); track photo.index) {
                  <div class="photo-item" [class.has-image]="photo.dataUrl">
                    @if (photo.dataUrl) {
                      <img [src]="photo.dataUrl" alt="Foto {{ photo.index + 1 }}" />
                      <button class="photo-remove" mat-icon-button color="warn" (click)="removePhoto(photo.index)">
                        <mat-icon>close</mat-icon>
                      </button>
                    } @else {
                      <button class="photo-add" mat-flat-button color="primary" (click)="triggerCamera(photo.index)">
                        <mat-icon>camera_alt</mat-icon>
                        Foto {{ photo.index + 1 }}
                      </button>
                    }
                  </div>
                }
              </div>
              <input
                #fileInput
                type="file"
                accept="image/*"
                capture="environment"
                style="display:none"
                (change)="onFileSelected($event)"
              />
              <span class="photo-hint">Haz clic en "Foto N" para tomar o seleccionar una imagen</span>
            </div>
          </div>
        </mat-card-content>

        <mat-card-actions align="end">
          <button mat-button (click)="cancel()">Cancelar</button>
          <button mat-flat-button color="primary" (click)="submit()" [disabled]="saving()">
            @if (saving()) {
              Guardando...
            } @else {
              Registrar Recepción
            }
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: `
    .reception-page {
      max-width: 800px;
      margin: 24px auto;
      padding: 0 16px;
    }

    .header {
      margin-bottom: 16px;
    }

    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }

    .form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 8px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .full-width { width: 100%; }
    .half-width { flex: 1; min-width: 200px; }

    .photo-label {
      font-size: 14px;
      font-weight: 500;
      color: rgba(0,0,0,0.6);
      margin-bottom: 8px;
      width: 100%;
    }

    .photo-grid {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      width: 100%;
    }

    .photo-item {
      width: 140px;
      height: 140px;
      border: 2px dashed #ccc;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      background: #fafafa;
    }

    .photo-item.has-image {
      border-style: solid;
      border-color: #4caf50;
    }

    .photo-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .photo-add {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .photo-remove {
      position: absolute;
      top: 2px;
      right: 2px;
      --mdc-icon-button-size: 28px;
    }

    .photo-hint {
      font-size: 12px;
      color: #999;
      width: 100%;
    }

    mat-card-actions {
      padding: 16px;
      gap: 8px;
    }
  `,
})
export class ReceptionPageComponent implements OnInit {
  private readonly workOrdersService = inject(WorkOrdersService);
  private readonly clientesService = inject(ClientesService);
  private readonly vehiculosService = inject(VehiculosService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  readonly clientes = signal<Cliente[]>([]);
  readonly vehiculos = signal<Vehiculo[]>([]);
  readonly photos = signal<{ index: number; dataUrl: string | null }[]>(
    Array.from({ length: 4 }, (_, i) => ({ index: i, dataUrl: null })),
  );
  readonly saving = signal(false);

  componentesText = '';
  private activePhotoIndex = 0;

  form = {
    clienteId: '',
    vehiculoId: '',
    kilometraje: null as number | null,
    nivelCombustible: '',
    daniosCarroceria: '',
  };

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

  triggerCamera(index: number): void {
    this.activePhotoIndex = index;
    const fileInput = document.querySelector<HTMLInputElement>('#fileInput');
    fileInput?.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      this.photos.update((photos) =>
        photos.map((p) => (p.index === this.activePhotoIndex ? { ...p, dataUrl } : p)),
      );
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  removePhoto(index: number): void {
    this.photos.update((photos) =>
      photos.map((p) => (p.index === index ? { ...p, dataUrl: null } : p)),
    );
  }

  submit(): void {
    if (!this.form.clienteId || !this.form.vehiculoId || !this.form.kilometraje || !this.form.nivelCombustible) {
      this.snackBar.open('Complete los campos requeridos: Cliente, Vehículo, Kilometraje y Combustible', 'Cerrar', { duration: 4000 });
      return;
    }

    this.saving.set(true);

    const componentes = this.componentesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const fotos = this.photos()
      .filter((p) => p.dataUrl)
      .map((p) => p.dataUrl!);

    const dto = {
      clienteId: this.form.clienteId,
      vehiculoId: this.form.vehiculoId,
      kilometraje: this.form.kilometraje,
      nivelCombustible: this.form.nivelCombustible,
      componentesFaltantes: componentes.length > 0 ? componentes : undefined,
      daniosCarroceria: this.form.daniosCarroceria || undefined,
      fotos: fotos.length > 0 ? fotos : undefined,
    };

    this.workOrdersService.createReception(dto).subscribe({
      next: (res) => {
        this.snackBar.open(`Recepción registrada exitosamente - Folio: ${res.data.folio}`, 'Cerrar', { duration: 5000 });
        this.router.navigate(['/work-orders', res.data.workOrder.id]);
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al registrar la recepción', 'Cerrar', { duration: 3000 });
        this.saving.set(false);
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/work-orders']);
  }
}
