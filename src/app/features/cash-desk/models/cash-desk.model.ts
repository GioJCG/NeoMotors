export interface CashDesk {
  id: string;
  empresaId: string;
  sucursalId: string;
  estado: string;
  saldoInicial: number;
  saldoActual: number;
  conteoFisico?: number | null;
  diferencia?: number | null;
  fechaApertura: string;
  fechaCierre?: string | null;
  observaciones?: string | null;
  operadorAperturaId: string;
  operadorCierreId?: string | null;
  createdAt: string;
  updatedAt: string;
  movimientos?: CashDeskMovement[];
  operadorApertura?: { id: string; nombre: string; email: string } | null;
  operadorCierre?: { id: string; nombre: string } | null;
}

export interface CashDeskMovement {
  id: string;
  cajaId: string;
  tipo: string;
  monto: number;
  saldoAnterior: number;
  saldoNuevo: number;
  referencia?: string | null;
  observaciones?: string | null;
  createdAt: string;
  createdBy?: string | null;
}

export interface OpenCashDeskRequest {
  saldoInicial: number;
  observaciones?: string;
}

export interface CloseCashDeskRequest {
  conteoFisico: number;
  observaciones?: string;
}

export interface RegisterPaymentRequest {
  ordenTrabajoId: string;
  monto: number;
  metodoPago?: string;
  referencia?: string;
  esParcial?: boolean;
}

export interface RegisterTransactionRequest {
  tipo: string;
  monto: number;
  observaciones?: string;
}
