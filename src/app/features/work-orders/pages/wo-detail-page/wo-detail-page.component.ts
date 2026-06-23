import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { WorkOrdersService } from '../../services/work-orders.service';
import { WorkOrder } from '../../models/work-order.model';

@Component({
  selector: 'app-wo-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="detail-page">
      @if (orden(); as o) {
        <div class="header">
          <h1>Orden: {{ o.folio }}</h1>
          <mat-chip [style.background]="getChipBg(o.estado)" [style.color]="getChipColor(o.estado)">
            {{ o.estado }}
          </mat-chip>
        </div>

        <div class="grid">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Cliente</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p><strong>Nombre:</strong> {{ o.cliente?.nombre }}</p>
              <p><strong>Teléfono:</strong> {{ o.cliente?.telefono || 'N/A' }}</p>
              <p><strong>Email:</strong> {{ o.cliente?.email || 'N/A' }}</p>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>Vehículo</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p><strong>Placa:</strong> {{ o.vehiculo?.placa }}</p>
              <p><strong>VIN:</strong> {{ o.vehiculo?.numeroSerie || 'N/A' }}</p>
              <p><strong>Marca/Modelo:</strong> {{ o.vehiculo?.marca?.nombre }} {{ o.vehiculo?.modelo?.nombre }}</p>
            </mat-card-content>
          </mat-card>
        </div>

        @if (o.recepcion) {
          <mat-card>
            <mat-card-header>
              <mat-card-title>Recepción</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="reception-grid">
                <p><strong>Kilometraje:</strong> {{ o.recepcion.kilometraje | number }} km</p>
                <p><strong>Combustible:</strong> {{ o.recepcion.nivelCombustible }}</p>
                @if (o.recepcion.componentesFaltantes) {
                  <p><strong>Componentes faltantes:</strong> {{ o.recepcion.componentesFaltantes }}</p>
                }
                @if (o.recepcion.daniosCarroceria) {
                  <p><strong>Daños carrocería:</strong> {{ o.recepcion.daniosCarroceria }}</p>
                }
              </div>
              @if (o.recepcion.fotos && o.recepcion.fotos.length > 0) {
                <div class="fotos">
                  <p><strong>Fotografías:</strong></p>
                  <div class="foto-grid">
                    @for (foto of o.recepcion.fotos; track foto.id) {
                      <img [src]="foto.url" alt="Foto {{ foto.orden + 1 }}" class="foto-thumb" />
                    }
                  </div>
                </div>
              }
            </mat-card-content>
          </mat-card>
        }

        <div class="actions">
          <a mat-button routerLink="/work-orders">← Volver a órdenes</a>
        </div>
      } @else {
        <div class="loading">Cargando...</div>
      }
    </div>
  `,
  styles: `
    .detail-page {
      max-width: 1000px;
      margin: 24px auto;
      padding: 0 16px;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .reception-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .fotos {
      margin-top: 16px;
    }

    .foto-grid {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 8px;
    }

    .foto-thumb {
      width: 200px;
      height: 150px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }

    .loading {
      text-align: center;
      padding: 48px;
      color: #999;
    }

    .actions {
      margin-top: 16px;
    }

    @media (max-width: 600px) {
      .grid { grid-template-columns: 1fr; }
      .reception-grid { grid-template-columns: 1fr; }
    }
  `,
})
export class WoDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly workOrdersService = inject(WorkOrdersService);
  private readonly snackBar = inject(MatSnackBar);

  readonly orden = signal<WorkOrder | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.load(id);
    }
  }

  private load(id: string): void {
    this.workOrdersService.findById(id).subscribe({
      next: (res) => this.orden.set(res.data),
      error: () => {
        this.snackBar.open('Error al cargar la orden de trabajo', 'Cerrar', { duration: 3000 });
      },
    });
  }

  getChipBg(estado: string): string {
    const colors: Record<string, string> = {
      RECIBIDO: '#e3f2fd',
      DIAGNOSTICO: '#fff3e0',
      PRESUPUESTADO: '#fce4ec',
      APROBADO: '#e8f5e9',
      TRABAJANDO: '#f3e5f5',
      TERMINADO: '#e8f5e9',
      ENTREGADO: '#e0f2f1',
    };
    return colors[estado] || '#f5f5f5';
  }

  getChipColor(estado: string): string {
    const colors: Record<string, string> = {
      RECIBIDO: '#1565c0',
      DIAGNOSTICO: '#e65100',
      PRESUPUESTADO: '#c62828',
      APROBADO: '#2e7d32',
      TRABAJANDO: '#6a1b9a',
      TERMINADO: '#1b5e20',
      ENTREGADO: '#004d40',
    };
    return colors[estado] || '#333';
  }
}
