import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-verification-success-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="success-container">
      <mat-card class="success-card">
        <mat-card-content>
          <div class="success-content">
            <mat-icon color="primary" class="big-icon">check_circle</mat-icon>
            <h2>¡Registro exitoso!</h2>
            <p class="main-message">
              Tu cuenta ha sido creada y verificada automáticamente.
            </p>
            <p class="sub-message">Ya puedes iniciar sesión en NeoMotors.</p>
            <button
              mat-flat-button
              color="primary"
              class="login-btn"
              routerLink="/auth/login"
            >
              Iniciar sesión
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .success-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 16px;
      background: #f5f5f5;
    }

    .success-card {
      max-width: 420px;
      width: 100%;
      padding: 32px 16px;
    }

    .success-content {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .big-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
    }

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }

    .main-message {
      font-size: 16px;
      color: #333;
      margin: 0;
    }

    .sub-message {
      font-size: 14px;
      color: #666;
      margin: 0;
    }

    .login-btn {
      margin-top: 16px;
      padding: 8px 32px;
      font-size: 16px;
    }
  `,
})
export class VerificationSuccessPageComponent {}
