import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DashboardService } from '../services/dashboard.service';
import { OrderStat, StockAlert, TechnicianEfficiency } from '../models/dashboard.model';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatListModule, MatChipsModule, MatProgressBarModule],
  template: `
    <div class="page">
      <h1>Dashboard</h1>

      <div class="grid">
        <mat-card class="card">
          <mat-card-header>
            <mat-icon mat-card-avatar>assessment</mat-icon>
            <mat-card-title>Órdenes por Estado</mat-card-title>
            <mat-card-subtitle>Total: {{ orderStats?.total || 0 }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            @for (s of orderStats?.estados || []; track s.estado) {
              <div class="bar-row">
                <span class="bar-label">{{ s.estado }}</span>
                <div class="bar-track">
                  <div class="bar-fill" [style.width.%]="barWidth(s.count)" [style.background]="barColor(s.estado)"></div>
                </div>
                <span class="bar-value">{{ s.count }}</span>
              </div>
            }
          </mat-card-content>
        </mat-card>

        <mat-card class="card">
          <mat-card-header>
            <mat-icon mat-card-avatar>payments</mat-icon>
            <mat-card-title>Ingresos vs Costos</mat-card-title>
            <mat-card-subtitle>Período actual</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="kpi-row">
              <span class="kpi-label">Ingresos (pagos)</span>
              <span class="kpi-value positive">&#36;{{ revenue?.totalIngresos | number:'1.2-2' }}</span>
            </div>
            <div class="kpi-row">
              <span class="kpi-label">Total real órdenes</span>
              <span class="kpi-value">&#36;{{ revenue?.totalReal | number:'1.2-2' }}</span>
            </div>
            <div class="kpi-row">
              <span class="kpi-label">Total estimado</span>
              <span class="kpi-value">&#36;{{ revenue?.totalEstimado | number:'1.2-2' }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="card">
          <mat-card-header>
            <mat-icon mat-card-avatar>warning</mat-icon>
            <mat-card-title>Alertas de Stock</mat-card-title>
            <mat-card-subtitle>Refacciones por debajo del mínimo</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            @if (stockAlerts.length === 0) {
              <div class="empty">Sin alertas</div>
            }
            @for (a of stockAlerts; track a.id) {
              <div class="alert-row">
                <div class="alert-info">
                  <strong>{{ a.refaccionNombre }}</strong>
                  <span class="alert-code">({{ a.refaccionCodigo }})</span>
                  <span class="alert-sucursal">{{ a.sucursalNombre }}</span>
                </div>
                <div class="alert-stock">
                  <span class="stock-low">{{ a.stockActual }}</span> / {{ a.stockMinimo }}
                </div>
              </div>
            }
          </mat-card-content>
        </mat-card>

        <mat-card class="card">
          <mat-card-header>
            <mat-icon mat-card-avatar>engineering</mat-icon>
            <mat-card-title>Eficiencia por Técnico</mat-card-title>
            <mat-card-subtitle>Horas trabajadas</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            @if (efficiency.length === 0) {
              <div class="empty">Sin datos</div>
            }
            @for (t of efficiency; track t.tecnicoId) {
              <div class="tech-row">
                <span class="tech-name">{{ t.nombre }}</span>
                <span class="tech-hours">{{ t.totalHoras }}h</span>
                <span class="tech-orders">({{ t.totalOrdenes }} órdenes)</span>
              </div>
            }
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: `
    .page { padding: 24px; max-width: 1200px; margin: 0 auto; }
    h1 { margin: 0 0 20px; font-size: 24px; font-weight: 500; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }
    .card { border-radius: 8px; }
    mat-card-header { margin-bottom: 12px; }
    mat-card-title { font-size: 16px; font-weight: 500; }
    .empty { padding: 24px 0; text-align: center; color: #999; font-size: 14px; }

    .bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .bar-label { width: 120px; font-size: 12px; color: #555; flex-shrink: 0; }
    .bar-track { flex: 1; height: 18px; background: #eee; border-radius: 3px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; min-width: 4px; }
    .bar-value { width: 40px; text-align: right; font-size: 12px; font-weight: 600; flex-shrink: 0; }

    .kpi-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
    .kpi-row:last-child { border-bottom: none; }
    .kpi-label { font-size: 13px; color: #555; }
    .kpi-value { font-size: 14px; font-weight: 600; }
    .kpi-value.positive { color: #2e7d32; }

    .alert-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
    .alert-row:last-child { border-bottom: none; }
    .alert-info { display: flex; flex-direction: column; gap: 1px; }
    .alert-code { font-size: 11px; color: #999; }
    .alert-sucursal { font-size: 11px; color: #666; }
    .alert-stock { font-size: 13px; }
    .stock-low { color: #c62828; font-weight: 700; }

    .tech-row { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
    .tech-row:last-child { border-bottom: none; }
    .tech-name { flex: 1; font-size: 13px; }
    .tech-hours { font-weight: 600; font-size: 14px; }
    .tech-orders { font-size: 11px; color: #999; }
  `,
})
export class DashboardPageComponent implements OnInit {
  private readonly service = inject(DashboardService);

  orderStats: { total: number; estados: OrderStat[] } | null = null;
  revenue: { totalIngresos: number; totalEstimado: number; totalReal: number } | null = null;
  stockAlerts: StockAlert[] = [];
  efficiency: TechnicianEfficiency[] = [];

  private maxCount = 1;

  ngOnInit(): void {
    this.service.getOrderStats().subscribe((res) => {
      this.orderStats = res;
      this.maxCount = Math.max(...res.estados.map((s) => s.count), 1);
    });
    this.service.getRevenue().subscribe((res) => (this.revenue = res));
    this.service.getStockAlerts().subscribe((res) => (this.stockAlerts = res));
    this.service.getTechnicianEfficiency().subscribe((res) => (this.efficiency = res));
  }

  barWidth(count: number): number {
    return (count / this.maxCount) * 100;
  }

  barColor(estado: string): string {
    const colors: Record<string, string> = {
      RECIBIDO: '#42a5f5', DIAGNOSTICO: '#ffa726', PRESUPUESTADO: '#ab47bc',
      APROBADO: '#66bb6a', TRABAJANDO: '#ef5350', TERMINADO: '#26c6da',
      FACTURADO: '#7e57c2', ENTREGADO: '#66bb6a', CANCELADO: '#bdbdbd',
    };
    return colors[estado] || '#90a4ae';
  }
}
