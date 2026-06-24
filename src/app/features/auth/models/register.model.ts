export interface RegisterRequest {
  email: string;
  password: string;
  nombre?: string;
}

export interface RegisterResponse {
  message: string;
  requiresCompany?: boolean;
  verificationToken?: string;
  expiresIn?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    nombre: string;
    companyId: string | null;
    branchId: string | null;
    roles: string[];
    permisos: string[];
  };
}
