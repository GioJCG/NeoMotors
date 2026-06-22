export interface RegisterRequest {
  email: string;
  password: string;
  nombre?: string;
}

export interface RegisterResponse {
  success: boolean;
  data: {
    message: string;
    verificationToken: string;
    expiresIn: string;
  };
  timestamp: string;
}
