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
}
