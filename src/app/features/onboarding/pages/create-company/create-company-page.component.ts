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
