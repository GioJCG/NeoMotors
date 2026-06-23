import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Iniciar Sesión</mat-card-title>
          <mat-card-subtitle>Accede a neoMotors</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Correo electrónico</mat-label>
              <input matInput formControlName="email" type="email" placeholder="correo@ejemplo.com" />
              @if (loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched) {
                <mat-error>El correo es requerido</mat-error>
              }
              @if (loginForm.get('email')?.hasError('email') && loginForm.get('email')?.touched) {
                <mat-error>Ingresa un correo válido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput formControlName="password" [type]="hidePassword() ? 'password' : 'text'" />
              <button mat-icon-button matSuffix (click)="hidePassword.set(!hidePassword())" type="button">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                <mat-error>La contraseña es requerida</mat-error>
              }
            </mat-form-field>

            @if (error(); as err) {
              <div class="error-message">
                <mat-icon color="warn">error</mat-icon>
                <span>{{ err }}</span>
              </div>
            }

            <button mat-flat-button color="primary" class="full-width submit-btn" type="submit" [disabled]="loginForm.invalid || loading()">
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Iniciar sesión
              }
            </button>
          </form>

          <div class="links">
            <a routerLink="/auth/forgot-password" class="forgot-link">¿Olvidaste tu contraseña?</a>
          </div>

          <mat-divider class="divider"></mat-divider>

          <div class="oauth-section">
            <p class="oauth-label">O continuar con</p>
            <div class="oauth-buttons">
              <button mat-stroked-button class="oauth-btn google-btn" (click)="loginWithProvider('google')">
                <img src="https://www.google.com/favicon.ico" alt="Google" class="oauth-icon" />
                Google
              </button>
              <button mat-stroked-button class="oauth-btn github-btn" (click)="loginWithProvider('github')">
                <svg class="oauth-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12 24 5.37 18.63 0 12 0z"/>
                </svg>
                GitHub
              </button>
              <button mat-stroked-button class="oauth-btn microsoft-btn" (click)="loginWithProvider('microsoft')">
                <svg class="oauth-icon" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="1" y="1" width="10" height="10" fill="#f25022"/>
                  <rect x="13" y="1" width="10" height="10" fill="#7fba00"/>
                  <rect x="1" y="13" width="10" height="10" fill="#00a4ef"/>
                  <rect x="13" y="13" width="10" height="10" fill="#ffb900"/>
                </svg>
                Microsoft
              </button>
            </div>
          </div>

          <div class="register-link">
            <span>¿No tienes cuenta?</span>
            <a routerLink="/auth/register">Regístrate</a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 24px;
      background: #f5f5f5;
      box-sizing: border-box;
    }

    .login-card {
      max-width: 420px;
      width: 100%;
      padding: 32px;
      border-radius: 12px;
    }

    .login-card mat-card-header {
      padding: 0 0 8px;
      margin-bottom: 24px;
    }

    .login-card mat-card-title {
      font-size: 24px;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .login-card mat-card-subtitle {
      font-size: 14px;
      color: #666;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .full-width {
      width: 100%;
    }

    .submit-btn {
      margin-top: 4px;
      height: 48px;
      font-size: 16px;
      border-radius: 6px;
    }

    .submit-btn mat-spinner {
      display: inline-block;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #fce4ec;
      border-radius: 6px;
      color: #c62828;
      font-size: 14px;
    }

    .links {
      text-align: center;
      margin-top: 20px;
    }

    .forgot-link {
      font-size: 14px;
    }

    .divider {
      margin: 24px 0 20px;
    }

    .oauth-section {
      text-align: center;
    }

    .oauth-label {
      font-size: 13px;
      color: #666;
      margin: 0 0 16px;
    }

    .oauth-buttons {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .oauth-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      height: 44px;
      border-radius: 6px;
    }

    .oauth-icon {
      width: 18px;
      height: 18px;
    }

    .register-link {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
    }

    .register-link a {
      margin-left: 4px;
    }
  `,
})
export class LoginPageComponent implements OnInit {
  readonly hidePassword = signal(true);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly loginForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const accessToken = params['accessToken'];
      const refreshToken = params['refreshToken'];
      const error = params['error'];

      if (error) {
        this.error.set('Error al autenticar con el proveedor OAuth.');
        return;
      }

      if (accessToken && refreshToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        this.router.navigate(['/']);
      }
    });
  }

  loginWithProvider(provider: string): void {
    window.location.href = `${environment.apiUrl}/auth/${provider}`;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
        this.userService.setFromLogin(res.user);
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al iniciar sesión');
        this.loading.set(false);
      },
    });
  }
}
