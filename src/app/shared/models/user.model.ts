export interface TokenPayload {
  sub: string;
  email: string;
  companyId?: string | null;
  branchId?: string | null;
  roles: string[];
  permisos: string[];
  iat?: number;
  exp?: number;
}

export interface User {
  id: string;
  email: string;
  nombre: string | null;
  companyId: string | null;
  branchId: string | null;
  roles: string[];
  permisos: string[];
}

export interface CompanyItem {
  id: string;
  nombre: string;
  rfc: string;
  activa: boolean;
}

export interface BranchItem {
  id: string;
  nombre: string;
  esMatriz: boolean;
  estado: string;
  activa: boolean;
}
