import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { CompaniesService } from '../../../companies/services/companies.service';
import { UserService } from '../../../../core/services/user.service';
import { Company } from '../../../companies/models/company.model';

@Component({
  selector: 'app-create-company-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatDividerModule,
  ],
  template: `
    <div class="onboarding-container">
      <mat-card class="onboarding-card">
        <mat-card-header>
          <mat-card-title>Bienvenido a neoMotors</mat-card-title>
          <mat-card-subtitle>Para comenzar, crea tu empresa. Este será tu primer paso para gestionar tu taller.</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <mat-stepper linear #stepper>
            <mat-step [stepControl]="companyForm" label="Datos de la empresa">
              <form [formGroup]="companyForm">
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Nombre comercial</mat-label>
                    <input matInput formControlName="nombre" placeholder="Taller El Chapulín" />
                    @if (companyForm.get('nombre')?.hasError('required') && companyForm.get('nombre')?.touched) {
                      <mat-error>Requerido</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>RFC</mat-label>
                    <input matInput formControlName="rfc" placeholder="CHP120101ABC" maxlength="13" style="text-transform: uppercase" />
                    @if (companyForm.get('rfc')?.hasError('required') && companyForm.get('rfc')?.touched) {
                      <mat-error>Requerido</mat-error>
                    }
                    @if (companyForm.get('rfc')?.hasError('minlength') && companyForm.get('rfc')?.touched) {
                      <mat-error>Mínimo 12 caracteres</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Razón social</mat-label>
                    <input matInput formControlName="razonSocial" placeholder="Taller El Chapulín S.A. de C.V." />
                    @if (companyForm.get('razonSocial')?.hasError('required') && companyForm.get('razonSocial')?.touched) {
                      <mat-error>Requerido</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Código postal</mat-label>
                    <input matInput formControlName="codigoPostalFiscal" placeholder="45019" maxlength="5" />
                    @if (companyForm.get('codigoPostalFiscal')?.hasError('required') && companyForm.get('codigoPostalFiscal')?.touched) {
                      <mat-error>Requerido</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Régimen fiscal</mat-label>
                    <mat-select formControlName="regimenFiscal">
                      <mat-option value="601">General de Ley Personas Morales</mat-option>
                      <mat-option value="605">Sueldos y Salarios e Ingresos Asimilados a Salarios</mat-option>
                      <mat-option value="606">Arrendamiento</mat-option>
                      <mat-option value="607">Régimen de Enajenación o Adquisición de Bienes</mat-option>
                      <mat-option value="608">Demás ingresos</mat-option>
                      <mat-option value="609">Consolidación</mat-option>
                      <mat-option value="610">Residentes en el Extranjero sin Establecimiento Permanente</mat-option>
                      <mat-option value="611">Dividendos (Sociedades y Asociaciones)</mat-option>
                      <mat-option value="612">Personas Físicas con Actividades Empresariales y Profesionales</mat-option>
                      <mat-option value="614">Ingresos por intereses</mat-option>
                      <mat-option value="616">Sin obligaciones fiscales</mat-option>
                      <mat-option value="620">Sociedades Cooperativas de Producción</mat-option>
                      <mat-option value="621">Incorporación Fiscal</mat-option>
                      <mat-option value="622">Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras</mat-option>
                      <mat-option value="623">Opcional para Grupos de Sociedades</mat-option>
                      <mat-option value="624">Coordinados</mat-option>
                      <mat-option value="625">Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas</mat-option>
                      <mat-option value="626">Régimen Simplificado de Confianza</mat-option>
                    </mat-select>
                    @if (companyForm.get('regimenFiscal')?.hasError('required') && companyForm.get('regimenFiscal')?.touched) {
                      <mat-error>Requerido</mat-error>
                    }
                  </mat-form-field>
                </div>

                <mat-divider class="section-divider"></mat-divider>
                <h3 class="section-title">Personalización (opcional)</h3>

                <div class="form-grid">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>URL del Logo</mat-label>
                    <input matInput formControlName="logoUrl" placeholder="https://ejemplo.com/logo.png" />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Color Primario</mat-label>
                    <input matInput formControlName="colorPrimario" placeholder="#1976D2" />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Color Secundario</mat-label>
                    <input matInput formControlName="colorSecundario" placeholder="#FF5722" />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Tema</mat-label>
                    <mat-select formControlName="tema">
                      <mat-option value="light">Claro</mat-option>
                      <mat-option value="dark">Oscuro</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="step-actions">
                  <button mat-flat-button color="primary" (click)="onSubmit()" [disabled]="companyForm.invalid || loading()">
                    @if (loading()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      Crear empresa
                    }
                  </button>
                </div>
              </form>
            </mat-step>
          </mat-stepper>

          @if (error(); as err) {
            <div class="error-message">
              <mat-icon color="warn">error</mat-icon>
              <span>{{ err }}</span>
            </div>
          }
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
      max-width: 640px;
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

    .full-width {
      grid-column: 1 / -1;
    }

    .section-divider { margin: 16px 0; }
    .section-title { font-size: 16px; font-weight: 500; color: #666; margin: 0 0 8px; }

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
  private readonly fb = inject(FormBuilder);
  private readonly companiesService = inject(CompaniesService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly companyForm: FormGroup;

  constructor() {
    this.companyForm = this.fb.group({
      nombre: ['', Validators.required],
      rfc: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(13)]],
      razonSocial: ['', Validators.required],
      codigoPostalFiscal: ['', [Validators.required, Validators.maxLength(5)]],
      regimenFiscal: ['', Validators.required],
      logoUrl: [''],
      colorPrimario: [''],
      colorSecundario: [''],
      tema: [''],
    });
  }

  onSubmit(): void {
    if (this.companyForm.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    this.companiesService.create(this.companyForm.value).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        const companyId = res?.id || res?.data?.id;
        if (companyId) {
          this.userService.setCurrentCompany(companyId, res.nombre);
        }
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al crear la empresa');
        this.loading.set(false);
      },
    });
  }
}
