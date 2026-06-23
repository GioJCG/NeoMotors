import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { CashDeskService, CashDeskStatus } from '../../services/cash-desk.service';
import { WorkOrdersService } from '../../../work-orders/services/work-orders.service';
import { CashDesk, CashDeskMovement } from '../../models/cash-desk.model';
import { WorkOrder } from '../../../work-orders/models/work-order.model';

@Component({
  selector: 'app-cash-desk-page',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatCardModule, MatDividerModule,
    MatTabsModule, MatTooltipModule, MatListModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Caja</h1>
        <p class="subtitle">Control de aperturas, pagos y cierres</p>
      </div>

      @if (status()?.activa; as caja) {
        <mat-card appearance="outlined" class="status-card active">
          <mat-card-content>
            <div class="status-header">
              <span class="status-badge active-badge">Caja Abierta</span>
              <span class="folio">{{ caja.fechaApertura | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
            <div class="saldo-grid">
              <div class="saldo-item">
                <span class="label">Saldo Inicial</span>
                <span class="value">{{ caja.saldoInicial | number:'1.2-2' }}</span>
              </div>
              <div class="saldo-item">
                <span class="label">Saldo Actual</span>
                <span class="value accent">{{ caja.saldoActual | number:'1.2-2' }}</span>
              </div>
              <div class="saldo-item">
                <span class="label">Operador</span>
                <span class="value">{{ caja.operadorApertura?.nombre || '—' }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      } @else {
        <mat-card appearance="outlined" class="status-card inactive">
          <mat-card-content>
            <p class="no-caja">No hay caja abierta en esta sucursal</p>
          </mat-card-content>
        </mat-card>
      }

      <mat-tab-group dynamicHeight [selectedIndex]="selectedTab()" (selectedTabChange)="selectedTab.set($event.index)">
        <mat-tab label="Apertura / Cierre">
          <div class="tab-content">
            @if (!status()?.activa) {
              <mat-card appearance="outlined">
                <mat-card-header><mat-card-title>Abrir Caja</mat-card-title></mat-card-header>
                <mat-card-content>
                  <form [formGroup]="openForm" (ngSubmit)="onOpen()" class="form-inline">
                    <mat-form-field appearance="outline">
                      <mat-label>Saldo Inicial</mat-label>
                      <input matInput type="number" min="0" step="0.01" formControlName="saldoInicial" />
                      @if (openForm.get('saldoInicial')?.hasError('required') && openForm.get('saldoInicial')?.touched) {
                        <mat-error>Requerido</mat-error>
                      }
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Observaciones</mat-label>
                      <input matInput formControlName="observaciones" />
                    </mat-form-field>
                    <button mat-flat-button color="primary" type="submit" [disabled]="openForm.invalid || saving()">
                      {{ saving() ? 'Abriendo...' : 'Abrir Caja' }}
                    </button>
                  </form>
                </mat-card-content>
              </mat-card>
            } @else {
              <mat-card appearance="outlined">
                <mat-card-header><mat-card-title>Cerrar Caja</mat-card-title></mat-card-header>
                <mat-card-content>
                  <form [formGroup]="closeForm" (ngSubmit)="onClose()" class="form-inline">
                    <mat-form-field appearance="outline">
                      <mat-label>Conteo Físico</mat-label>
                      <input matInput type="number" min="0" step="0.01" formControlName="conteoFisico" />
                      @if (closeForm.get('conteoFisico')?.hasError('required') && closeForm.get('conteoFisico')?.touched) {
                        <mat-error>Requerido</mat-error>
                      }
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Observaciones</mat-label>
                      <input matInput formControlName="observaciones" />
                    </mat-form-field>
                    <button mat-flat-button color="warn" type="submit" [disabled]="closeForm.invalid || saving()">
                      {{ saving() ? 'Cerrando...' : 'Cerrar Caja' }}
                    </button>
                  </form>
                </mat-card-content>
              </mat-card>

              <mat-card appearance="outlined" class="sec-card">
                <mat-card-header><mat-card-title>Retiro / Ingreso</mat-card-title></mat-card-header>
                <mat-card-content>
                  <form [formGroup]="txForm" (ngSubmit)="onTransaction()" class="form-inline">
                    <mat-form-field appearance="outline">
                      <mat-label>Tipo</mat-label>
                      <mat-select formControlName="tipo">
                        <mat-option value="RETIRO">Retiro</mat-option>
                        <mat-option value="INGRESO">Ingreso</mat-option>
                      </mat-select>
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Monto</mat-label>
                      <input matInput type="number" min="0.01" step="0.01" formControlName="monto" />
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Motivo</mat-label>
                      <input matInput formControlName="observaciones" />
                    </mat-form-field>
                    <button mat-stroked-button color="primary" type="submit" [disabled]="txForm.invalid || saving()">
                      {{ saving() ? '...' : 'Registrar' }}
                    </button>
                  </form>
                </mat-card-content>
              </mat-card>
            }
          </div>
        </mat-tab>

        <mat-tab label="Movimientos">
          <div class="tab-content">
            <mat-list>
              @for (m of movements(); track m.id) {
                <mat-list-item>
                  <mat-icon matListItemIcon [color]="m.tipo === 'APERTURA' || m.tipo === 'PAGO' || m.tipo === 'INGRESO' ? 'primary' : 'warn'">
                    {{ m.tipo === 'APERTURA' ? 'lock_open' : m.tipo === 'CIERRE' ? 'lock' : m.tipo === 'PAGO' ? 'payments' : m.tipo === 'INGRESO' ? 'add_circle' : 'remove_circle' }}
                  </mat-icon>
                  <div matListItemTitle>
                    <span class="mov-tipo">{{ m.tipo }}</span>
                    <span class="mov-monto" [class.positive]="m.tipo !== 'RETIRO' && m.tipo !== 'CIERRE'" [class.negative]="m.tipo === 'RETIRO' || m.tipo === 'CIERRE'">
                      &#36;{{ m.monto | number:'1.2-2' }}
                    </span>
                  </div>
                    <div matListItemLine>
                      Ant: &#36;{{ m.saldoAnterior | number:'1.2-2' }} &rarr; Nuevo: &#36;{{ m.saldoNuevo | number:'1.2-2' }}
                    @if (m.observaciones) { — {{ m.observaciones }} }
                  </div>
                  <div matListItemLine class="mov-date">{{ m.createdAt | date:'dd/MM/yyyy HH:mm' }}</div>
                </mat-list-item>
                <mat-divider />
              } @empty {
                <p class="empty-msg">Sin movimientos</p>
              }
            </mat-list>
          </div>
        </mat-tab>

        <mat-tab label="Pagar Orden">
          <div class="tab-content">
            <mat-card appearance="outlined">
              <mat-card-header><mat-card-title>Registrar Pago</mat-card-title></mat-card-header>
              <mat-card-content>
                <form [formGroup]="paymentForm" (ngSubmit)="onPayment()" class="form-vertical">
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Orden de Trabajo</mat-label>
                      <mat-select formControlName="ordenTrabajoId">
                        @for (wo of workOrders(); track wo.id) {
                          <mat-option [value]="wo.id">{{ wo.folio }} — {{ wo.cliente?.nombre }}</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Monto</mat-label>
                      <input matInput type="number" min="0.01" step="0.01" formControlName="monto" />
                    </mat-form-field>
                  </div>
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Método de Pago</mat-label>
                      <mat-select formControlName="metodoPago">
                        <mat-option value="EFECTIVO">Efectivo</mat-option>
                        <mat-option value="TARJETA">Tarjeta</mat-option>
                        <mat-option value="TRANSFERENCIA">Transferencia</mat-option>
                      </mat-select>
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Referencia</mat-label>
                      <input matInput formControlName="referencia" placeholder="# de voucher" />
                    </mat-form-field>
                  </div>
                  <button mat-flat-button color="primary" type="submit" [disabled]="paymentForm.invalid || saving() || !status()?.activa">
                    {{ saving() ? 'Registrando...' : 'Registrar Pago' }}
                  </button>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <mat-tab label="Historial">
          <div class="tab-content">
            @for (c of history(); track c.id) {
              <mat-card appearance="outlined" class="hist-card">
                <mat-card-content>
                  <div class="hist-header">
                    <span class="hist-date">{{ c.fechaApertura | date:'dd/MM/yyyy' }}</span>
                    <span class="hist-diff" [class.positive]="c.diferencia && c.diferencia >= 0" [class.negative]="c.diferencia && c.diferencia < 0">
                      Diferencia: &#36;{{ c.diferencia | number:'1.2-2' }}
                    </span>
                  </div>
                  <div class="hist-grid">
                    <span>Inicial: &#36;{{ c.saldoInicial | number:'1.2-2' }}</span>
                    <span>Actual: &#36;{{ c.saldoActual | number:'1.2-2' }}</span>
                    <span>Conteo: &#36;{{ c.conteoFisico | number:'1.2-2' }}</span>
                    <span>Abrió: {{ c.operadorApertura?.nombre }}</span>
                    <span>Cerró: {{ c.operadorCierre?.nombre || '—' }}</span>
                    <span>Cierre: {{ (c.fechaCierre | date:'short') || '—' }}</span>
                  </div>
                </mat-card-content>
              </mat-card>
            } @empty {
              <p class="empty-msg">Sin historial de cierres</p>
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: `
    .page { max-width: 900px; margin: 24px auto; padding: 0 16px; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 24px; font-weight: 500; }
    .subtitle { margin: 4px 0 0; color: #666; }
    .tab-content { padding: 16px 0; }
    .status-card { margin-bottom: 16px; }
    .status-card.active { border-left: 4px solid #2e7d32; }
    .status-card.inactive { border-left: 4px solid #999; }
    .status-header { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
    .status-badge { padding: 4px 12px; border-radius: 16px; font-size: 13px; font-weight: 500; }
    .active-badge { background: #e8f5e9; color: #2e7d32; }
    .no-caja { text-align: center; color: #999; padding: 24px; margin: 0; }
    .folio { font-size: 13px; color: #666; }
    .saldo-grid { display: flex; gap: 32px; }
    .saldo-item { display: flex; flex-direction: column; }
    .saldo-item .label { font-size: 12px; color: #666; }
    .saldo-item .value { font-size: 22px; font-weight: 500; }
    .saldo-item .value.accent { color: #1565c0; }
    .form-inline { display: flex; gap: 16px; align-items: flex-start; flex-wrap: wrap; }
    .form-vertical { display: flex; flex-direction: column; gap: 16px; }
    .form-row { display: flex; gap: 16px; flex-wrap: wrap; }
    .half-width { flex: 1; min-width: 200px; }
    .sec-card { margin-top: 16px; }
    .mov-tipo { font-weight: 500; margin-right: 12px; }
    .mov-monto { font-weight: 600; }
    .positive { color: #2e7d32; }
    .negative { color: #c62828; }
    .mov-date { color: #999; font-size: 12px; }
    .empty-msg { text-align: center; color: #999; padding: 32px; }
    .hist-card { margin-bottom: 12px; }
    .hist-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .hist-date { font-weight: 500; }
    .hist-diff { font-weight: 600; }
    .hist-diff.positive { color: #2e7d32; }
    .hist-diff.negative { color: #c62828; }
    .hist-grid { display: flex; flex-wrap: wrap; gap: 12px; font-size: 13px; color: #555; }
    .hist-grid span { min-width: 120px; }
  `,
})
export class CashDeskPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cashDeskService = inject(CashDeskService);
  private readonly workOrdersService = inject(WorkOrdersService);
  private readonly snackBar = inject(MatSnackBar);

  readonly status = signal<CashDeskStatus | null>(null);
  readonly movements = signal<CashDeskMovement[]>([]);
  readonly history = signal<CashDesk[]>([]);
  readonly workOrders = signal<WorkOrder[]>([]);
  readonly saving = signal(false);
  readonly selectedTab = signal(0);

  readonly openForm: FormGroup = this.fb.group({
    saldoInicial: [0, [Validators.required, Validators.min(0.01)]],
    observaciones: [''],
  });

  readonly closeForm: FormGroup = this.fb.group({
    conteoFisico: [0, [Validators.required, Validators.min(0)]],
    observaciones: [''],
  });

  readonly txForm: FormGroup = this.fb.group({
    tipo: ['RETIRO', Validators.required],
    monto: [0, [Validators.required, Validators.min(0.01)]],
    observaciones: [''],
  });

  readonly paymentForm: FormGroup = this.fb.group({
    ordenTrabajoId: ['', Validators.required],
    monto: [0, [Validators.required, Validators.min(0.01)]],
    metodoPago: ['EFECTIVO'],
    referencia: [''],
  });

  ngOnInit(): void {
    this.loadStatus();
    this.loadWorkOrders();
  }

  private loadStatus(): void {
    this.cashDeskService.getStatus().subscribe({
      next: (res) => {
        this.status.set(res.data);
        if (res.data.activa) {
          this.movements.set(res.data.activa.movimientos || []);
        }
        if (res.data.historial) {
          this.history.set(res.data.historial);
        }
      },
      error: () => this.snackBar.open('Error al cargar estado de caja', 'Cerrar', { duration: 3000 }),
    });
  }

  private loadWorkOrders(): void {
    this.workOrdersService.findAll().subscribe({
      next: (res) => this.workOrders.set(res.data.filter((wo) => wo.estado === 'FACTURADO' || wo.estado === 'TERMINADO' || wo.estado === 'APROBADO')),
      error: () => {},
    });
  }

  onOpen(): void {
    if (this.openForm.invalid) return;
    this.saving.set(true);
    this.cashDeskService.open({
      saldoInicial: Number(this.openForm.value.saldoInicial),
      observaciones: this.openForm.value.observaciones,
    }).subscribe({
      next: () => {
        this.snackBar.open('Caja abierta exitosamente', 'Cerrar', { duration: 3000 });
        this.saving.set(false);
        this.loadStatus();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al abrir caja', 'Cerrar', { duration: 3000 });
        this.saving.set(false);
      },
    });
  }

  onClose(): void {
    if (this.closeForm.invalid) return;
    this.saving.set(true);
    this.cashDeskService.close({
      conteoFisico: Number(this.closeForm.value.conteoFisico),
      observaciones: this.closeForm.value.observaciones,
    }).subscribe({
      next: () => {
        this.snackBar.open('Caja cerrada exitosamente', 'Cerrar', { duration: 3000 });
        this.saving.set(false);
        this.loadStatus();
        this.selectedTab.set(3);
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al cerrar caja', 'Cerrar', { duration: 3000 });
        this.saving.set(false);
      },
    });
  }

  onTransaction(): void {
    if (this.txForm.invalid) return;
    this.saving.set(true);
    this.cashDeskService.registerTransaction({
      tipo: this.txForm.value.tipo,
      monto: Number(this.txForm.value.monto),
      observaciones: this.txForm.value.observaciones,
    }).subscribe({
      next: () => {
        this.snackBar.open('Transacción registrada', 'Cerrar', { duration: 3000 });
        this.saving.set(false);
        this.loadStatus();
        this.txForm.patchValue({ monto: 0, observaciones: '' });
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error', 'Cerrar', { duration: 3000 });
        this.saving.set(false);
      },
    });
  }

  onPayment(): void {
    if (this.paymentForm.invalid) return;
    this.saving.set(true);
    this.cashDeskService.registerPayment({
      ordenTrabajoId: this.paymentForm.value.ordenTrabajoId,
      monto: Number(this.paymentForm.value.monto),
      metodoPago: this.paymentForm.value.metodoPago,
      referencia: this.paymentForm.value.referencia,
    }).subscribe({
      next: () => {
        this.snackBar.open('Pago registrado exitosamente', 'Cerrar', { duration: 3000 });
        this.saving.set(false);
        this.loadStatus();
        this.paymentForm.patchValue({ monto: 0, referencia: '' });
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al registrar pago', 'Cerrar', { duration: 3000 });
        this.saving.set(false);
      },
    });
  }
}
