import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PurchaseOrdersService } from '../../services/purchase-orders.service';
import { SuppliersService } from '../../../suppliers/services/suppliers.service';
import { PurchaseOrder } from '../../models/purchase-order.model';
import { Supplier } from '../../../suppliers/models/supplier.model';

@Component({
  selector: 'app-po-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <button mat-icon-button (click)="goBack()" matTooltip="Regresar">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1>{{ isEditMode() ? 'Editar Orden de Compra' : 'Nueva Orden de Compra' }}</h1>
          <p class="subtitle">
            {{ isEditMode() ? 'Actualiza conceptos o estado' : 'Registra una compra a proveedor' }}
          </p>
        </div>
        <span class="spacer"></span>
        @if (order()) {
          <span
            class="status-badge"
            [style.background]="statusColor(order()!.estado).bg"
            [style.color]="statusColor(order()!.estado).color"
          >
            {{ order()!.estado }}
          </span>
        }
      </div>

      <mat-card appearance="outlined">
        <mat-card-content>
          <form [formGroup]="poForm">
            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Proveedor</mat-label>
                <mat-select formControlName="proveedorId">
                  @for (s of suppliers(); track s.id) {
                    <mat-option [value]="s.id" [disabled]="isEditMode()">
                      {{ s.nombre }}
                    </mat-option>
                  }
                </mat-select>
                @if (poForm.get('proveedorId')?.hasError('required') && poForm.get('proveedorId')?.touched) {
                  <mat-error>Requerido</mat-error>
                }
              </mat-form-field>

              @if (order()?.folio) {
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Folio</mat-label>
                  <input matInput [value]="order()!.folio" disabled />
                </mat-form-field>
              }
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Descripción</mat-label>
                <textarea matInput formControlName="descripcion" rows="2" placeholder="Notas de la orden"></textarea>
              </mat-form-field>
            </div>

            <mat-divider class="section-divider"></mat-divider>

            <div class="section-header">
              <h2>Detalles</h2>
              @if (canEdit()) {
                <button mat-stroked-button color="primary" type="button" (click)="addRow()">
                  <mat-icon>add</mat-icon>
                  Agregar concepto
                </button>
              }
            </div>

            <div formArrayName="detalles" class="detalles-list">
              @for (row of rows.controls; track row; let i = $index) {
                <div class="detalle-row" [formGroupName]="i">
                  <mat-form-field appearance="outline" class="desc-field">
                    <mat-label>Descripción</mat-label>
                    <input matInput formControlName="descripcion" placeholder="Refacción o material" [disabled]="!canEdit()" />
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="num-field">
                    <mat-label>Cant.</mat-label>
                    <input matInput type="number" min="1" formControlName="cantidad" (input)="calcRow(i)" [disabled]="!canEdit()" />
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="num-field">
                    <mat-label>P. Unitario</mat-label>
                    <input matInput type="number" min="0" step="0.01" formControlName="precioUnitario" (input)="calcRow(i)" [disabled]="!canEdit()" />
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="num-field">
                    <mat-label>Desc. %</mat-label>
                    <input matInput type="number" min="0" max="100" formControlName="descuento" (input)="calcRow(i)" [disabled]="!canEdit()" />
                  </mat-form-field>

                  <div class="calc-fields">
                    <mat-form-field appearance="outline" class="calc-field">
                      <mat-label>Subtotal</mat-label>
                      <input matInput [value]="getRowCalc(i).subtotal | number:'1.2-2'" disabled />
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="calc-field">
                      <mat-label>IVA</mat-label>
                      <input matInput [value]="getRowCalc(i).iva | number:'1.2-2'" disabled />
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="calc-field">
                      <mat-label>Total</mat-label>
                      <input matInput [value]="getRowCalc(i).total | number:'1.2-2'" disabled />
                    </mat-form-field>
                  </div>

                  @if (canEdit()) {
                    <button mat-icon-button color="warn" type="button" (click)="removeRow(i)" matTooltip="Eliminar">
                      <mat-icon>delete</mat-icon>
                    </button>
                  }
                </div>
              }
            </div>

            @if (rows.length === 0) {
              <p class="empty-msg">Agrega al menos un concepto</p>
            }

            <mat-divider class="section-divider"></mat-divider>

            <div class="totals">
              <div class="total-row"><span>Subtotal</span><span class="total-value">{{ subtotal() | number:'1.2-2' }}</span></div>
              <div class="total-row"><span>IVA (16%)</span><span class="total-value">{{ iva() | number:'1.2-2' }}</span></div>
              <mat-divider></mat-divider>
              <div class="total-row total-final"><span>TOTAL</span><span class="total-value">{{ total() | number:'1.2-2' }}</span></div>
            </div>

            @if (isEditMode() && canEdit()) {
              <mat-divider class="section-divider"></mat-divider>
              <div class="actions-section">
                <h3>Cambiar Estado</h3>
                <div class="status-actions">
                  @if (order()?.estado === 'BORRADOR') {
                    <button mat-flat-button color="primary" type="button" (click)="changeStatus('ENVIADA')">
                      <mat-icon>send</mat-icon> Enviar
                    </button>
                    <button mat-flat-button color="warn" type="button" (click)="changeStatus('CANCELADA')">
                      <mat-icon>cancel</mat-icon> Cancelar
                    </button>
                  }
                  @if (order()?.estado === 'ENVIADA') {
                    <button mat-flat-button color="primary" type="button" (click)="changeStatus('RECIBIDA')">
                      <mat-icon>inventory</mat-icon> Marcar como Recibida
                    </button>
                    <button mat-flat-button color="warn" type="button" (click)="changeStatus('CANCELADA')">
                      <mat-icon>cancel</mat-icon> Cancelar
                    </button>
                  }
                </div>
              </div>
            }
          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <button mat-stroked-button type="button" (click)="goBack()">Cancelar</button>
          @if (canEdit()) {
            <button mat-flat-button color="primary" (click)="onSubmit()" [disabled]="poForm.invalid || saving()">
              {{ saving() ? 'Guardando...' : (isEditMode() ? 'Guardar Cambios' : 'Crear Orden') }}
            </button>
          }
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: `
    .page { max-width: 1200px; margin: 24px auto; padding: 0 16px; }
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 24px; font-weight: 500; }
    .subtitle { margin: 4px 0 0; color: #666; font-size: 14px; }
    .spacer { flex: 1; }
    .status-badge { padding: 4px 12px; border-radius: 16px; font-size: 13px; font-weight: 500; }
    .form-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 8px; }
    .full-width { width: 100%; }
    .half-width { flex: 1; min-width: 250px; }
    .section-divider { margin: 24px 0; }
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .section-header h2 { margin: 0; font-size: 18px; font-weight: 500; }
    .detalles-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
    .detalle-row { display: flex; gap: 8px; align-items: flex-start; flex-wrap: wrap; padding: 12px; border: 1px solid #e0e0e0; border-radius: 8px; }
    .desc-field { flex: 1; min-width: 180px; }
    .num-field { width: 90px; }
    .calc-fields { display: flex; gap: 8px; }
    .calc-field { width: 110px; }
    .calc-field ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
    .num-field ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
    .desc-field ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
    .empty-msg { text-align: center; color: #999; padding: 32px; }
    .totals { max-width: 360px; margin-left: auto; }
    .total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; }
    .total-value { font-weight: 500; }
    .total-final { font-size: 20px; font-weight: 600; padding: 8px 0; }
    .actions-section { margin-top: 16px; }
    .actions-section h3 { margin: 0 0 12px; font-size: 16px; font-weight: 500; }
    .status-actions { display: flex; gap: 12px; }
  `,
})
export class PoFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly poService = inject(PurchaseOrdersService);
  private readonly suppliersService = inject(SuppliersService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  readonly isEditMode = signal(false);
  readonly saving = signal(false);
  readonly order = signal<PurchaseOrder | null>(null);
  readonly suppliers = signal<Supplier[]>([]);

  readonly subtotal = signal(0);
  readonly iva = signal(0);
  readonly total = signal(0);
  private rowCalcs = signal<Record<number, { subtotal: number; iva: number; total: number }>>({});

  readonly poForm: FormGroup = this.fb.group({
    proveedorId: ['', Validators.required],
    descripcion: [''],
    detalles: this.fb.array([]),
  });

  get rows(): FormArray { return this.poForm.get('detalles') as FormArray; }

  readonly IVA_RATE = 0.16;
  private poId: string | null = null;

  ngOnInit(): void {
    this.poId = this.route.snapshot.paramMap.get('id');
    this.loadSuppliers();
    if (this.poId) {
      this.isEditMode.set(true);
      this.load();
    } else {
      this.addRow();
    }
  }

  canEdit(): boolean {
    const o = this.order();
    return !o || o.estado === 'BORRADOR';
  }

  statusColor(estado: string): { bg: string; color: string } {
    const colors: Record<string, { bg: string; color: string }> = {
      BORRADOR: { bg: '#f5f5f5', color: '#616161' },
      ENVIADA: { bg: '#e3f2fd', color: '#1565c0' },
      RECIBIDA: { bg: '#e8f5e9', color: '#2e7d32' },
      CANCELADA: { bg: '#fce4ec', color: '#c62828' },
    };
    return colors[estado] || { bg: '#f5f5f5', color: '#333' };
  }

  private loadSuppliers(): void {
    this.suppliersService.findAll().subscribe({
      next: (res) => this.suppliers.set(res.data.filter((s) => s.estado === 'ACTIVO')),
      error: () => this.snackBar.open('Error al cargar proveedores', 'Cerrar', { duration: 3000 }),
    });
  }

  private load(): void {
    this.poService.findById(this.poId!).subscribe({
      next: (res) => {
        const o = res.data;
        this.order.set(o);
        this.poForm.patchValue({
          proveedorId: o.proveedorId,
          descripcion: o.descripcion || '',
        });
        this.poForm.get('proveedorId')?.disable();
        o.detalles.forEach((d) => this.rows.push(this.createRow(d)));
        this.recalcAll();
      },
      error: () => {
        this.snackBar.open('Error al cargar orden', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/purchase-orders']);
      },
    });
  }

  private createRow(d?: any): FormGroup {
    return this.fb.group({
      descripcion: [d?.descripcion || '', Validators.required],
      cantidad: [d?.cantidad || 1, [Validators.required, Validators.min(1)]],
      precioUnitario: [d?.precioUnitario || 0, [Validators.required, Validators.min(0)]],
      descuento: [d?.descuento || 0, [Validators.min(0), Validators.max(100)]],
    });
  }

  addRow(): void { this.rows.push(this.createRow()); }

  removeRow(index: number): void { this.rows.removeAt(index); this.recalcAll(); }

  getRowCalc(index: number): { subtotal: number; iva: number; total: number } {
    return this.rowCalcs()[index] || { subtotal: 0, iva: 0, total: 0 };
  }

  calcRow(index: number): void {
    const row = this.rows.at(index);
    if (!row) return;
    const cant = Number(row.get('cantidad')?.value) || 0;
    const pu = Number(row.get('precioUnitario')?.value) || 0;
    const descPct = Number(row.get('descuento')?.value) || 0;
    const subt = cant * pu;
    const afterDisc = subt - (subt * (descPct / 100));
    const ivaAmt = afterDisc * this.IVA_RATE;
    this.rowCalcs.update((m) => ({ ...m, [index]: { subtotal: subt, iva: ivaAmt, total: afterDisc + ivaAmt } }));
    this.recalcAll();
  }

  private recalcAll(): void {
    let subt = 0, ivaTotal = 0, totalAmt = 0;
    for (let i = 0; i < this.rows.length; i++) {
      const c = this.getRowCalc(i);
      subt += c.subtotal; ivaTotal += c.iva; totalAmt += c.total;
    }
    this.subtotal.set(subt); this.iva.set(ivaTotal); this.total.set(totalAmt);
  }

  changeStatus(estado: string): void {
    if (!this.poId) return;
    this.saving.set(true);
    this.poService.update(this.poId, { estado }).subscribe({
      next: (res) => {
        this.order.set(res.data);
        this.snackBar.open(`Orden ${estado}`, 'Cerrar', { duration: 3000 });
        this.saving.set(false);
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al cambiar estado', 'Cerrar', { duration: 3000 });
        this.saving.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.poForm.invalid) { this.snackBar.open('Completa todos los campos requeridos', 'Cerrar', { duration: 3000 }); return; }
    if (this.rows.length === 0) { this.snackBar.open('Agrega al menos un concepto', 'Cerrar', { duration: 3000 }); return; }

    this.saving.set(true);
    const detalles = this.poForm.value.detalles.map((d: any) => ({
      descripcion: d.descripcion,
      cantidad: Number(d.cantidad),
      precioUnitario: Number(d.precioUnitario),
      descuento: Number(d.descuento) || 0,
    }));

    const dto = { proveedorId: this.poForm.value.proveedorId, descripcion: this.poForm.value.descripcion || '', detalles };
    const request = this.isEditMode() ? this.poService.update(this.poId!, dto) : this.poService.create(dto);

    request.subscribe({
      next: () => {
        this.snackBar.open(this.isEditMode() ? 'Orden actualizada' : 'Orden creada', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/purchase-orders']);
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al guardar', 'Cerrar', { duration: 3000 });
        this.saving.set(false);
      },
    });
  }

  goBack(): void { this.router.navigate(['/purchase-orders']); }
}
