import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseListComponent, BaseColumnDef } from '../../../../shared/components/base-list/base-list.component';
import { QuotesService } from '../../services/quotes.service';
import { Quote } from '../../models/quote.model';

@Component({
  selector: 'app-quote-list-page',
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
      title="Cotizaciones"
      subtitle="Presupuestos y flujo de aprobación"
      [columns]="columns"
      [data]="quotes()"
      [totalItems]="quotes().length"
      [loading]="loading()"
      [searchTerm]="searchTerm()"
      searchPlaceholder="Folio, cliente o estado"
      emptyMessage="No se encontraron cotizaciones"
      [showActions]="false"
      (searchTermChange)="onSearch($event)"
      (pageChange)="onPageChange($event)"
    >
      <button
        toolbar-actions
        mat-flat-button
        color="primary"
        routerLink="/quotes/new"
      >
        <mat-icon>add</mat-icon>
        Nueva Cotización
      </button>

      <ng-template #actions let-quote>
        <button mat-icon-button color="primary" [routerLink]="['/quotes', quote.id]" matTooltip="Ver detalle">
          <mat-icon>visibility</mat-icon>
        </button>
      </ng-template>
    </app-base-list>
  `,
  styles: `
    :host { display: block; max-width: 1200px; margin: 24px auto; padding: 0 16px; }
  `,
})
export class QuoteListPageComponent implements OnInit {
  private readonly quotesService = inject(QuotesService);
  private readonly snackBar = inject(MatSnackBar);

  readonly columns: BaseColumnDef[] = [
    { key: 'folio', label: 'Folio' },
    { key: 'ordenTrabajo', label: 'Orden', type: 'object', displayKey: 'folio' },
    {
      key: 'estado',
      label: 'Estado',
      type: 'chip',
      chipColor: (value: string) => {
        const colors: Record<string, { bg: string; color: string }> = {
          BORRADOR: { bg: '#f5f5f5', color: '#616161' },
          ENVIADA: { bg: '#e3f2fd', color: '#1565c0' },
          APROBADA: { bg: '#e8f5e9', color: '#2e7d32' },
          RECHAZADA: { bg: '#fce4ec', color: '#c62828' },
        };
        return colors[value] || { bg: '#f5f5f5', color: '#333' };
      },
    },
    {
      key: 'subtotal',
      label: 'Subtotal',
      type: 'text',
    },
    {
      key: 'total',
      label: 'Total',
      type: 'text',
    },
    { key: 'createdAt', label: 'Fecha' },
  ];

  readonly quotes = signal<Quote[]>([]);
  readonly loading = signal(false);
  readonly searchTerm = signal('');
  readonly pageSize = 10;

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.quotesService.findAll().subscribe({
      next: (res) => {
        this.quotes.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar cotizaciones', 'Cerrar', { duration: 3000 });
      },
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.quotes.set(
      this.quotes().filter(
        (q) =>
          !term ||
          q.folio.toLowerCase().includes(term.toLowerCase()) ||
          q.estado.toLowerCase().includes(term.toLowerCase()) ||
          (q.ordenTrabajo && q.ordenTrabajo.folio.toLowerCase().includes(term.toLowerCase())),
      ),
    );
  }

  onPageChange(_event: any): void {
  }
}
