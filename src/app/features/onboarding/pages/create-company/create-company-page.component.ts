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

                <div class="customization-grid">
                  <div class="color-picker-row full-width">
                    <label class="color-label">Color Primario</label>
                    <div class="color-input-wrapper">
                      <div class="color-swatch" [style.background]="companyForm.get('colorPrimario')?.value || '#1976D2'" (click)="colorPrimaryInput.click()">
                        <input #colorPrimaryInput type="color" [value]="companyForm.get('colorPrimario')?.value || '#1976D2'" (input)="onColorChange('colorPrimario', $event)" class="color-native-input" />
                      </div>
                      <mat-form-field appearance="outline" class="hex-field">
                        <input matInput [value]="companyForm.get('colorPrimario')?.value || '#1976D2'" (input)="onHexChange('colorPrimario', $event)" placeholder="#HEX" maxlength="7" />
                      </mat-form-field>
                    </div>
                  </div>

                  <div class="color-picker-row full-width">
                    <label class="color-label">Color Secundario</label>
                    <div class="color-input-wrapper">
                      <div class="color-swatch" [style.background]="companyForm.get('colorSecundario')?.value || '#4CAF50'" (click)="colorSecondaryInput.click()">
                        <input #colorSecondaryInput type="color" [value]="companyForm.get('colorSecundario')?.value || '#4CAF50'" (input)="onColorChange('colorSecundario', $event)" class="color-native-input" />
                      </div>
                      <mat-form-field appearance="outline" class="hex-field">
                        <input matInput [value]="companyForm.get('colorSecundario')?.value || '#4CAF50'" (input)="onHexChange('colorSecundario', $event)" placeholder="#HEX" maxlength="7" />
                      </mat-form-field>
                    </div>
                  </div>

                  <div class="logo-section full-width">
                    <label class="color-label">Logotipo</label>
                    @if (logoPreview(); as preview) {
                      <div class="logo-preview-container">
                        <img [src]="preview" class="logo-preview-img" alt="Logo preview" />
                        <div class="logo-info">
                          <span class="file-name">{{ logoFile()?.name }}</span>
                          <span class="file-size">{{ (logoFile()?.size ?? 0) / 1024 | number:'1.0-0' }} KB</span>
                        </div>
                        <div class="logo-actions">
                          <button mat-stroked-button type="button" (click)="logoInput.click()">
                            <mat-icon>sync</mat-icon>
                            Cambiar
                          </button>
                          <button mat-stroked-button type="button" color="warn" (click)="removeLogo()">
                            <mat-icon>delete</mat-icon>
                            Eliminar
                          </button>
                        </div>
                      </div>
                    } @else {
                      <div class="logo-upload-zone" (click)="logoInput.click()">
                        <mat-icon class="upload-icon">cloud_upload</mat-icon>
                        <span class="upload-text">Subir Logotipo</span>
                        <span class="upload-hint">PNG, JPG, SVG o WEBP — Máx. 5 MB</span>
                      </div>
                    }
                    <input #logoInput type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" (change)="onLogoSelected($event)" hidden />
                    @if (logoError(); as err) {
                      <div class="logo-error">
                        <mat-icon color="warn">error</mat-icon>
                        <span>{{ err }}</span>
                      </div>
                    }
                  </div>

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
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly logoFile = signal<File | null>(null);
  readonly logoPreview = signal<string | null>(null);
  readonly logoError = signal<string | null>(null);

  readonly companyForm: FormGroup;

  private readonly MAX_LOGO_SIZE = 5 * 1024 * 1024;
  private readonly ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];

  constructor() {
    this.companyForm = this.fb.group({
      nombre: ['', Validators.required],
      rfc: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(13)]],
      razonSocial: ['', Validators.required],
      codigoPostalFiscal: ['', [Validators.required, Validators.maxLength(5)]],
      regimenFiscal: ['', Validators.required],
      colorPrimario: ['#1976D2'],
      colorSecundario: ['#4CAF50'],
      tema: ['light'],
    });
  }

  onColorChange(field: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.companyForm.get(field)?.setValue(input.value);
  }

  onHexChange(field: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    if (value && !value.startsWith('#')) {
      value = '#' + value;
    }
    if (/^#[0-9a-fA-F]{0,6}$/.test(value)) {
      this.companyForm.get(field)?.setValue(value);
    }
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.logoError.set(null);

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      this.logoError.set('Formato no permitido. Use PNG, JPG, SVG o WEBP.');
      return;
    }

    if (file.size > this.MAX_LOGO_SIZE) {
      this.logoError.set('El archivo excede el tamaño máximo de 5 MB.');
      return;
    }

    this.logoFile.set(file);

    const reader = new FileReader();
    reader.onload = () => {
      this.logoPreview.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  removeLogo(): void {
    this.logoFile.set(null);
    this.logoPreview.set(null);
    this.logoError.set(null);
  }

  onSubmit(): void {
    if (this.companyForm.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    const values = this.companyForm.value;

    const createCompany = (logoUrl?: string) => {
      this.companiesService.create({ ...values, logoUrl }).subscribe({
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
    };

    if (this.logoFile()) {
      this.companiesService.uploadLogo(this.logoFile()!).subscribe({
        next: (res: any) => {
          createCompany(res.url || res.logoUrl);
        },
        error: () => {
          createCompany();
        },
      });
    } else {
      createCompany();
    }
  }
}
