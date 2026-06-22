import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

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
      padding: 16px;
      background: #f5f5f5;
    }

    .login-card {
      max-width: 420px;
      width: 100%;
      padding: 16px;
    }

    .login-card mat-card-header {
      margin-bottom: 16px;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .full-width {
      width: 100%;
    }

    .submit-btn {
      margin-top: 8px;
      height: 48px;
    }

    .submit-btn mat-spinner {
      display: inline-block;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: #fce4ec;
      border-radius: 4px;
      color: #c62828;
      font-size: 14px;
    }

    .links {
      text-align: center;
      margin-top: 16px;
    }

    .forgot-link {
      font-size: 14px;
    }

    .register-link {
      text-align: center;
      margin-top: 8px;
      font-size: 14px;
    }

    .register-link a {
      margin-left: 4px;
    }
  `,
})
export class LoginPageComponent {
  readonly hidePassword = signal(true);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly loginForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
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
