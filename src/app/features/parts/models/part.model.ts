export interface Part {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  costo: number;
  unidad: string;
  estado: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePartRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  precio?: number;
  costo?: number;
  unidad?: string;
}

export type UpdatePartRequest = Partial<CreatePartRequest>;
