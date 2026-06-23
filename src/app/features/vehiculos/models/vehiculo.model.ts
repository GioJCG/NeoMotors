export interface Vehiculo {
  id: string;
  empresaId: string;
  clienteId: string;
  marcaId: string;
  modeloId: string;
  placa: string;
  numeroSerie?: string | null;
  anio?: number | null;
  color?: string | null;
  estado: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  cliente?: { id: string; nombre: string };
  marca?: { id: string; nombre: string };
  modelo?: { id: string; nombre: string };
}

export interface CreateVehiculoRequest {
  clienteId: string;
  marcaId: string;
  modeloId: string;
  placa: string;
  numeroSerie?: string;
  anio?: number;
  color?: string;
  estado?: string;
}

export interface UpdateVehiculoRequest {
  clienteId?: string;
  marcaId?: string;
  modeloId?: string;
  placa?: string;
  numeroSerie?: string;
  anio?: number;
  color?: string;
  estado?: string;
}

export interface Marca {
  id: string;
  nombre: string;
}

export interface Modelo {
  id: string;
  nombre: string;
}
