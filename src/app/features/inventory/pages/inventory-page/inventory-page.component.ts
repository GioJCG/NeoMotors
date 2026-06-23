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
import { InventoryService } from '../../services/inventory.service';
import { PartsService } from '../../../parts/services/parts.service';
import { InventoryItem, InventoryMovement } from '../../models/inventory.model';
import { Part } from '../../../parts/models/part.model';

@Component({
  selector: 'app-inventory-page',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatCardModule, MatDividerModule,
    MatTabsModule, MatTooltipModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Inventario</h1>
        <p class="subtitle">Control de existencias por sucursal</p>
      </div>

      <mat-tab-group dynamicHeight>
        <mat-tab label="Existencias">
          <div class="tab-content">
            <div class="toolbar">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Buscar refacción</mat-label>
                <input matInput (input)="filterStock($event)" placeholder="Nombre o código" />
              </mat-form-field>
              <span class="chip alert-chip" matTooltip="Refacciones con stock bajo o sin existencias">
                {{ stockAlerts().length }} alertas
              </span>
            </div>

            <table class="inv-table" matSort>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Refacción</th>
                  <th>Sucursal</th>
                  <th>Stock Actual</th>
                  <th>Stock Mínimo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                @for (item of filteredStock(); track item.id) {
                  <tr [class.stock-bajo]="item.stockBajo">
                    <td>{{ item.refaccion.codigo }}</td>
                    <td>{{ item.refaccion.nombre }}</td>
                    <td>{{ item.sucursal.nombre }}</td>
                    <td [class.warning]="item.stockActual <= item.stockMinimo && item.stockMinimo > 0">
                      {{ item.stockActual }}
                    </td>
                    <td>{{ item.stockMinimo }}</td>
                    <td>
                      @if (item.stockBajo) {
                        <span class="badge badge-warning">Stock Bajo</span>
                      } @else if (item.stockActual === 0) {
                        <span class="badge badge-danger">Sin Stock</span>
                      } @else {
                        <span class="badge badge-ok">Disponible</span>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="6" class="empty-msg">No hay registros de inventario</td></tr>
                }
              </tbody>
            </table>
          </div>
        </mat-tab>

        <mat-tab label="Movimientos">
          <div class="tab-content">
            <table class="inv-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Refacción</th>
                  <th>Sucursal</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Stock Anterior</th>
                  <th>Stock Nuevo</th>
                  <th>Referencia</th>
                </tr>
              </thead>
              <tbody>
                @for (m of movements(); track m.id) {
                  <tr>
                    <td>{{ m.createdAt | date:'short' }}</td>
                    <td>{{ m.refaccion.nombre }}</td>
                    <td>{{ m.sucursal.nombre }}</td>
                    <td>{{ m.tipo }}</td>
                    <td [class.positive]="m.cantidad > 0" [class.negative]="m.cantidad < 0">{{ m.cantidad }}</td>
                    <td>{{ m.stockAnterior }}</td>
                    <td>{{ m.stockNuevo }}</td>
                    <td>{{ m.referencia || '-' }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="8" class="empty-msg">Sin movimientos</td></tr>
                }
              </tbody>
            </table>
          </div>
        </mat-tab>

        <mat-tab label="Ajustar Stock">
          <div class="tab-content form-tab">
            <h3>Ajuste de Inventario</h3>

            <form [formGroup]="adjustForm" (ngSubmit)="onAdjust()" class="adjust-form">
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Refacción</mat-label>
                  <mat-select formControlName="refaccionId">
                    @for (p of parts(); track p.id) {
                      <mat-option [value]="p.id">{{ p.codigo }} — {{ p.nombre }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Tipo</mat-label>
                  <mat-select formControlName="tipo">
                    <mat-option value="ENTRADA_POR_COMPRA">Entrada por Compra</mat-option>
                    <mat-option value="SALIDA_POR_ORDEN">Salida por Orden</mat-option>
                    <mat-option value="AJUSTE_INVENTARIO">Ajuste de Inventario</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="third-width">
                  <mat-label>Cantidad</mat-label>
                  <input matInput type="number" min="1" formControlName="cantidad" />
                  @if (adjustForm.get('cantidad')?.hasError('required') && adjustForm.get('cantidad')?.touched) {
                    <mat-error>Requerido</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="third-width">
                  <mat-label>Stock Mínimo</mat-label>
                  <input matInput type="number" min="0" formControlName="stockMinimo" placeholder="0" />
                </mat-form-field>

                <mat-form-field appearance="outline" class="third-width">
                  <mat-label>Referencia</mat-label>
                  <input matInput formControlName="referencia" placeholder="Folio o motivo" />
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Observaciones</mat-label>
                  <input matInput formControlName="observaciones" />
                </mat-form-field>
              </div>

              <button mat-flat-button color="primary" type="submit" [disabled]="adjustForm.invalid || adjusting()">
                {{ adjusting() ? 'Ajustando...' : 'Realizar Ajuste' }}
              </button>
            </form>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: `
    .page { max-width: 1200px; margin: 24px auto; padding: 0 16px; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 24px; font-weight: 500; }
    .subtitle { margin: 4px 0 0; color: #666; font-size: 14px; }
    .tab-content { padding: 16px 0; }
    .form-tab { max-width: 700px; }
    .toolbar { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
    .search-field { flex: 1; max-width: 400px; }
    .alert-chip { padding: 4px 12px; border-radius: 16px; background: #fff3e0; color: #e65100; font-size: 13px; font-weight: 500; }
    .inv-table { width: 100%; border-collapse: collapse; }
    .inv-table th, .inv-table td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #e0e0e0; font-size: 14px; }
    .inv-table th { font-weight: 600; color: #555; background: #fafafa; }
    .inv-table tbody tr:hover { background: #f5f5f5; }
    .stock-bajo { background: #fff8e1; }
    .warning { color: #e65100; font-weight: 500; }
    .badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .badge-ok { background: #e8f5e9; color: #2e7d32; }
    .badge-warning { background: #fff3e0; color: #e65100; }
    .badge-danger { background: #fce4ec; color: #c62828; }
    .positive { color: #2e7d32; font-weight: 500; }
    .negative { color: #c62828; font-weight: 500; }
    .empty-msg { text-align: center; color: #999; padding: 32px; }
    .form-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; }
    .full-width { width: 100%; }
    .half-width { flex: 1; min-width: 200px; }
    .third-width { flex: 1; min-width: 150px; }
    .adjust-form { margin-top: 16px; }
  `,
})
export class InventoryPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly inventoryService = inject(InventoryService);
  private readonly partsService = inject(PartsService);
  private readonly snackBar = inject(MatSnackBar);

  readonly stock = signal<InventoryItem[]>([]);
  readonly filteredStock = signal<InventoryItem[]>([]);
  readonly movements = signal<InventoryMovement[]>([]);
  readonly stockAlerts = signal<InventoryItem[]>([]);
  readonly parts = signal<Part[]>([]);
  readonly adjusting = signal(false);

  readonly adjustForm: FormGroup = this.fb.group({
    refaccionId: ['', Validators.required],
    tipo: ['ENTRADA_POR_COMPRA', Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    stockMinimo: [0],
    referencia: [''],
    observaciones: [''],
  });

  ngOnInit(): void {
    this.loadStock();
    this.loadMovements();
    this.loadAlerts();
    this.loadParts();
  }

  private loadStock(): void {
    this.inventoryService.getStock().subscribe({
      next: (res) => { this.stock.set(res.data); this.filteredStock.set(res.data); },
      error: () => this.snackBar.open('Error al cargar inventario', 'Cerrar', { duration: 3000 }),
    });
  }

  private loadMovements(): void {
    this.inventoryService.getMovements().subscribe({
      next: (res) => this.movements.set(res.data),
      error: () => {},
    });
  }

  private loadAlerts(): void {
    this.inventoryService.getAlerts().subscribe({
      next: (res) => this.stockAlerts.set(res.data),
      error: () => {},
    });
  }

  private loadParts(): void {
    this.partsService.findAll().subscribe({
      next: (res) => this.parts.set(res.data.filter((p) => p.estado === 'ACTIVO')),
      error: () => {},
    });
  }

  filterStock(event: Event): void {
    const term = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredStock.set(
      this.stock().filter(
        (i) => !term ||
          i.refaccion.codigo.toLowerCase().includes(term) ||
          i.refaccion.nombre.toLowerCase().includes(term),
      ),
    );
  }

  onAdjust(): void {
    if (this.adjustForm.invalid) return;
    this.adjusting.set(true);

    this.inventoryService.adjustStock({
      ...this.adjustForm.value,
      cantidad: Number(this.adjustForm.value.cantidad),
      stockMinimo: Number(this.adjustForm.value.stockMinimo) || 0,
    }).subscribe({
      next: () => {
        this.snackBar.open('Stock ajustado exitosamente', 'Cerrar', { duration: 3000 });
        this.adjusting.set(false);
        this.loadStock();
        this.loadMovements();
        this.adjustForm.patchValue({ cantidad: 1, referencia: '', observaciones: '' });
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al ajustar stock', 'Cerrar', { duration: 3000 });
        this.adjusting.set(false);
      },
    });
  }
}
