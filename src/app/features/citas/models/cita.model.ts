export interface Cita {
  id: string;
  empresaId: string;
  sucursalId?: string | null;
  clienteId: string;
  vehiculoId: string;
  fecha: string;
  hora: string;
  estado: string;
  notas?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  cliente?: { id: string; nombre: string; email?: string; telefono?: string };
  vehiculo?: { id: string; placa: string; marca?: { nombre: string }; modelo?: { nombre: string } };
  sucursal?: { id: string; nombre: string };
}

export interface CreateCitaRequest {
  clienteId: string;
  vehiculoId: string;
  fecha: string;
  hora: string;
  sucursalId?: string;
  notas?: string;
}

export interface UpdateCitaRequest {
  clienteId?: string;
  vehiculoId?: string;
  fecha?: string;
  hora?: string;
  sucursalId?: string;
  notas?: string;
  estado?: string;
}

export interface AvailabilitySlot {
  hora: string;
  sucursalId?: string | null;
}
