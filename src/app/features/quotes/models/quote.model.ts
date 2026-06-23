export interface QuoteDetail {
  id?: string;
  tipo: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
  iva: number;
  total: number;
}

export interface Quote {
  id: string;
  empresaId: string;
  ordenTrabajoId: string;
  folio: string;
  estado: string;
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
  notas?: string | null;
  fechaValidez?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  detalles: QuoteDetail[];
  ordenTrabajo?: { id: string; folio: string; estado: string };
}

export interface CreateQuoteRequest {
  ordenTrabajoId: string;
  descuento?: number;
  notas?: string;
  detalles: CreateQuoteDetailRequest[];
}

export interface CreateQuoteDetailRequest {
  tipo: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento?: number;
}

export interface UpdateQuoteRequest {
  estado?: string;
  descuento?: number;
  notas?: string;
  detalles?: CreateQuoteDetailRequest[];
}
