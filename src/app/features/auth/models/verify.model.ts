export interface VerifyRequest {
  token: string;
}

export interface VerifyResponse {
  success: boolean;
  data: {
    message: string;
  };
  timestamp: string;
}
