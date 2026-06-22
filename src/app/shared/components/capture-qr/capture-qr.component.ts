import { Component, output, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import jsQR from 'jsqr';

@Component({
  selector: 'app-capture-qr',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="capture-qr">
      @if (error()) {
        <div class="error">
          <mat-icon color="warn">error</mat-icon>
          <span>{{ error() }}</span>
        </div>
      }

      @if (!scanning()) {
        <button mat-stroked-button (click)="startScanning()">
          <mat-icon>qr_code_scanner</mat-icon>
          Escanear código QR
        </button>
      }

      @if (scanning()) {
        <div class="scanner">
          <video #video autoplay playsinline class="viewfinder"></video>
          <div class="overlay">
            @if (detected()) {
              <div class="result">
                <mat-icon>check_circle</mat-icon>
                <code>{{ detected() }}</code>
              </div>
            } @else {
              <span class="hint">Enfoca un código QR</span>
            }
          </div>
          <button mat-stroked-button (click)="stopScanning()" class="cancel-btn">
            Cancelar
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .capture-qr {
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

    .scanner {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: center;
    }

    .viewfinder {
      width: 280px;
      height: 280px;
      border-radius: 8px;
      background: #000;
      object-fit: cover;
    }

    .overlay {
      text-align: center;
    }

    .result {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #2e7d32;
      font-size: 14px;
    }

    .result code {
      background: #e8f5e9;
      padding: 2px 8px;
      border-radius: 4px;
      word-break: break-all;
      max-width: 260px;
    }

    .hint {
      color: #999;
      font-size: 13px;
    }

    .cancel-btn {
      align-self: center;
    }
  `,
})
export class CaptureQrComponent {
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;

  readonly scanning = signal(false);
  readonly detected = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly qrResult = output<string>();

  private mediaStream: MediaStream | null = null;
  private animationId: number | null = null;

  startScanning(): void {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.error.set('Cámara no disponible en este navegador');
      return;
    }

    this.error.set(null);
    this.detected.set(null);

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 640 } } })
      .then((stream) => {
        this.mediaStream = stream;
        this.scanning.set(true);
        setTimeout(() => {
          const videoEl = this.video?.nativeElement;
          if (videoEl) {
            videoEl.srcObject = stream;
            videoEl.play();
            this.scanFrame();
          }
        });
      })
      .catch(() => {
        this.error.set('No se pudo acceder a la cámara');
      });
  }

  private scanFrame(): void {
    const videoEl = this.video?.nativeElement;
    if (!videoEl || videoEl.readyState < 2) {
      this.animationId = requestAnimationFrame(() => this.scanFrame());
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoEl, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      this.detected.set(code.data);
      this.qrResult.emit(code.data);
      this.stopScanning();
      return;
    }

    this.animationId = requestAnimationFrame(() => this.scanFrame());
  }

  stopScanning(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    this.scanning.set(false);
  }
}
