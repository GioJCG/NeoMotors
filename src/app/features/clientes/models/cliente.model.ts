export interface Cliente {
  id: string;
  empresaId: string;
  nombre: string;
  rfc?: string | null;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  estado: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface CreateClienteRequest {
  nombre: string;
  rfc?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  estado?: string;
}

export interface UpdateClienteRequest {
  nombre?: string;
  rfc?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  estado?: string;
}
