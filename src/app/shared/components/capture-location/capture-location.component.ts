import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface LocationResult {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

@Component({
  selector: 'app-capture-location',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="capture-location">
      @if (error()) {
        <div class="error">
          <mat-icon color="warn">location_off</mat-icon>
          <span>{{ error() }}</span>
        </div>
      }

      @if (location(); as loc) {
        <div class="coords">
          <mat-icon>location_on</mat-icon>
          <code>{{ loc.lat.toFixed(6) }}, {{ loc.lng.toFixed(6) }}</code>
          @if (loc.accuracy) {
            <span class="accuracy">±{{ loc.accuracy.toFixed(0) }}m</span>
          }
        </div>
      }

      <button mat-stroked-button (click)="capture()" [disabled]="loading()">
        @if (loading()) {
          <mat-spinner diameter="18"></mat-spinner>
        } @else {
          <mat-icon>my_location</mat-icon>
        }
        {{ location() ? 'Actualizar ubicación' : 'Capturar ubicación' }}
      </button>
    </div>
  `,
  styles: `
    .capture-location {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: flex-start;
    }

    .error {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #c62828;
    }

    .coords {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
    }

    .coords code {
      background: #f5f5f5;
      padding: 2px 8px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
    }

    .accuracy {
      font-size: 12px;
      color: #666;
    }

    button mat-spinner {
      display: inline-block;
    }
  `,
})
export class CaptureLocationComponent {
  readonly location = signal<LocationResult | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly locationChange = output<LocationResult>();

  capture(): void {
    if (!navigator.geolocation) {
      this.error.set('Geolocalización no soportada por el navegador');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const result: LocationResult = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        };
        this.location.set(result);
        this.locationChange.emit(result);
        this.loading.set(false);
      },
      (err) => {
        const messages: Record<number, string> = {
          [err.PERMISSION_DENIED]: 'Permiso de ubicación denegado',
          [err.POSITION_UNAVAILABLE]: 'Ubicación no disponible',
          [err.TIMEOUT]: 'Tiempo de espera agotado',
        };
        this.error.set(messages[err.code] || 'Error al obtener ubicación');
        this.loading.set(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  clear(): void {
    this.location.set(null);
    this.error.set(null);
  }
}
