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
  selector: 'app-reset-password-page',
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
    <div class="reset-container">
      <mat-card class="reset-card">
        <mat-card-header>
          <mat-card-title>Restablecer Contraseña</mat-card-title>
          <mat-card-subtitle>Ingresa el token y tu nueva contraseña</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (resetDone()) {
            <div class="success-message">
              <mat-icon color="primary">check_circle</mat-icon>
              <h3>¡Contraseña restablecida!</h3>
              <p>Tu contraseña ha sido cambiada exitosamente.</p>
              <button mat-flat-button color="primary" routerLink="/auth/login">
                Iniciar sesión
              </button>
            </div>
          } @else {
            <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="reset-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Token de recuperación</mat-label>
                <input matInput formControlName="token" placeholder="00000000-0000-0000-0000-000000000000" />
                @if (resetForm.get('token')?.hasError('required') && resetForm.get('token')?.touched) {
                  <mat-error>El token es requerido</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nueva contraseña</mat-label>
                <input matInput formControlName="password" [type]="hidePassword() ? 'password' : 'text'" />
                <button mat-icon-button matSuffix (click)="hidePassword.set(!hidePassword())" type="button">
                  <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (resetForm.get('password')?.hasError('required') && resetForm.get('password')?.touched) {
                  <mat-error>La contraseña es requerida</mat-error>
                }
                @if (resetForm.get('password')?.hasError('minlength') && resetForm.get('password')?.touched) {
                  <mat-error>Mínimo 8 caracteres</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Confirmar contraseña</mat-label>
                <input matInput formControlName="confirmPassword" [type]="hidePassword() ? 'password' : 'text'" />
                @if (resetForm.hasError('mismatch') && resetForm.get('confirmPassword')?.touched) {
                  <mat-error>Las contraseñas no coinciden</mat-error>
                }
              </mat-form-field>

              @if (error(); as err) {
                <div class="error-message">
                  <mat-icon color="warn">error</mat-icon>
                  <span>{{ err }}</span>
                </div>
              }

              <button mat-flat-button color="primary" class="full-width submit-btn" type="submit" [disabled]="resetForm.invalid || loading()">
                @if (loading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  Restablecer contraseña
                }
              </button>
            </form>

            <div class="links">
              <a routerLink="/auth/forgot-password">Solicitar nuevo token</a>
              <a routerLink="/auth/login">Volver a inicio de sesión</a>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .reset-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 16px;
      background: #f5f5f5;
    }

    .reset-card {
      max-width: 420px;
      width: 100%;
      padding: 16px;
    }

    .reset-card mat-card-header {
      margin-bottom: 16px;
    }

    .reset-form {
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

    .links {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      font-size: 14px;
    }
  `,
})
export class ResetPasswordPageComponent {
  readonly hidePassword = signal(true);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly resetDone = signal(false);

  readonly resetForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
  ) {
    this.resetForm = this.fb.group({
      token: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.resetForm.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    const { confirmPassword, ...dto } = this.resetForm.value;

    this.authService.resetPassword(dto).subscribe({
      next: () => {
        this.resetDone.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al restablecer la contraseña');
        this.loading.set(false);
      },
    });
  }
}
