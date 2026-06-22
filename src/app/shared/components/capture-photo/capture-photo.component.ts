import { Component, output, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface PhotoResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
}

const MAX_WIDTH = 1280;
const JPEG_QUALITY = 0.7;

@Component({
  selector: 'app-capture-photo',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="capture-photo">
      @if (error()) {
        <div class="error">
          <mat-icon color="warn">error</mat-icon>
          <span>{{ error() }}</span>
        </div>
      }

      @if (preview(); as img) {
        <div class="preview-container">
          <img [src]="img" class="preview" alt="Foto capturada" />
          <button mat-icon-button color="warn" class="remove-btn" (click)="clear()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        <div class="info">
          {{ lastResult()?.width }}x{{ lastResult()?.height }},
          {{ (lastResult()?.sizeBytes ?? 0) / 1024 | number:'1.0-0' }} KB
        </div>
      }

      <div class="actions">
        @if (!streamActive()) {
          <button mat-stroked-button (click)="startCamera()">
            <mat-icon>camera_alt</mat-icon>
            Tomar foto
          </button>
          <button mat-stroked-button (click)="fileInput.click()">
            <mat-icon>drive_folder_upload</mat-icon>
            Subir archivo
          </button>
        }

        <input #fileInput type="file" accept="image/*" (change)="onFileSelected($event)" hidden />

        @if (streamActive()) {
          <video #video autoplay playsinline class="viewfinder"></video>
          <div class="stream-actions">
            <button mat-flat-button color="primary" (click)="capture()">
              <mat-icon>camera</mat-icon>
              Capturar
            </button>
            <button mat-stroked-button (click)="stopCamera()">
              Cancelar
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .capture-photo {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .error {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #c62828;
    }

    .preview-container {
      position: relative;
      display: inline-block;
    }

    .preview {
      max-width: 320px;
      max-height: 240px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }

    .remove-btn {
      position: absolute;
      top: 4px;
      right: 4px;
    }

    .info {
      font-size: 12px;
      color: #666;
    }

    .actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
    }

    .viewfinder {
      width: 320px;
      max-height: 240px;
      border-radius: 8px;
      background: #000;
    }

    .stream-actions {
      display: flex;
      gap: 8px;
      width: 100%;
    }
  `,
})
export class CapturePhotoComponent {
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;

  readonly preview = signal<string | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly streamActive = signal(false);
  readonly lastResult = signal<PhotoResult | null>(null);

  readonly photoChange = output<PhotoResult>();

  private mediaStream: MediaStream | null = null;

  startCamera(): void {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.error.set('Cámara no disponible en este navegador');
      return;
    }

    this.error.set(null);
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment', width: { ideal: MAX_WIDTH } } })
      .then((stream) => {
        this.mediaStream = stream;
        this.streamActive.set(true);
        setTimeout(() => {
          if (this.video?.nativeElement) {
            this.video.nativeElement.srcObject = stream;
          }
        });
      })
      .catch(() => {
        this.error.set('No se pudo acceder a la cámara');
      });
  }

  stopCamera(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    this.streamActive.set(false);
  }

  capture(): void {
    const videoEl = this.video?.nativeElement;
    if (!videoEl) return;

    const canvas = document.createElement('canvas');
    let w = videoEl.videoWidth;
    let h = videoEl.videoHeight;

    if (w > MAX_WIDTH) {
      h = Math.round((h * MAX_WIDTH) / w);
      w = MAX_WIDTH;
    }

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoEl, 0, 0, w, h);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const result: PhotoResult = {
          blob,
          dataUrl: canvas.toDataURL('image/jpeg'),
          width: w,
          height: h,
          sizeBytes: blob.size,
        };
        this.preview.set(result.dataUrl);
        this.lastResult.set(result);
        this.photoChange.emit(result);
        this.stopCamera();
      },
      'image/jpeg',
      JPEG_QUALITY,
    );
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.error.set(null);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width;
      let h = img.height;

      if (w > MAX_WIDTH) {
        h = Math.round((h * MAX_WIDTH) / w);
        w = MAX_WIDTH;
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const result: PhotoResult = {
            blob,
            dataUrl: canvas.toDataURL('image/jpeg'),
            width: w,
            height: h,
            sizeBytes: blob.size,
          };
          this.preview.set(result.dataUrl);
          this.lastResult.set(result);
          this.photoChange.emit(result);
          this.loading.set(false);
        },
        'image/jpeg',
        JPEG_QUALITY,
      );
    };
    img.src = URL.createObjectURL(file);
    this.loading.set(true);
  }

  clear(): void {
    this.preview.set(null);
    this.lastResult.set(null);
    this.error.set(null);
    this.stopCamera();
  }
}
