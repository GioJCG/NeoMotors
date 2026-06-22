export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    user: {
      id: string;
      email: string;
      nombre: string;
      companyId: string | null;
      branchId: string | null;
      roles: string[];
      permisos: string[];
    };
  };
  timestamp: string;
}
