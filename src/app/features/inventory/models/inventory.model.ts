export interface InventoryItem {
  id: string;
  stockActual: number;
  stockMinimo: number;
  precioPromedio: number;
  stockBajo: boolean;
  refaccion: {
    id: string;
    codigo: string;
    nombre: string;
    precio: number;
    unidad: string;
  };
  sucursal: {
    id: string;
    nombre: string;
  };
}

export interface InventoryMovement {
  id: string;
  tipo: string;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  referencia?: string | null;
  observaciones?: string | null;
  createdAt: string;
  refaccion: { id: string; codigo: string; nombre: string };
  sucursal: { id: string; nombre: string };
}

export interface AdjustStockRequest {
  refaccionId: string;
  cantidad: number;
  tipo: string;
  referencia?: string;
  observaciones?: string;
  stockMinimo?: number;
}

export interface TransferStockRequest {
  refaccionId: string;
  sucursalOrigenId: string;
  sucursalDestinoId: string;
  cantidad: number;
  observaciones?: string;
}
