export interface PurchaseOrderDetail {
  id?: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
  iva: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  empresaId: string;
  proveedorId: string;
  folio: string;
  estado: string;
  descripcion?: string | null;
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
  fechaPedido?: string | null;
  fechaRecibido?: string | null;
  createdAt: string;
  updatedAt: string;
  detalles: PurchaseOrderDetail[];
  proveedor?: { id: string; nombre: string } | null;
}

export interface CreatePurchaseOrderRequest {
  proveedorId: string;
  descripcion?: string;
  fechaPedido?: string;
  detalles: CreatePurchaseOrderDetailRequest[];
}

export interface CreatePurchaseOrderDetailRequest {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento?: number;
}

export interface UpdatePurchaseOrderRequest {
  estado?: string;
  descripcion?: string;
  fechaPedido?: string;
  detalles?: CreatePurchaseOrderDetailRequest[];
}
