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
  selector: 'app-register-page',
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
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>Crear Cuenta</mat-card-title>
          <mat-card-subtitle>Regístrate en neoMotors</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (verificationToken(); as token) {
            <div class="success-message">
              <mat-icon color="primary">check_circle</mat-icon>
              <h3>¡Registro exitoso!</h3>
              <p>Se ha generado un token de verificación.</p>
              <p class="token-info">Token: <code>{{ token }}</code></p>
              <p class="expires">Expira en: {{ expiresIn() }}</p>
              <button mat-flat-button color="primary" [routerLink]="['/auth/verify']">
                Ir a verificar cuenta
              </button>
            </div>
          } @else {
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nombre</mat-label>
                <input matInput formControlName="nombre" placeholder="Tu nombre" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Correo electrónico</mat-label>
                <input matInput formControlName="email" type="email" placeholder="correo@ejemplo.com" />
                @if (registerForm.get('email')?.hasError('required') && registerForm.get('email')?.touched) {
                  <mat-error>El correo es requerido</mat-error>
                }
                @if (registerForm.get('email')?.hasError('email') && registerForm.get('email')?.touched) {
                  <mat-error>Ingresa un correo válido</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Contraseña</mat-label>
                <input matInput formControlName="password" [type]="hidePassword() ? 'password' : 'text'" />
                <button mat-icon-button matSuffix (click)="hidePassword.set(!hidePassword())" type="button">
                  <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (registerForm.get('password')?.hasError('required') && registerForm.get('password')?.touched) {
                  <mat-error>La contraseña es requerida</mat-error>
                }
                @if (registerForm.get('password')?.hasError('minlength') && registerForm.get('password')?.touched) {
                  <mat-error>Mínimo 8 caracteres</mat-error>
                }
              </mat-form-field>

              @if (error(); as err) {
                <div class="error-message">
                  <mat-icon color="warn">error</mat-icon>
                  <span>{{ err }}</span>
                </div>
              }

              <button mat-flat-button color="primary" class="full-width submit-btn" type="submit" [disabled]="registerForm.invalid || loading()">
                @if (loading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  Registrarse
                }
              </button>
            </form>

            <div class="login-link">
              <span>¿Ya tienes cuenta?</span>
              <a routerLink="/auth/login">Inicia sesión</a>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 16px;
      background: #f5f5f5;
    }

    .register-card {
      max-width: 420px;
      width: 100%;
      padding: 16px;
    }

    .register-card mat-card-header {
      margin-bottom: 16px;
    }

    .register-form {
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

    .success-message {
      text-align: center;
      padding: 24px 16px;
    }

    .success-message mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .token-info {
      background: #f5f5f5;
      padding: 8px;
      border-radius: 4px;
      font-size: 12px;
      word-break: break-all;
    }

    .expires {
      font-size: 12px;
      color: #666;
    }

    .login-link {
      text-align: center;
      margin-top: 16px;
      font-size: 14px;
    }

    .login-link a {
      margin-left: 4px;
    }
  `,
})
export class RegisterPageComponent {
  readonly hidePassword = signal(true);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly verificationToken = signal<string | null>(null);
  readonly expiresIn = signal<string>('');

  readonly registerForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
  ) {
    this.registerForm = this.fb.group({
      nombre: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.verificationToken.set(res.data.verificationToken);
        this.expiresIn.set(res.data.expiresIn);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al registrar usuario');
        this.loading.set(false);
      },
    });
  }
}
