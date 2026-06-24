export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  estado: string;
  roles: string[];
  sucursales: {
    id: string;
    nombre: string;
    activa: boolean;
  }[];
  createdAt: string;
}

export interface CreateUsuarioRequest {
  email: string;
  password: string;
  nombre: string;
  rol: string;
  sucursalId: string;
}

export interface UpdateUsuarioRequest {
  nombre?: string;
  password?: string;
}
