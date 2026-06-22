import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { CompaniesService } from '../../services/companies.service';

@Component({
  selector: 'app-company-form-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ isEditMode() ? 'Editar Empresa' : 'Nueva Empresa' }}</mat-card-title>
          <mat-card-subtitle>
            {{ isEditMode() ? 'Actualiza los datos de la empresa' : 'Registra una nueva empresa en el sistema' }}
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="companyForm" (ngSubmit)="onSubmit()" class="company-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nombre de la empresa</mat-label>
                <input matInput formControlName="nombre" placeholder="Taller El Chapulín S.A. de C.V." />
                @if (companyForm.get('nombre')?.hasError('required') && companyForm.get('nombre')?.touched) {
                  <mat-error>El nombre es requerido</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>RFC</mat-label>
                <input matInput formControlName="rfc" placeholder="CHP120101ABC" maxlength="13" />
                @if (companyForm.get('rfc')?.hasError('required') && companyForm.get('rfc')?.touched) {
                  <mat-error>El RFC es requerido</mat-error>
                }
                @if (companyForm.get('rfc')?.hasError('minlength') || companyForm.get('rfc')?.hasError('maxlength')) {
                  <mat-error>El RFC debe tener 12 o 13 caracteres</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Código Postal Fiscal</mat-label>
                <input matInput formControlName="codigoPostalFiscal" placeholder="45019" maxlength="5" />
                @if (companyForm.get('codigoPostalFiscal')?.hasError('required') && companyForm.get('codigoPostalFiscal')?.touched) {
                  <mat-error>El código postal es requerido</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Razón Social</mat-label>
                <input matInput formControlName="razonSocial" placeholder="Taller El Chapulín S.A. de C.V." />
                @if (companyForm.get('razonSocial')?.hasError('required') && companyForm.get('razonSocial')?.touched) {
                  <mat-error>La razón social es requerida</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Régimen Fiscal</mat-label>
                <input matInput formControlName="regimenFiscal" placeholder="601" />
                @if (companyForm.get('regimenFiscal')?.hasError('required') && companyForm.get('regimenFiscal')?.touched) {
                  <mat-error>El régimen fiscal es requerido</mat-error>
                }
              </mat-form-field>
            </div>

            <mat-divider class="section-divider"></mat-divider>
            <h3 class="section-title">Personalización (opcional)</h3>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>URL del Logo</mat-label>
                <input matInput formControlName="logoUrl" placeholder="https://ejemplo.com/logo.png" />
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="third-width">
                <mat-label>Color Primario</mat-label>
                <input matInput formControlName="colorPrimario" placeholder="#1976D2" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="third-width">
                <mat-label>Color Secundario</mat-label>
                <input matInput formControlName="colorSecundario" placeholder="#FF5722" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="third-width">
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
              <button mat-stroked-button type="button" routerLink="/companies">
                Cancelar
              </button>
              <button mat-flat-button color="primary" type="submit" [disabled]="companyForm.invalid || saving()">
                @if (saving()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  {{ isEditMode() ? 'Guardar cambios' : 'Crear empresa' }}
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
      max-width: 800px;
      margin: 24px auto;
      padding: 0 16px;
    }

    mat-card-header {
      margin-bottom: 16px;
    }

    .company-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      flex: 1;
      min-width: 200px;
    }

    .third-width {
      flex: 1;
      min-width: 150px;
    }

    .section-divider {
      margin: 16px 0;
    }

    .section-title {
      font-size: 16px;
      font-weight: 500;
      color: #666;
      margin: 0 0 8px;
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

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;
    }

    .form-actions button mat-spinner {
      display: inline-block;
    }
  `,
})
export class CompanyFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly companiesService = inject(CompaniesService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  readonly isEditMode = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  private companyId: string | null = null;

  readonly companyForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    rfc: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(13)]],
    razonSocial: ['', [Validators.required]],
    codigoPostalFiscal: ['', [Validators.required]],
    regimenFiscal: ['', [Validators.required]],
    logoUrl: [''],
    colorPrimario: [''],
    colorSecundario: [''],
    tema: [''],
  });

  ngOnInit(): void {
    this.companyId = this.route.snapshot.paramMap.get('id');
    if (this.companyId) {
      this.isEditMode.set(true);
      this.loadCompany(this.companyId);
    }
  }

  private loadCompany(id: string): void {
    this.companiesService.findById(id).subscribe({
      next: (res) => {
        const c = res.data;
        this.companyForm.patchValue({
          nombre: c.nombre,
          rfc: c.rfc,
          razonSocial: c.razonSocial,
          codigoPostalFiscal: c.codigoPostalFiscal,
          regimenFiscal: c.regimenFiscal,
          logoUrl: c.logoUrl || '',
          colorPrimario: c.colorPrimario || '',
          colorSecundario: c.colorSecundario || '',
          tema: c.tema || '',
        });
      },
      error: () => {
        this.snackBar.open('Error al cargar la empresa', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/companies']);
      },
    });
  }

  onSubmit(): void {
    if (this.companyForm.invalid) return;

    this.saving.set(true);
    this.error.set(null);

    const dto = this.companyForm.value;

    const request = this.isEditMode()
      ? this.companiesService.update(this.companyId!, dto)
      : this.companiesService.create(dto);

    request.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEditMode() ? 'Empresa actualizada exitosamente' : 'Empresa creada exitosamente',
          'Cerrar',
          { duration: 3000 },
        );
        this.router.navigate(['/companies']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al guardar la empresa');
        this.saving.set(false);
      },
    });
  }
}
