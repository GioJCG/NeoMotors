export interface WorkOrder {
  id: string;
  empresaId: string;
  sucursalId?: string | null;
  clienteId: string;
  vehiculoId: string;
  recepcionId?: string | null;
  folio: string;
  estado: string;
  descripcion?: string | null;
  diagnostico?: string | null;
  totalEstimado?: number | null;
  totalReal?: number | null;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  cliente?: { id: string; nombre: string; telefono?: string; email?: string };
  vehiculo?: { id: string; placa: string; numeroSerie?: string; marca?: { nombre: string }; modelo?: { nombre: string } };
  recepcion?: Reception;
}

export interface Reception {
  id: string;
  empresaId: string;
  sucursalId?: string | null;
  citaId?: string | null;
  clienteId: string;
  vehiculoId: string;
  kilometraje: number;
  nivelCombustible: string;
  componentesFaltantes?: string | null;
  daniosCarroceria?: string | null;
  createdAt: string;
  createdBy?: string | null;
  fotos?: ReceptionPhoto[];
}

export interface ReceptionPhoto {
  id: string;
  recepcionId: string;
  url: string;
  orden: number;
}

export interface CreateReceptionRequest {
  clienteId: string;
  vehiculoId: string;
  kilometraje: number;
  nivelCombustible: string;
  componentesFaltantes?: string[];
  daniosCarroceria?: string;
  fotos?: string[];
}

export interface Diagnostico {
  id: string;
  ordenTrabajoId: string;
  tecnicoId: string;
  sintomas?: string | null;
  fallasEncontradas?: string | null;
  desgastesPiezas?: string | null;
  conclusion?: string | null;
  createdAt: string;
  createdBy?: string | null;
  tecnico?: { id: string; nombre: string; email: string };
}

export interface CreateDiagnosticoRequest {
  sintomas?: string;
  fallasEncontradas?: string;
  desgastesPiezas?: string;
  conclusion?: string;
}

export interface TiempoTecnico {
  id: string;
  ordenTrabajoId: string;
  tecnicoId: string;
  horaInicio: string;
  horaFin?: string | null;
  estado: string;
  createdAt: string;
  createdBy?: string | null;
  tecnico?: { id: string; nombre: string; email: string };
}
