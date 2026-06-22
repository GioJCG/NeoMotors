import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password-page',
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
    <div class="forgot-container">
      <mat-card class="forgot-card">
        <mat-card-header>
          <mat-card-title>Recuperar Contraseña</mat-card-title>
          <mat-card-subtitle>Te enviaremos un token de recuperación</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (emailSent()) {
            <div class="success-message">
              <mat-icon color="primary">mail</mat-icon>
              <h3>Correo enviado</h3>
              <p>{{ successMessage() }}</p>
              @if (resetToken(); as token) {
                <p class="token-info">Token: <code>{{ token }}</code></p>
              }
              <button mat-flat-button color="primary" class="full-width" routerLink="/auth/reset-password">
                Ir a restablecer contraseña
              </button>
            </div>
          } @else {
            <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="forgot-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Correo electrónico</mat-label>
                <input matInput formControlName="email" type="email" placeholder="correo@ejemplo.com" />
                @if (forgotForm.get('email')?.hasError('required') && forgotForm.get('email')?.touched) {
                  <mat-error>El correo es requerido</mat-error>
                }
                @if (forgotForm.get('email')?.hasError('email') && forgotForm.get('email')?.touched) {
                  <mat-error>Ingresa un correo válido</mat-error>
                }
              </mat-form-field>

              @if (error(); as err) {
                <div class="error-message">
                  <mat-icon color="warn">error</mat-icon>
                  <span>{{ err }}</span>
                </div>
              }

              <button mat-flat-button color="primary" class="full-width submit-btn" type="submit" [disabled]="forgotForm.invalid || loading()">
                @if (loading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  Enviar token de recuperación
                }
              </button>
            </form>

            <div class="back-link">
              <a routerLink="/auth/login">Volver a inicio de sesión</a>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .forgot-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 16px;
      background: #f5f5f5;
    }

    .forgot-card {
      max-width: 420px;
      width: 100%;
      padding: 16px;
    }

    .forgot-card mat-card-header {
      margin-bottom: 16px;
    }

    .forgot-form {
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

    .back-link {
      text-align: center;
      margin-top: 16px;
      font-size: 14px;
    }
  `,
})
export class ForgotPasswordPageComponent {
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly emailSent = signal(false);
  readonly resetToken = signal<string | null>(null);
  readonly successMessage = signal('');

  readonly forgotForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    this.authService.forgotPassword(this.forgotForm.value).subscribe({
      next: (res) => {
        this.emailSent.set(true);
        this.successMessage.set(res.data.message);
        if (res.data.resetToken) {
          this.resetToken.set(res.data.resetToken);
        }
        this.loading.set(false);
      },
      error: () => {
        this.emailSent.set(true);
        this.successMessage.set('Si el correo está registrado, recibirá un enlace de recuperación.');
        this.loading.set(false);
      },
    });
  }
}
