export interface OrderStat {
  estado: string;
  count: number;
}

export interface OrderStatsResponse {
  total: number;
  estados: OrderStat[];
}

export interface RevenueResponse {
  totalIngresos: number;
  totalEstimado: number;
  totalReal: number;
}

export interface StockAlert {
  id: string;
  refaccionCodigo: string;
  refaccionNombre: string;
  sucursalNombre: string;
  stockActual: number;
  stockMinimo: number;
}

export interface TechnicianEfficiency {
  tecnicoId: string;
  nombre: string;
  totalHoras: number;
  totalOrdenes: number;
}
