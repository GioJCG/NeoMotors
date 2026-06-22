export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  data: {
    message: string;
    resetToken?: string;
    expiresIn?: string;
  };
  timestamp: string;
}
