export interface FacturaFiscal {
  id: string;
  empresaId: string;
  ordenTrabajoId: string;
  sucursalId?: string | null;
  folio: string;
  serie?: string | null;
  uuid?: string | null;
  estado: 'GENERADA' | 'TIMBRADA' | 'CANCELADA';
  xmlTimbrado?: string | null;
  fechaTimbrado?: string | null;
  tipoComprobante: string;
  lugarExpedicion: string;
  exportacion: string;
  objetoImp: string;
  receptorRfc: string;
  receptorNombre: string;
  receptorDomicilio?: string | null;
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
  metodoPago: string;
  formaPago: string;
  usoCfdi: string;
  relacionTipo?: string | null;
  relacionUuid?: string | null;
  motivoCancelacion?: string | null;
  uuidSustituto?: string | null;
  fechaCancelacion?: string | null;
  acuseCancelacion?: string | null;
  esPago: boolean;
  pagoTipoCambio?: number | null;
  pagoMonto?: number | null;
  createdAt: string;
  createdBy?: string | null;
  ordenTrabajo?: { id: string; folio: string };
  detalles?: FacturaDetalle[];
  empresa?: { id: string; nombre: string; rfc: string; razonSocial: string; regimenFiscal: string; codigoPostalFiscal: string };
  sucursal?: { id: string; nombre: string };
}

export interface FacturaDetalle {
  id: string;
  facturaId: string;
  cantidad: number;
  claveProdServ: string;
  claveUnidad: string;
  unidad: string;
  noIdentificacion?: string | null;
  descripcion: string;
  precioUnitario: number;
  importe: number;
  descuento: number;
  iva: number;
  objetoImp: string;
  total: number;
}

export interface EmitirFacturaRequest {
  ordenTrabajoId: string;
  sucursalId?: string;
  serie?: string;
  tipoComprobante?: string;
  exportacion?: string;
  usoCfdi?: string;
  formaPago?: string;
  metodoPago?: string;
  relacionTipo?: string;
  relacionUuid?: string;
  detalles?: EmitirDetalle[];
}

export interface EmitirDetalle {
  cantidad: number;
  claveProdServ?: string;
  claveUnidad?: string;
  unidad?: string;
  noIdentificacion?: string;
  descripcion: string;
  precioUnitario: number;
  descuento?: number;
  objetoImp?: string;
}

export interface CancelarFacturaRequest {
  motivo: string;
  uuidSustituto?: string;
}

export interface SatCatalogs {
  regimenesFiscales: SatCatalogItem[];
  usosCfdi: SatCatalogItem[];
  formasPago: SatCatalogItem[];
  metodosPago: SatCatalogItem[];
  objetosImpuesto: SatCatalogItem[];
  tiposRelacion: SatCatalogItem[];
  tiposComprobante: SatCatalogItem[];
}

export interface SatCatalogItem {
  id: string;
  codigo: string;
  nombre: string;
}

export interface BillingStats {
  facturasEmitidas: number;
  facturasPendientes: number;
  facturasCanceladas: number;
  ingresosFacturados: number;
  ingresosAnio: number;
  facturasRecientes: FacturaFiscal[];
  ingresosPorDia: Array<{ fecha: string; total: number }>;
}
