import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { CompanyFormComponent } from '../../../../shared/components/company-form/company-form.component';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-create-company-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatStepperModule, CompanyFormComponent],
  template: `
    <div class="onboarding-container">
      <mat-card class="onboarding-card">
        <mat-card-header>
          <mat-card-title>Bienvenido a neoMotors</mat-card-title>
          <mat-card-subtitle>Para comenzar, crea tu empresa. Este será tu primer paso para gestionar tu taller.</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <mat-stepper linear #stepper>
            <mat-step label="Datos de la empresa">
              <app-company-form
                mode="create"
                cancelRoute="/auth/login"
                (saved)="onCompanySaved($event)"
              />
            </mat-step>
          </mat-stepper>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .onboarding-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 24px;
      background: #f5f5f5;
      box-sizing: border-box;
    }

    .onboarding-card {
      max-width: 720px;
      width: 100%;
      padding: 32px;
      border-radius: 12px;
    }

    .onboarding-card mat-card-header {
      padding: 0 0 8px;
      margin-bottom: 24px;
    }

    .onboarding-card mat-card-title {
      font-size: 24px;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .onboarding-card mat-card-subtitle {
      font-size: 14px;
      color: #666;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 16px;
    }

    .customization-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 16px;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .section-divider { margin: 16px 0; }
    .section-title { font-size: 16px; font-weight: 500; color: #666; margin: 0 0 8px; }

    .color-label {
      font-size: 13px;
      color: #666;
      margin-bottom: 4px;
      display: block;
    }

    .color-picker-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .color-input-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .color-swatch {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      border: 2px solid #e0e0e0;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      flex-shrink: 0;
      transition: border-color 0.2s;
    }

    .color-swatch:hover {
      border-color: #1976d2;
    }

    .color-native-input {
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      cursor: pointer;
      opacity: 0;
    }

    .hex-field {
      flex: 1;
    }

    .hex-field ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    .hex-field ::ng-deep .mat-mdc-form-field-infix {
      width: auto;
      min-width: 100px;
    }

    .logo-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .logo-upload-zone {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 32px 16px;
      border: 2px dashed #c0c0c0;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
      background: #fafafa;
    }

    .logo-upload-zone:hover {
      border-color: #1976d2;
      background: #e3f2fd;
    }

    .upload-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #1976d2;
    }

    .upload-text {
      font-size: 15px;
      font-weight: 500;
      color: #333;
    }

    .upload-hint {
      font-size: 12px;
      color: #999;
    }

    .logo-preview-container {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      background: #fafafa;
    }

    .logo-preview-img {
      width: 80px;
      height: 80px;
      object-fit: contain;
      border-radius: 8px;
      background: #fff;
      border: 1px solid #e0e0e0;
    }

    .logo-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
      min-width: 0;
    }

    .file-name {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .file-size {
      font-size: 12px;
      color: #999;
    }

    .logo-actions {
      display: flex;
      gap: 8px;
    }

    .logo-error {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #c62828;
    }

    .step-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 24px;
      gap: 12px;
    }

    .step-actions button {
      height: 48px;
      font-size: 16px;
      border-radius: 6px;
      min-width: 180px;
    }

    .step-actions mat-spinner {
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
      margin-top: 16px;
    }
  `,
})
export class CreateCompanyPageComponent {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  onCompanySaved(res: any): void {
    const companyId = res?.id || res?.data?.id;
    if (companyId) {
      this.userService.setCurrentCompany(companyId, res.nombre);
    }
    this.router.navigate(['/']);
  }
}
