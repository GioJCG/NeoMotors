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
  selector: 'app-verify-page',
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
    <div class="verify-container">
      <mat-card class="verify-card">
        <mat-card-header>
          <mat-card-title>Verificar Cuenta</mat-card-title>
          <mat-card-subtitle>Ingresa el token de verificación</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (verified()) {
            <div class="success-message">
              <mat-icon color="primary">verified</mat-icon>
              <h3>¡Cuenta verificada!</h3>
              <p>Tu cuenta ahora está activa. Puedes iniciar sesión.</p>
              <button mat-flat-button color="primary" routerLink="/auth/login">
                Iniciar sesión
              </button>
            </div>
          } @else {
            <form [formGroup]="verifyForm" (ngSubmit)="onSubmit()" class="verify-form">
              <p class="instruction">
                Ingresa el token UUID que recibiste al registrarte para activar tu cuenta.
              </p>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Token de verificación</mat-label>
                <input matInput formControlName="token" placeholder="00000000-0000-0000-0000-000000000000" />
                @if (verifyForm.get('token')?.hasError('required') && verifyForm.get('token')?.touched) {
                  <mat-error>El token es requerido</mat-error>
                }
              </mat-form-field>

              @if (error(); as err) {
                <div class="error-message">
                  <mat-icon color="warn">error</mat-icon>
                  <span>{{ err }}</span>
                </div>
              }

              <button mat-flat-button color="primary" class="full-width submit-btn" type="submit" [disabled]="verifyForm.invalid || loading()">
                @if (loading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  Verificar cuenta
                }
              </button>
            </form>

            <div class="register-link">
              <span>¿No tienes cuenta?</span>
              <a routerLink="/auth/register">Regístrate</a>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .verify-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 16px;
      background: #f5f5f5;
    }

    .verify-card {
      max-width: 420px;
      width: 100%;
      padding: 16px;
    }

    .verify-card mat-card-header {
      margin-bottom: 16px;
    }

    .verify-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .instruction {
      color: #666;
      font-size: 14px;
      margin: 0 0 8px;
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

    .register-link {
      text-align: center;
      margin-top: 16px;
      font-size: 14px;
    }

    .register-link a {
      margin-left: 4px;
    }
  `,
})
export class VerifyPageComponent {
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly verified = signal(false);

  readonly verifyForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
  ) {
    this.verifyForm = this.fb.group({
      token: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.verifyForm.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    this.authService.verify(this.verifyForm.value).subscribe({
      next: () => {
        this.verified.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al verificar cuenta');
        this.loading.set(false);
      },
    });
  }
}
