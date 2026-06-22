export interface TokenPayload {
  sub: string;
  email: string;
  roles: string[];
  permisos: string[];
  iat?: number;
  exp?: number;
}

export interface User {
  id: string;
  email: string;
  nombre: string | null;
  roles: string[];
  permisos: string[];
}
