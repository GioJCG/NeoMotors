export interface Branch {
  id: string;
  empresaId: string;
  nombre: string;
  direccion?: string | null;
  telefono?: string | null;
  esMatriz: boolean;
  latitud?: number | null;
  longitud?: number | null;
  estado: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface CreateBranchRequest {
  nombre: string;
  direccion?: string;
  telefono?: string;
  esMatriz?: boolean;
  latitud?: number;
  longitud?: number;
}

export interface UpdateBranchRequest {
  nombre?: string;
  direccion?: string;
  telefono?: string;
  esMatriz?: boolean;
  latitud?: number;
  longitud?: number;
}
