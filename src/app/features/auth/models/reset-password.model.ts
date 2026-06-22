export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  data: {
    message: string;
  };
  timestamp: string;
}
