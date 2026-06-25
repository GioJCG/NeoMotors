import { Component, OnInit, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { CompaniesService } from '../../../features/companies/services/companies.service';
import { ColorPickerFieldComponent } from '../color-picker-field/color-picker-field.component';
import { LogoUploaderComponent } from '../logo-uploader/logo-uploader.component';
import { Company } from '../../../features/companies/models/company.model';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    ColorPickerFieldComponent,
    LogoUploaderComponent,
  ],
  template: `
    <div class="form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ mode() === 'edit' ? 'Editar Empresa' : 'Crear Empresa' }}</mat-card-title>
          @if (subtitle()) {
            <mat-card-subtitle>{{ subtitle() }}</mat-card-subtitle>
          }
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-content">
            <div class="form-grid">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nombre comercial</mat-label>
                <input matInput formControlName="nombre" placeholder="Taller El Chapulín" />
                @if (form.get('nombre')?.hasError('required') && form.get('nombre')?.touched) {
                  <mat-error>Requerido</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>RFC</mat-label>
                <input matInput formControlName="rfc" placeholder="CHP120101ABC" maxlength="13" style="text-transform: uppercase" />
                @if (form.get('rfc')?.hasError('required') && form.get('rfc')?.touched) {
                  <mat-error>Requerido</mat-error>
                }
                @if (form.get('rfc')?.hasError('minlength') && form.get('rfc')?.touched) {
                  <mat-error>Mínimo 12 caracteres</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Razón social</mat-label>
                <input matInput formControlName="razonSocial" placeholder="Taller El Chapulín S.A. de C.V." />
                @if (form.get('razonSocial')?.hasError('required') && form.get('razonSocial')?.touched) {
                  <mat-error>Requerido</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Código postal</mat-label>
                <input matInput formControlName="codigoPostalFiscal" placeholder="45019" maxlength="5" />
                @if (form.get('codigoPostalFiscal')?.hasError('required') && form.get('codigoPostalFiscal')?.touched) {
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
                @if (form.get('regimenFiscal')?.hasError('required') && form.get('regimenFiscal')?.touched) {
                  <mat-error>Requerido</mat-error>
                }
              </mat-form-field>
            </div>

            <mat-divider class="section-divider"></mat-divider>
            <h3 class="section-title">Personalización (opcional)</h3>

            <div class="customization-grid">
              <app-color-picker-field
                label="Color Primario"
                class="full-width"
                [(value)]="colorPrimario"
              />
              <app-color-picker-field
                label="Color Secundario"
                class="full-width"
                [(value)]="colorSecundario"
              />

              <app-logo-uploader
                class="full-width"
                label="Logotipo"
                [currentLogoUrl]="currentLogoUrl"
                (logoFile)="onLogoFileChange($event)"
                (logoRemoved)="onLogoRemoved()"
              />

              <mat-form-field appearance="outline">
                <mat-label>Tema</mat-label>
                <mat-select formControlName="tema">
                  <mat-option value="light">Claro</mat-option>
                  <mat-option value="dark">Oscuro</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            @if (error(); as err) {
              <div class="error-message">
                <mat-icon color="warn">error</mat-icon>
                <span>{{ err }}</span>
              </div>
            }

            <div class="form-actions">
              @if (cancelRoute()) {
                <button mat-stroked-button type="button" [routerLink]="cancelRoute()">
                  Cancelar
                </button>
              }
              <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()">
                @if (loading()) {
                  <mat-spinner diameter="20" />
                } @else {
                  {{ mode() === 'edit' ? 'Guardar cambios' : 'Crear empresa' }}
                }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .form-container {
      max-width: 640px;
      margin: 24px auto;
      padding: 0 16px;
    }

    mat-card-header {
      margin-bottom: 16px;
    }

    mat-card-title {
      font-size: 24px;
      font-weight: 500;
    }

    mat-card-subtitle {
      font-size: 14px;
      color: #666;
    }

    .form-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
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

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }

    .form-actions button {
      height: 48px;
      font-size: 16px;
      border-radius: 6px;
      min-width: 180px;
    }

    .form-actions mat-spinner {
      display: inline-block;
    }
  `,
})
export class CompanyFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly companiesService = inject(CompaniesService);

  readonly mode = input<'create' | 'edit'>('create');
  readonly companyId = input<string | null>(null);
  readonly cancelRoute = input<string>('/companies');
  readonly subtitle = input<string>('');
  readonly saved = output<Company>();

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  selectedLogoFile: File | null = null;
  logoWasRemoved = false;
  currentLogoUrl: string | null = null;

  colorPrimario = '#1976D2';
  colorSecundario = '#4CAF50';

  readonly form: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    rfc: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(13)]],
    razonSocial: ['', Validators.required],
    codigoPostalFiscal: ['', [Validators.required, Validators.maxLength(5)]],
    regimenFiscal: ['', Validators.required],
    tema: ['light'],
  });

  ngOnInit(): void {
    if (this.mode() === 'edit' && this.companyId()) {
      this.loadCompany(this.companyId()!);
    }
  }

  private loadCompany(id: string): void {
    this.companiesService.findById(id).subscribe({
      next: (company) => {
        this.currentLogoUrl = company.logoUrl || null;
        this.colorPrimario = company.colorPrimario || '#1976D2';
        this.colorSecundario = company.colorSecundario || '#4CAF50';
        this.form.patchValue({
          nombre: company.nombre,
          rfc: company.rfc,
          razonSocial: company.razonSocial,
          codigoPostalFiscal: company.codigoPostalFiscal,
          regimenFiscal: company.regimenFiscal,
          tema: company.tema || 'light',
        });
      },
      error: () => {
        this.error.set('Error al cargar los datos de la empresa');
      },
    });
  }

  onLogoFileChange(file: File | null): void {
    this.selectedLogoFile = file;
    if (file) {
      this.logoWasRemoved = false;
    }
  }

  onLogoRemoved(): void {
    this.logoWasRemoved = true;
    this.selectedLogoFile = null;
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    const values = this.form.value;
    const basePayload = {
      nombre: values.nombre,
      rfc: values.rfc.toUpperCase(),
      razonSocial: values.razonSocial,
      codigoPostalFiscal: values.codigoPostalFiscal,
      regimenFiscal: values.regimenFiscal,
      colorPrimario: this.colorPrimario,
      colorSecundario: this.colorSecundario,
      tema: values.tema,
    };

    const doSave = (logoUrl?: string | null) => {
      const payload: any = { ...basePayload };
      if (logoUrl !== undefined) {
        payload.logoUrl = logoUrl;
      }

      const request = this.mode() === 'edit'
        ? this.companiesService.update(this.companyId()!, payload)
        : this.companiesService.create(payload);

      request.subscribe({
        next: (res: any) => {
          this.loading.set(false);
          this.saved.emit(res);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al guardar la empresa');
          this.loading.set(false);
        },
      });
    };

    if (this.logoWasRemoved) {
      doSave(null);
    } else if (this.selectedLogoFile) {
      this.companiesService.uploadLogo(this.selectedLogoFile).subscribe({
        next: (res: { url: string }) => doSave(res.url),
        error: () => {
          this.error.set('Error al subir el logotipo');
          this.loading.set(false);
        },
      });
    } else if (this.mode() === 'edit') {
      doSave(undefined);
    } else {
      doSave(undefined);
    }
  }
}
