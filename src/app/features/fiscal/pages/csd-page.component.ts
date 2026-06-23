import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FiscalService } from '../services/fiscal.service';

@Component({
  selector: 'app-csd-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatProgressBarModule,
  ],
  template: `
    <div class="page">
      <h1>Certificado de Sello Digital (CSD)</h1>

      <div class="grid">
        <mat-card class="card">
          <mat-card-header>
            <mat-icon mat-card-avatar>verified</mat-icon>
            <mat-card-title>Estado del Certificado</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (!statusLoaded) {
              <mat-progress-bar mode="indeterminate" />
            } @else if (status && status.cargado) {
              <div class="status-info">
                <div class="status-badge" [class.vigente]="status.vigente" [class.vencido]="!status.vigente">
                  {{ status.vigente ? 'VIGENTE' : 'VENCIDO' }}
                </div>
                <div class="info-row"><span class="label">RFC:</span> {{ status.rfc }}</div>
                <div class="info-row"><span class="label">Razón Social:</span> {{ status.emisorRazonSocial }}</div>
                <div class="info-row"><span class="label">Serie:</span> {{ status.serie }}</div>
                <div class="info-row"><span class="label">No. Certificado:</span> {{ status.numeroCertificado }}</div>
                <div class="info-row"><span class="label">Vigencia:</span> {{ status.vigenciaDesde | date:'dd/MM/yyyy' }} - {{ status.vigenciaHasta | date:'dd/MM/yyyy' }}</div>
              </div>
            } @else {
              <div class="empty-status">
                <mat-icon>cloud_off</mat-icon>
                <p>No hay certificado cargado</p>
              </div>
            }
          </mat-card-content>
        </mat-card>

        <mat-card class="card">
          <mat-card-header>
            <mat-icon mat-card-avatar>upload_file</mat-icon>
            <mat-card-title>Cargar / Actualizar CSD</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="upload-form">
              <div class="file-row">
                <span class="file-label">Archivo .cer</span>
                <input type="file" accept=".cer" (change)="onCerSelected($event)" class="file-input" />
                <span class="file-name">{{ cerFileName || 'Ninguno' }}</span>
              </div>
              <div class="file-row">
                <span class="file-label">Archivo .key</span>
                <input type="file" accept=".key" (change)="onKeySelected($event)" class="file-input" />
                <span class="file-name">{{ keyFileName || 'Ninguno' }}</span>
              </div>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Contraseña del certificado</mat-label>
                <input matInput type="password" [(ngModel)]="password" placeholder="Ingrese la contraseña" />
              </mat-form-field>
              <button mat-raised-button color="primary" [disabled]="uploading || !cerBase64 || !keyBase64 || !password" (click)="upload()">
                <mat-icon>cloud_upload</mat-icon>
                {{ uploading ? 'Cargando...' : 'Cargar Certificado' }}
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: `
    .page { padding: 24px; max-width: 900px; margin: 0 auto; }
    h1 { margin: 0 0 20px; font-size: 24px; font-weight: 500; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 600px) { .grid { grid-template-columns: 1fr; } }
    .card { border-radius: 8px; }

    .status-info { display: flex; flex-direction: column; gap: 8px; padding: 8px 0; }
    .status-badge {
      display: inline-block; padding: 4px 12px; border-radius: 4px;
      font-weight: 700; font-size: 13px; align-self: flex-start; margin-bottom: 8px;
    }
    .status-badge.vigente { background: #e8f5e9; color: #2e7d32; }
    .status-badge.vencido { background: #ffebee; color: #c62828; }
    .info-row { display: flex; gap: 8px; font-size: 13px; }
    .info-row .label { color: #666; min-width: 120px; }
    .empty-status { text-align: center; padding: 32px 0; color: #999; }
    .empty-status mat-icon { font-size: 48px; width: 48px; height: 48px; }

    .upload-form { display: flex; flex-direction: column; gap: 16px; padding: 8px 0; }
    .file-row { display: flex; align-items: center; gap: 12px; }
    .file-label { font-size: 13px; color: #555; min-width: 100px; }
    .file-input { font-size: 13px; }
    .file-name { font-size: 12px; color: #999; }
    .full-width { width: 100%; }
  `,
})
export class CsdPageComponent implements OnInit {
  private readonly service = inject(FiscalService);
  private readonly snackBar = inject(MatSnackBar);

  status: any = null;
  statusLoaded = false;

  cerBase64 = '';
  keyBase64 = '';
  password = '';
  cerFileName = '';
  keyFileName = '';
  uploading = false;

  ngOnInit(): void {
    this.loadStatus();
  }

  private loadStatus(): void {
    this.service.getCsdStatus().subscribe((s) => {
      this.status = s;
      this.statusLoaded = true;
    });
  }

  onCerSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.cerFileName = file.name;
    this.readFileAsBase64(file).then((b64) => (this.cerBase64 = b64));
  }

  onKeySelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.keyFileName = file.name;
    this.readFileAsBase64(file).then((b64) => (this.keyBase64 = b64));
  }

  private readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1] || result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  upload(): void {
    this.uploading = true;
    this.service.uploadCsd(this.cerBase64, this.keyBase64, this.password).subscribe({
      next: () => {
        this.snackBar.open('Certificado cargado exitosamente', 'Cerrar', { duration: 3000 });
        this.uploading = false;
        this.loadStatus();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al cargar certificado', 'Cerrar', { duration: 5000 });
        this.uploading = false;
      },
    });
  }
}
