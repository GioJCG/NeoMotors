import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuditLogService } from '../services/audit-log.service';
import { AuditLog } from '../models/audit-log.model';

@Component({
  selector: 'app-audit-logs-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatTableModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule,
    MatButtonModule, MatIconModule, MatChipsModule, MatTooltipModule,
  ],
  template: `
    <div class="page">
      <h1>Bitácora de Auditoría</h1>

      <mat-card class="filters-card">
        <div class="filters-row">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Entidad</mat-label>
            <input matInput [(ngModel)]="filtros.entidad" placeholder="ej. OrdenTrabajo" />
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Acción</mat-label>
            <input matInput [(ngModel)]="filtros.accion" placeholder="ej. CREAR" />
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Desde</mat-label>
            <input matInput [matDatepicker]="pickerDesde" [(ngModel)]="desde" />
            <mat-datepicker-toggle matSuffix [for]="pickerDesde" />
            <mat-datepicker #pickerDesde />
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Hasta</mat-label>
            <input matInput [matDatepicker]="pickerHasta" [(ngModel)]="hasta" />
            <mat-datepicker-toggle matSuffix [for]="pickerHasta" />
            <mat-datepicker #pickerHasta />
          </mat-form-field>
          <button mat-raised-button color="primary" (click)="buscar()">
            <mat-icon>search</mat-icon>
            Buscar
          </button>
          <button mat-stroked-button (click)="limpiar()">
            <mat-icon>clear</mat-icon>
            Limpiar
          </button>
        </div>
      </mat-card>

      <mat-card>
        <mat-table [dataSource]="logs" class="audit-table">
          <ng-container matColumnDef="createdAt">
            <mat-header-cell *matHeaderCellDef>Fecha</mat-header-cell>
            <mat-cell *matCellDef="let l">{{ l.createdAt | date:'dd/MM/yyyy HH:mm' }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="usuarioId">
            <mat-header-cell *matHeaderCellDef>Usuario</mat-header-cell>
            <mat-cell *matCellDef="let l">{{ l.usuarioId ? l.usuarioId.substring(0,8)+'...' : '-' }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="entidad">
            <mat-header-cell *matHeaderCellDef>Entidad</mat-header-cell>
            <mat-cell *matCellDef="let l">
              <mat-chip>{{ l.entidad }}</mat-chip>
            </mat-cell>
          </ng-container>
          <ng-container matColumnDef="accion">
            <mat-header-cell *matHeaderCellDef>Acción</mat-header-cell>
            <mat-cell *matCellDef="let l">{{ l.accion }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="entidadId">
            <mat-header-cell *matHeaderCellDef>ID Entidad</mat-header-cell>
            <mat-cell *matCellDef="let l" [matTooltip]="l.entidadId || ''">
              {{ l.entidadId ? l.entidadId.substring(0,8)+'...' : '-' }}
            </mat-cell>
          </ng-container>
          <ng-container matColumnDef="contexto">
            <mat-header-cell *matHeaderCellDef>Contexto</mat-header-cell>
            <mat-cell *matCellDef="let l">{{ l.contexto || '-' }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="ip">
            <mat-header-cell *matHeaderCellDef>IP</mat-header-cell>
            <mat-cell *matCellDef="let l">{{ l.ip || '-' }}</mat-cell>
          </ng-container>

          <mat-header-row *matHeaderRowDef="displayedColumns" />
          <mat-row *matRowDef="let row; columns: displayedColumns" />
        </mat-table>

        <mat-paginator
          [length]="total"
          [pageSize]="limit"
          [pageSizeOptions]="[10, 25, 50]"
          (page)="onPage($event)"
          showFirstLastButtons
        />
      </mat-card>
    </div>
  `,
  styles: `
    .page { padding: 24px; max-width: 1200px; margin: 0 auto; }
    h1 { margin: 0 0 16px; font-size: 24px; font-weight: 500; }
    .filters-card { padding: 16px; margin-bottom: 16px; }
    .filters-row {
      display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
    }
    .filters-row mat-form-field { min-width: 140px; }
    .audit-table { width: 100%; }
    .audit-table .mat-mdc-row:hover { background: #f5f5f5; }
    mat-chip { font-size: 11px; }
  `,
})
export class AuditLogsPageComponent implements OnInit {
  private readonly service = inject(AuditLogService);

  displayedColumns = ['createdAt', 'usuarioId', 'entidad', 'accion', 'entidadId', 'contexto', 'ip'];
  logs: AuditLog[] = [];
  total = 0;
  page = 1;
  limit = 25;

  filtros = { entidad: '', accion: '', usuarioId: '' };
  desde: Date | null = null;
  hasta: Date | null = null;

  ngOnInit(): void {
    this.buscar();
  }

  buscar(): void {
    this.page = 1;
    this.cargar();
  }

  limpiar(): void {
    this.filtros = { entidad: '', accion: '', usuarioId: '' };
    this.desde = null;
    this.hasta = null;
    this.buscar();
  }

  onPage(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.limit = e.pageSize;
    this.cargar();
  }

  private cargar(): void {
    this.service.findAll({
      page: this.page,
      limit: this.limit,
      entidad: this.filtros.entidad || undefined,
      accion: this.filtros.accion || undefined,
      usuarioId: this.filtros.usuarioId || undefined,
      desde: this.desde ? this.desde.toISOString() : undefined,
      hasta: this.hasta ? this.hasta.toISOString() : undefined,
    }).subscribe((res) => {
      this.logs = res.data;
      this.total = res.total;
    });
  }
}
