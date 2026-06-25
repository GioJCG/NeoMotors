import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BillingService } from '../../services/billing.service';
import { FacturaFiscal } from '../../models/billing.model';

@Component({
  selector: 'app-billing-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <button mat-icon-button routerLink="/billing" aria-label="Volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1>Factura {{ factura()?.folio || '' }}</h1>
          <span class="badge" [class.timbrada]="factura()?.estado === 'TIMBRADA'" [class.cancelada]="factura()?.estado === 'CANCELADA'" [class.generada]="factura()?.estado === 'GENERADA'">
            {{ factura()?.estado }}
          </span>
        </div>
      </div>

      @if (loading()) {
        <p class="loading-text">Cargando...</p>
      }

      @if (factura(); as f) {
        <mat-card class="section">
          <mat-card-header>
            <mat-card-title>Emisor</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p><strong>RFC:</strong> {{ f.empresa?.rfc }}</p>
            <p><strong>Razón Social:</strong> {{ f.empresa?.razonSocial }}</p>
            <p><strong>Régimen Fiscal:</strong> {{ f.empresa?.regimenFiscal }}</p>
            <p><strong>CP:</strong> {{ f.lugarExpedicion }}</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="section">
          <mat-card-header>
            <mat-card-title>Receptor</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p><strong>RFC:</strong> {{ f.receptorRfc }}</p>
            <p><strong>Nombre:</strong> {{ f.receptorNombre }}</p>
            <p><strong>Uso CFDI:</strong> {{ f.usoCfdi }}</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="section">
          <mat-card-header>
            <mat-card-title>Datos Fiscales</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p><strong>UUID:</strong> {{ f.uuid || '—' }}</p>
            <p><strong>Folio:</strong> {{ f.serie ? f.serie + ' ' : '' }}{{ f.folio }}</p>
            <p><strong>Fecha de Emisión:</strong> {{ f.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
            @if (f.fechaTimbrado) {
              <p><strong>Fecha de Timbrado:</strong> {{ f.fechaTimbrado | date:'dd/MM/yyyy HH:mm' }}</p>
            }
            <p><strong>Tipo Comprobante:</strong> {{ f.tipoComprobante }}</p>
            <p><strong>Forma de Pago:</strong> {{ f.formaPago }}</p>
            <p><strong>Método de Pago:</strong> {{ f.metodoPago }}</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="section">
          <mat-card-header>
            <mat-card-title>Conceptos</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table class="conceptos-table">
              <thead>
                <tr>
                  <th>Cant</th>
                  <th>Clave</th>
                  <th>Descripción</th>
                  <th>P.U.</th>
                  <th>Importe</th>
                  <th>IVA</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                @for (det of f.detalles; track det.id) {
                  <tr>
                    <td>{{ det.cantidad }}</td>
                    <td>{{ det.claveProdServ }}</td>
                    <td>{{ det.descripcion }}</td>
                    <td>{{ det.precioUnitario | currency:'MXN':'symbol-narrow':'1.2-2' }}</td>
                    <td>{{ det.importe | currency:'MXN':'symbol-narrow':'1.2-2' }}</td>
                    <td>{{ det.iva | currency:'MXN':'symbol-narrow':'1.2-2' }}</td>
                    <td>{{ det.total | currency:'MXN':'symbol-narrow':'1.2-2' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </mat-card-content>
        </mat-card>

        <mat-card class="section">
          <mat-card-header>
            <mat-card-title>Totales</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="totals">
              <p><strong>Subtotal:</strong> {{ f.subtotal | currency:'MXN':'symbol-narrow':'1.2-2' }}</p>
              @if (f.descuento > 0) {
                <p><strong>Descuento:</strong> -{{ f.descuento | currency:'MXN':'symbol-narrow':'1.2-2' }}</p>
              }
              <p><strong>IVA (16%):</strong> {{ f.iva | currency:'MXN':'symbol-narrow':'1.2-2' }}</p>
              <p class="grand-total"><strong>Total:</strong> {{ f.total | currency:'MXN':'symbol-narrow':'1.2-2' }}</p>
            </div>
          </mat-card-content>
        </mat-card>

        @if (f.estado === 'CANCELADA') {
          <mat-card class="section cancel-section">
            <mat-card-header>
              <mat-card-title>Cancelación</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p><strong>Motivo:</strong> {{ f.motivoCancelacion }}</p>
              @if (f.fechaCancelacion) {
                <p><strong>Fecha:</strong> {{ f.fechaCancelacion | date:'dd/MM/yyyy HH:mm' }}</p>
              }
              @if (f.uuidSustituto) {
                <p><strong>UUID Sustituto:</strong> {{ f.uuidSustituto }}</p>
              }
            </mat-card-content>
          </mat-card>
        }

        <div class="actions">
          @if (f.uuid) {
            <button mat-stroked-button (click)="downloadXml()">
              <mat-icon>description</mat-icon> XML
            </button>
            <button mat-stroked-button (click)="downloadPdf()">
              <mat-icon>picture_as_pdf</mat-icon> PDF
            </button>
          }
          @if (f.estado === 'TIMBRADA') {
            <button mat-flat-button color="warn" (click)="confirmCancel()">
              <mat-icon>cancel</mat-icon> Cancelar Factura
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .page-container { max-width: 900px; margin: 24px auto; padding: 0 16px; }
    .page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 24px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .badge.timbrada { background: #e8f5e9; color: #2e7d32; }
    .badge.cancelada { background: #ffebee; color: #c62828; }
    .badge.generada { background: #fff3e0; color: #ef6c00; }
    .section { margin-bottom: 20px; }
    .loading-text { text-align: center; color: #666; padding: 40px; }
    .conceptos-table { width: 100%; border-collapse: collapse; }
    .conceptos-table th { background: #f5f5f5; padding: 8px; font-size: 12px; text-align: left; border-bottom: 2px solid #ddd; }
    .conceptos-table td { padding: 8px; border-bottom: 1px solid #eee; font-size: 13px; }
    .totals { text-align: right; font-size: 14px; }
    .totals .grand-total { font-size: 18px; color: #1a237e; margin-top: 8px; }
    .cancel-section { border-left: 4px solid #c62828; }
    .actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; }
  `,
})
export class BillingDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly billingService = inject(BillingService);
  private readonly snackBar = inject(MatSnackBar);

  readonly factura = signal<FacturaFiscal | null>(null);
  readonly loading = signal(true);

  private facturaId = '';

  ngOnInit(): void {
    this.facturaId = this.route.snapshot.paramMap.get('id') || '';
    if (this.facturaId) {
      this.loadFactura();
    }
  }

  private loadFactura(): void {
    this.loading.set(true);
    this.billingService.findById(this.facturaId).subscribe({
      next: (res) => {
        this.factura.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar la factura', 'Cerrar', { duration: 3000 });
      },
    });
  }

  downloadXml(): void {
    this.billingService.download(this.facturaId, 'xml').subscribe({
      next: (res) => {
        const blob = new Blob([res.data.contenido], { type: 'text/xml' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = res.data.nombre;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('Error al descargar XML', 'Cerrar', { duration: 3000 }),
    });
  }

  downloadPdf(): void {
    this.billingService.download(this.facturaId, 'pdf').subscribe({
      next: (res) => {
        const blob = new Blob([res.data.contenido], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = res.data.nombre;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('Error al descargar PDF', 'Cerrar', { duration: 3000 }),
    });
  }

  confirmCancel(): void {
    const motivo = prompt('Motivo de cancelación (01=Errores con relación, 02=Errores sin relación, 03=No se realizó la operación):', '03');
    if (!motivo) return;

    this.billingService.cancel(this.facturaId, { motivo }).subscribe({
      next: () => {
        this.snackBar.open('Factura cancelada exitosamente', 'Cerrar', { duration: 3000 });
        this.loadFactura();
      },
      error: (err) => {
        const msg = err.error?.data?.message || 'Error al cancelar factura';
        this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
      },
    });
  }
}
