import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RegisterRequest, RegisterResponse } from '../models/register.model';
import { VerifyRequest, VerifyResponse } from '../models/verify.model';
import { LoginRequest, LoginResponse } from '../models/login.model';
import { ForgotPasswordRequest, ForgotPasswordResponse } from '../models/forgot-password.model';
import { ResetPasswordRequest, ResetPasswordResponse } from '../models/reset-password.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  constructor(private readonly http: HttpClient) {}

  register(dto: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, dto);
  }

  verify(dto: VerifyRequest): Observable<VerifyResponse> {
    return this.http.post<VerifyResponse>(`${this.apiUrl}/verify`, dto);
  }

  login(dto: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, dto);
  }

  forgotPassword(dto: ForgotPasswordRequest): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(`${this.apiUrl}/forgot-password`, dto);
  }

  resetPassword(dto: ResetPasswordRequest): Observable<ResetPasswordResponse> {
    return this.http.post<ResetPasswordResponse>(`${this.apiUrl}/reset-password`, dto);
  }
}
