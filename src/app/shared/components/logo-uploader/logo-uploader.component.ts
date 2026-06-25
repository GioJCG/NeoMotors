import { Component, input, output, signal, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-logo-uploader',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="logo-section">
      <label class="logo-label">{{ label() }}</label>

      @if (previewUrl(); as preview) {
        <div class="logo-preview-container">
          <img [src]="preview" class="logo-preview-img" alt="Logo preview" />
          <div class="logo-info">
            @if (selectedFile(); as file) {
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ file.size / 1024 | number:'1.0-0' }} KB</span>
            } @else {
              <span class="file-name">Logo actual</span>
            }
          </div>
          <div class="logo-actions">
            <button mat-stroked-button type="button" (click)="fileInput.click()">
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
        <div class="logo-upload-zone" (click)="fileInput.click()">
          <mat-icon class="upload-icon">cloud_upload</mat-icon>
          <span class="upload-text">Subir Logotipo</span>
          <span class="upload-hint">PNG, JPG, SVG o WEBP — Máx. 5 MB</span>
        </div>
      }

      <input #fileInput type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" (change)="onFileSelected($event)" hidden />

      @if (error(); as err) {
        <div class="logo-error">
          <mat-icon color="warn">error</mat-icon>
          <span>{{ err }}</span>
        </div>
      }
    </div>
  `,
  styles: `
    .logo-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .logo-label {
      font-size: 13px;
      color: #666;
      display: block;
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
  `,
})
export class LogoUploaderComponent {
  readonly label = input<string>('Logotipo');
  readonly currentLogoUrl = input<string | null>(null);

  readonly logoFile = output<File | null>();
  readonly logoRemoved = output<boolean>();

  readonly error = signal<string | null>(null);
  readonly selectedFile = signal<File | null>(null);
  readonly previewUrl = signal<string | null>(null);

  private readonly MAX_SIZE = 5 * 1024 * 1024;
  private readonly ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];

  constructor() {
    this.previewUrl.set(this.currentLogoUrl());
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.error.set(null);

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      this.error.set('Formato no permitido. Use PNG, JPG, SVG o WEBP.');
      return;
    }

    if (file.size > this.MAX_SIZE) {
      this.error.set('El archivo excede el tamaño máximo de 5 MB.');
      return;
    }

    this.selectedFile.set(file);
    this.logoFile.emit(file);

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  removeLogo(): void {
    this.selectedFile.set(null);
    this.logoFile.emit(null);
    this.previewUrl.set(null);
    this.error.set(null);
    this.logoRemoved.emit(true);
  }
}
