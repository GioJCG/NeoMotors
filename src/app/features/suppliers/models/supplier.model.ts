export interface Supplier {
  id: string;
  nombre: string;
  rfc?: string | null;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  contacto?: string | null;
  estado: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierRequest {
  nombre: string;
  rfc?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  contacto?: string;
}

export type UpdateSupplierRequest = Partial<CreateSupplierRequest>;
