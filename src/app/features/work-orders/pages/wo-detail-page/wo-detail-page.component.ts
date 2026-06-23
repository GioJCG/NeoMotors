import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WorkOrdersService } from '../../services/work-orders.service';
import { WorkOrder, Diagnostico, TiempoTecnico } from '../../models/work-order.model';

@Component({
  selector: 'app-wo-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatTooltipModule,
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
            <mat-card-header><mat-card-title>Cliente</mat-card-title></mat-card-header>
            <mat-card-content>
              <p><strong>Nombre:</strong> {{ o.cliente?.nombre }}</p>
              <p><strong>Teléfono:</strong> {{ o.cliente?.telefono || 'N/A' }}</p>
              <p><strong>Email:</strong> {{ o.cliente?.email || 'N/A' }}</p>
            </mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-header><mat-card-title>Vehículo</mat-card-title></mat-card-header>
            <mat-card-content>
              <p><strong>Placa:</strong> {{ o.vehiculo?.placa }}</p>
              <p><strong>VIN:</strong> {{ o.vehiculo?.numeroSerie || 'N/A' }}</p>
              <p><strong>Marca/Modelo:</strong> {{ o.vehiculo?.marca?.nombre }} {{ o.vehiculo?.modelo?.nombre }}</p>
            </mat-card-content>
          </mat-card>
        </div>

        @if (o.recepcion) {
          <mat-card>
            <mat-card-header><mat-card-title>Recepción</mat-card-title></mat-card-header>
            <mat-card-content>
              <div class="reception-grid">
                <p><strong>Kilometraje:</strong> {{ o.recepcion.kilometraje | number }} km</p>
                <p><strong>Combustible:</strong> {{ o.recepcion.nivelCombustible }}</p>
                @if (o.recepcion.componentesFaltantes) { <p><strong>Componentes faltantes:</strong> {{ o.recepcion.componentesFaltantes }}</p> }
                @if (o.recepcion.daniosCarroceria) { <p><strong>Daños carrocería:</strong> {{ o.recepcion.daniosCarroceria }}</p> }
              </div>
              @if (o.recepcion.fotos?.length) {
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

        <!-- Diagnóstico -->
        <mat-card>
          <mat-card-header><mat-card-title>Diagnóstico Técnico</mat-card-title></mat-card-header>
          <mat-card-content>
            @if (o.estado === 'DIAGNOSTICO') {
              <div class="diagnose-form">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Síntomas</mat-label>
                  <textarea matInput [(ngModel)]="diagnoseForm.sintomas" rows="2" placeholder="Ruido al frenar, vibración en volante..."></textarea>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Fallas Encontradas</mat-label>
                  <textarea matInput [(ngModel)]="diagnoseForm.fallasEncontradas" rows="2" placeholder="Pastillas de freno desgastadas..."></textarea>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Desgastes de Piezas</mat-label>
                  <textarea matInput [(ngModel)]="diagnoseForm.desgastesPiezas" rows="2" placeholder="Pastillas al 10%, neumáticos lisos..."></textarea>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Conclusión</mat-label>
                  <textarea matInput [(ngModel)]="diagnoseForm.conclusion" rows="2" placeholder="Se requiere reemplazo de..."></textarea>
                </mat-form-field>
                <button mat-flat-button color="primary" (click)="submitDiagnose()" [disabled]="savingDiagnose()">
                  {{ savingDiagnose() ? 'Guardando...' : 'Guardar Diagnóstico' }}
                </button>
              </div>
            } @else {
              <p class="muted">La orden debe estar en estado <strong>DIAGNÓSTICO</strong> para registrar.</p>
            }

            @if (diagnosticos().length > 0) {
              <mat-divider class="section-divider"></mat-divider>
              <h3>Historial de Diagnósticos</h3>
              @for (d of diagnosticos(); track d.id) {
                <mat-card class="diagnostico-card" appearance="outlined">
                  <mat-card-content>
                    <p class="diagnostico-meta">{{ d.createdAt | date:'dd/MM/yyyy HH:mm' }} - {{ d.tecnico?.nombre || 'N/A' }}</p>
                    @if (d.sintomas) { <p><strong>Síntomas:</strong> {{ d.sintomas }}</p> }
                    @if (d.fallasEncontradas) { <p><strong>Fallas:</strong> {{ d.fallasEncontradas }}</p> }
                    @if (d.desgastesPiezas) { <p><strong>Desgastes:</strong> {{ d.desgastesPiezas }}</p> }
                    @if (d.conclusion) { <p><strong>Conclusión:</strong> {{ d.conclusion }}</p> }
                  </mat-card-content>
                </mat-card>
              }
            }
          </mat-card-content>
        </mat-card>

        <!-- Control de Tiempos -->
        <mat-card>
          <mat-card-header><mat-card-title>Control de Tiempos</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="timer-controls">
              @if (timeState() === 'idle') {
                <button mat-flat-button color="primary" (click)="trackTime('start')">
                  <mat-icon>play_arrow</mat-icon> Iniciar
                </button>
              } @else if (timeState() === 'running') {
                <button mat-flat-button color="accent" (click)="trackTime('pause')">
                  <mat-icon>pause</mat-icon> Pausar
                </button>
                <button mat-stroked-button color="warn" (click)="trackTime('stop')">
                  <mat-icon>stop</mat-icon> Detener
                </button>
              } @else if (timeState() === 'paused') {
                <button mat-flat-button color="primary" (click)="trackTime('resume')">
                  <mat-icon>play_arrow</mat-icon> Reanudar
                </button>
                <button mat-stroked-button color="warn" (click)="trackTime('stop')">
                  <mat-icon>stop</mat-icon> Detener
                </button>
              }
              <span class="timer-display">{{ formattedTime() }}</span>
            </div>

            @if (timeRecords().length > 0) {
              <mat-divider class="section-divider"></mat-divider>
              <h3>Registros de Tiempo</h3>
              <table class="time-table">
                <thead>
                  <tr><th>Técnico</th><th>Inicio</th><th>Fin</th><th>Duración</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  @for (r of timeRecords(); track r.id) {
                    <tr>
                      <td>{{ r.tecnico?.nombre || 'N/A' }}</td>
                      <td>{{ r.horaInicio | date:'dd/MM HH:mm' }}</td>
                      <td>{{ r.horaFin ? (r.horaFin | date:'dd/MM HH:mm') : '—' }}</td>
                      <td>{{ getDuration(r) }}</td>
                      <td>
                        <mat-chip [style.background]="r.estado === 'ACTIVO' ? '#e8f5e9' : '#f5f5f5'" [style.color]="r.estado === 'ACTIVO' ? '#2e7d32' : '#333'">
                          {{ r.estado }}
                        </mat-chip>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </mat-card-content>
        </mat-card>

        <div class="actions">
          <a mat-button routerLink="/work-orders">← Volver a órdenes</a>
        </div>
      } @else {
        <div class="loading">Cargando...</div>
      }
    </div>
  `,
  styles: `
    .detail-page { max-width: 1000px; margin: 24px auto; padding: 0 16px; }
    .header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 500; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .reception-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .foto-grid { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px; }
    .foto-thumb { width: 200px; height: 150px; object-fit: cover; border-radius: 8px; border: 1px solid #e0e0e0; }
    .loading { text-align: center; padding: 48px; color: #999; }
    .actions { margin-top: 16px; }
    .muted { color: #999; font-style: italic; }
    .section-divider { margin: 16px 0; }
    .diagnose-form { display: flex; flex-direction: column; gap: 12px; }
    .diagnostico-card { margin-bottom: 12px; }
    .diagnostico-meta { font-size: 12px; color: #666; margin-bottom: 8px; }
    .timer-controls { display: flex; align-items: center; gap: 12px; }
    .timer-display { font-size: 24px; font-weight: 600; font-family: monospace; margin-left: 16px; }
    .time-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    .time-table th, .time-table td { text-align: left; padding: 8px; border-bottom: 1px solid #e0e0e0; font-size: 13px; }
    .time-table th { font-weight: 600; color: #666; }
    @media (max-width: 600px) { .grid { grid-template-columns: 1fr; } .reception-grid { grid-template-columns: 1fr; } }
  `,
})
export class WoDetailPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly workOrdersService = inject(WorkOrdersService);
  private readonly snackBar = inject(MatSnackBar);

  readonly orden = signal<WorkOrder | null>(null);
  readonly diagnosticos = signal<Diagnostico[]>([]);
  readonly timeRecords = signal<TiempoTecnico[]>([]);
  readonly savingDiagnose = signal(false);
  readonly timeState = signal<'idle' | 'running' | 'paused'>('idle');
  readonly formattedTime = signal('00:00:00');

  diagnoseForm = { sintomas: '', fallasEncontradas: '', desgastesPiezas: '', conclusion: '' };
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private timerStart: Date | null = null;
  private elapsedPaused = 0;
  private ordenId = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.ordenId = id;
      this.load(id);
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  private load(id: string): void {
    this.workOrdersService.findById(id).subscribe({
      next: (res) => {
        this.orden.set(res.data);
        this.loadDiagnosticos(id);
        this.loadTimeRecords(id);
      },
      error: () => this.snackBar.open('Error al cargar la orden de trabajo', 'Cerrar', { duration: 3000 }),
    });
  }

  private loadDiagnosticos(id: string): void {
    this.workOrdersService.getDiagnosticos(id).subscribe({
      next: (res) => this.diagnosticos.set(res.data),
    });
  }

  private loadTimeRecords(id: string): void {
    this.workOrdersService.getTimeRecords(id).subscribe({
      next: (res) => {
        this.timeRecords.set(res.data);
        const active = res.data.find((r) => r.estado === 'ACTIVO' && r.tecnicoId === 'current');
        if (active) {
          this.timeState.set('running');
          this.startTimer(new Date(active.horaInicio));
        }
      },
    });
  }

  submitDiagnose(): void {
    if (!this.diagnoseForm.sintomas && !this.diagnoseForm.fallasEncontradas && !this.diagnoseForm.desgastesPiezas) {
      this.snackBar.open('Complete al menos un campo del diagnóstico', 'Cerrar', { duration: 3000 });
      return;
    }

    this.savingDiagnose.set(true);
    this.workOrdersService.diagnose(this.ordenId, this.diagnoseForm).subscribe({
      next: () => {
        this.snackBar.open('Diagnóstico guardado exitosamente', 'Cerrar', { duration: 3000 });
        this.diagnoseForm = { sintomas: '', fallasEncontradas: '', desgastesPiezas: '', conclusion: '' };
        this.loadDiagnosticos(this.ordenId);
        this.savingDiagnose.set(false);
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al guardar diagnóstico', 'Cerrar', { duration: 3000 });
        this.savingDiagnose.set(false);
      },
    });
  }

  trackTime(action: 'start' | 'pause' | 'resume' | 'stop'): void {
    this.workOrdersService.trackTime(this.ordenId, action).subscribe({
      next: () => {
        if (action === 'start' || action === 'resume') {
          this.timeState.set('running');
          this.startTimer(new Date());
        } else if (action === 'pause') {
          this.timeState.set('paused');
          this.elapsedPaused += this.getCurrentElapsed();
          this.stopTimer();
        } else if (action === 'stop') {
          this.timeState.set('idle');
          this.elapsedPaused = 0;
          this.stopTimer();
          this.formattedTime.set('00:00:00');
        }
        this.loadTimeRecords(this.ordenId);
      },
      error: (err) => this.snackBar.open(err.error?.message || 'Error en control de tiempo', 'Cerrar', { duration: 3000 }),
    });
  }

  private startTimer(from: Date): void {
    this.timerStart = from;
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      const total = this.elapsedPaused + (Date.now() - this.timerStart!.getTime());
      const h = Math.floor(total / 3600000);
      const m = Math.floor((total % 3600000) / 60000);
      const s = Math.floor((total % 60000) / 1000);
      this.formattedTime.set(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private getCurrentElapsed(): number {
    if (!this.timerStart) return 0;
    return Date.now() - this.timerStart.getTime();
  }

  getDuration(r: TiempoTecnico): string {
    if (!r.horaFin) return '—';
    const diff = new Date(r.horaFin).getTime() - new Date(r.horaInicio).getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  }

  getChipBg(estado: string): string {
    const colors: Record<string, string> = {
      RECIBIDO: '#e3f2fd', DIAGNOSTICO: '#fff3e0', PRESUPUESTADO: '#fce4ec',
      APROBADO: '#e8f5e9', TRABAJANDO: '#f3e5f5', TERMINADO: '#e8f5e9', ENTREGADO: '#e0f2f1',
    };
    return colors[estado] || '#f5f5f5';
  }

  getChipColor(estado: string): string {
    const colors: Record<string, string> = {
      RECIBIDO: '#1565c0', DIAGNOSTICO: '#e65100', PRESUPUESTADO: '#c62828',
      APROBADO: '#2e7d32', TRABAJANDO: '#6a1b9a', TERMINADO: '#1b5e20', ENTREGADO: '#004d40',
    };
    return colors[estado] || '#333';
  }
}
