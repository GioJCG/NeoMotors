import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatOptionModule } from '@angular/material/core';
import { BillingService } from '../../services/billing.service';
import { SatCatalogs, SatCatalogItem } from '../../models/billing.model';

@Component({
  selector: 'app-billing-form-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatCardModule,
    MatDividerModule,
    MatOptionModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <button mat-icon-button routerLink="/billing" aria-label="Volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Nueva Factura</h1>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-card class="form-section">
          <mat-card-header>
            <mat-card-title>Datos de la Factura</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Orden de Trabajo</mat-label>
                <input matInput formControlName="ordenTrabajoId" placeholder="ID de la orden de trabajo" required />
                <mat-error *ngIf="form.get('ordenTrabajoId')?.invalid">Requerido</mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Tipo de Comprobante</mat-label>
                <mat-select formControlName="tipoComprobante">
                  @for (item of tiposComprobante(); track item.codigo) {
                    <mat-option [value]="item.codigo">{{ item.codigo }} - {{ item.nombre }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Uso CFDI</mat-label>
                <mat-select formControlName="usoCfdi">
                  @for (item of usosCfdi(); track item.codigo) {
                    <mat-option [value]="item.codigo">{{ item.codigo }} - {{ item.nombre }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Forma de Pago</mat-label>
                <mat-select formControlName="formaPago">
                  @for (item of formasPago(); track item.codigo) {
                    <mat-option [value]="item.codigo">{{ item.codigo }} - {{ item.nombre }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Método de Pago</mat-label>
                <mat-select formControlName="metodoPago">
                  @for (item of metodosPago(); track item.codigo) {
                    <mat-option [value]="item.codigo">{{ item.codigo }} - {{ item.nombre }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Exportación</mat-label>
                <mat-select formControlName="exportacion">
                  <mat-option value="01">01 - No aplica</mat-option>
                  <mat-option value="02">02 - Definitiva</mat-option>
                  <mat-option value="03">03 - Temporal</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="form-section">
          <mat-card-header>
            <mat-card-title>Conceptos</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div formArrayName="detalles">
              @for (det of detalles.controls; track det; let i = $index; let last = $last) {
                <div [formGroupName]="i" class="concepto-row">
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="qty-field">
                      <mat-label>Cant</mat-label>
                      <input matInput type="number" formControlName="cantidad" min="0.000001" step="0.000001" required />
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="desc-field">
                      <mat-label>Descripción</mat-label>
                      <input matInput formControlName="descripcion" required />
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="price-field">
                      <mat-label>P.U.</mat-label>
                      <input matInput type="number" formControlName="precioUnitario" min="0" step="0.01" required />
                    </mat-form-field>
                    <button mat-icon-button color="warn" type="button" (click)="removeDetalle(i)" [disabled]="detalles.length <= 1">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </div>
              }
            </div>
            <button mat-stroked-button type="button" (click)="addDetalle()">
              <mat-icon>add</mat-icon> Agregar Concepto
            </button>
          </mat-card-content>
        </mat-card>

        <mat-card class="form-section">
          <mat-card-header>
            <mat-card-title>Resumen</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="totals">
              <p><strong>Subtotal:</strong> {{ subtotal() | currency:'MXN':'symbol-narrow':'1.2-2' }}</p>
              <p><strong>IVA (16%):</strong> {{ iva() | currency:'MXN':'symbol-narrow':'1.2-2' }}</p>
              <p class="total"><strong>Total:</strong> {{ total() | currency:'MXN':'symbol-narrow':'1.2-2' }}</p>
            </div>
          </mat-card-content>
        </mat-card>

        <div class="form-actions">
          <button mat-stroked-button type="button" routerLink="/billing">Cancelar</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || submitting()">
            {{ submitting() ? 'Emitiendo...' : 'Emitir Factura' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: `
    .page-container { max-width: 900px; margin: 24px auto; padding: 0 16px; }
    .page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 24px; }
    .form-section { margin-bottom: 20px; }
    .form-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 8px; }
    .full-width { flex: 1; min-width: 200px; }
    .qty-field { width: 100px; }
    .desc-field { flex: 1; min-width: 200px; }
    .price-field { width: 130px; }
    .concepto-row { padding: 12px 0; border-bottom: 1px solid #eee; }
    .totals { text-align: right; font-size: 14px; }
    .totals .total { font-size: 18px; color: #1a237e; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
  `,
})
export class BillingFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly billingService = inject(BillingService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly submitting = signal(false);

  readonly tiposComprobante = signal<SatCatalogItem[]>([]);
  readonly usosCfdi = signal<SatCatalogItem[]>([]);
  readonly formasPago = signal<SatCatalogItem[]>([]);
  readonly metodosPago = signal<SatCatalogItem[]>([]);

  form: FormGroup = this.fb.group({
    ordenTrabajoId: ['', Validators.required],
    tipoComprobante: ['I'],
    usoCfdi: ['G03'],
    formaPago: ['01'],
    metodoPago: ['PUE'],
    exportacion: ['01'],
    detalles: this.fb.array([
      this.createDetalleGroup(),
    ]),
  });

  get detalles(): FormArray {
    return this.form.get('detalles') as FormArray;
  }

  readonly subtotal = signal(0);
  readonly iva = signal(0);
  readonly total = signal(0);

  ngOnInit(): void {
    this.loadCatalogs();
    this.form.valueChanges.subscribe(() => this.calcularTotales());
  }

  private loadCatalogs(): void {
    this.billingService.getSatCatalogs().subscribe({
      next: (res) => {
        this.tiposComprobante.set(res.data.tiposComprobante);
        this.usosCfdi.set(res.data.usosCfdi);
        this.formasPago.set(res.data.formasPago);
        this.metodosPago.set(res.data.metodosPago);
      },
    });
  }

  private createDetalleGroup(): FormGroup {
    return this.fb.group({
      cantidad: [1, [Validators.required, Validators.min(0.000001)]],
      descripcion: ['', Validators.required],
      precioUnitario: [0, [Validators.required, Validators.min(0)]],
      claveProdServ: ['78111805'],
      claveUnidad: ['E48'],
      unidad: ['Servicio'],
    });
  }

  addDetalle(): void {
    this.detalles.push(this.createDetalleGroup());
  }

  removeDetalle(index: number): void {
    if (this.detalles.length > 1) {
      this.detalles.removeAt(index);
    }
  }

  private calcularTotales(): void {
    const detalles = this.detalles.getRawValue();
    let sub = 0;
    let ivaTotal = 0;
    for (const d of detalles) {
      const importe = (d.cantidad || 0) * (d.precioUnitario || 0);
      sub += importe;
      ivaTotal += importe * 0.16;
    }
    this.subtotal.set(sub);
    this.iva.set(ivaTotal);
    this.total.set(sub + ivaTotal);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);

    const dto = {
      ordenTrabajoId: this.form.value.ordenTrabajoId,
      tipoComprobante: this.form.value.tipoComprobante,
      usoCfdi: this.form.value.usoCfdi,
      formaPago: this.form.value.formaPago,
      metodoPago: this.form.value.metodoPago,
      exportacion: this.form.value.exportacion,
      detalles: this.form.value.detalles.filter((d: any) => d.descripcion && d.cantidad > 0),
    };

    this.billingService.issue(dto).subscribe({
      next: (res) => {
        this.snackBar.open('Factura ' + res.data.folio + ' emitida exitosamente', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/billing', res.data.id]);
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = err.error?.data?.message || 'Error al emitir factura';
        this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
      },
    });
  }
}
