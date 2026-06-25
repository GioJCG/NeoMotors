import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { RegisterRequest, RegisterResponse } from '../models/register.model';
import { VerifyRequest, VerifyResponse } from '../models/verify.model';
import { LoginRequest, LoginResponse } from '../models/login.model';
import { ForgotPasswordRequest, ForgotPasswordResponse } from '../models/forgot-password.model';
import { ResetPasswordRequest, ResetPasswordResponse } from '../models/reset-password.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  constructor(private readonly http: HttpClient) {}

  register(dto: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<ApiResponse<RegisterResponse>>(`${this.apiUrl}/register`, dto).pipe(map((r) => r.data));
  }

  verify(dto: VerifyRequest): Observable<VerifyResponse> {
    return this.http.post<ApiResponse<VerifyResponse>>(`${this.apiUrl}/verify`, dto).pipe(map((r) => r.data));
  }

  login(dto: LoginRequest): Observable<LoginResponse> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/login`, dto).pipe(map((r) => r.data));
  }

  forgotPassword(dto: ForgotPasswordRequest): Observable<ForgotPasswordResponse> {
    return this.http.post<ApiResponse<ForgotPasswordResponse>>(`${this.apiUrl}/forgot-password`, dto).pipe(map((r) => r.data));
  }

  resetPassword(dto: ResetPasswordRequest): Observable<ResetPasswordResponse> {
    return this.http.post<ApiResponse<ResetPasswordResponse>>(`${this.apiUrl}/reset-password`, dto).pipe(map((r) => r.data));
  }
}
