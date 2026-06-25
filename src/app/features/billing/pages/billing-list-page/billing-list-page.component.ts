import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseListComponent, BaseColumnDef } from '../../../../shared/components/base-list/base-list.component';
import { BillingService } from '../../services/billing.service';
import { FacturaFiscal } from '../../models/billing.model';

@Component({
  selector: 'app-billing-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    BaseListComponent,
  ],
  template: `
    <app-base-list
      title="Facturación Electrónica"
      subtitle="CFDI 4.0 emitidos por la empresa"
      [columns]="columns"
      [data]="facturas()"
      [totalItems]="facturas().length"
      [loading]="loading()"
      [searchTerm]="searchTerm()"
      searchPlaceholder="Folio, RFC o nombre del receptor"
      emptyMessage="No se encontraron facturas"
      [pageSize]="pageSize"
      (searchTermChange)="onSearch($event)"
      (pageChange)="onPageChange($event)"
    >
      <button
        toolbar-actions
        mat-flat-button
        color="primary"
        routerLink="/billing/new"
      >
        <mat-icon>add</mat-icon>
        Nueva Factura
      </button>

      <ng-template #actions let-factura>
        <button mat-icon-button color="primary" [routerLink]="['/billing', factura.id]" matTooltip="Ver detalle">
          <mat-icon>visibility</mat-icon>
        </button>
        <button
          mat-icon-button
          color="accent"
          (click)="downloadXml(factura)"
          matTooltip="Descargar XML"
          [disabled]="!factura.uuid"
        >
          <mat-icon>description</mat-icon>
        </button>
        <button
          mat-icon-button
          color="accent"
          (click)="downloadPdf(factura)"
          matTooltip="Descargar PDF"
          [disabled]="!factura.uuid"
        >
          <mat-icon>picture_as_pdf</mat-icon>
        </button>
      </ng-template>
    </app-base-list>
  `,
  styles: `
    :host { display: block; max-width: 1200px; margin: 24px auto; padding: 0 16px; }
  `,
})
export class BillingListPageComponent implements OnInit {
  private readonly billingService = inject(BillingService);
  private readonly snackBar = inject(MatSnackBar);

  readonly columns: BaseColumnDef[] = [
    { key: 'folio', label: 'Folio' },
    { key: 'receptorNombre', label: 'Receptor' },
    { key: 'receptorRfc', label: 'RFC' },
    { key: 'total', label: 'Total' },
    {
      key: 'estado',
      label: 'Estado',
      type: 'chip',
      chipColor: (value: string) => {
        switch (value) {
          case 'TIMBRADA': return { bg: '#e8f5e9', color: '#2e7d32' };
          case 'CANCELADA': return { bg: '#ffebee', color: '#c62828' };
          default: return { bg: '#fff3e0', color: '#ef6c00' };
        }
      },
    },
    { key: 'createdAt', label: 'Fecha' },
  ];

  readonly facturas = signal<FacturaFiscal[]>([]);
  readonly loading = signal(false);
  readonly searchTerm = signal('');
  readonly pageSize = 10;

  ngOnInit(): void {
    this.loadFacturas();
  }

  private loadFacturas(): void {
    this.loading.set(true);
    this.billingService.findAll().subscribe({
      next: (res) => {
        this.facturas.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar facturas', 'Cerrar', { duration: 3000 });
      },
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.facturas.set(
      this.facturas().filter(
        (f) =>
          !term ||
          f.folio.toLowerCase().includes(term.toLowerCase()) ||
          (f.receptorRfc && f.receptorRfc.toLowerCase().includes(term.toLowerCase())) ||
          (f.receptorNombre && f.receptorNombre.toLowerCase().includes(term.toLowerCase())),
      ),
    );
  }

  onPageChange(_event: any): void {
  }

  downloadXml(factura: FacturaFiscal): void {
    if (!factura.uuid) return;
    this.billingService.download(factura.id, 'xml').subscribe({
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

  downloadPdf(factura: FacturaFiscal): void {
    if (!factura.uuid) return;
    this.billingService.download(factura.id, 'pdf').subscribe({
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
}
