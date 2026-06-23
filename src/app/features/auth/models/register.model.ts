export interface RegisterRequest {
  email: string;
  password: string;
  nombre?: string;
}

export interface RegisterResponse {
  message: string;
  verificationToken: string;
  expiresIn: string;
}
