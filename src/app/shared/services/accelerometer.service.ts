import { Injectable, signal } from '@angular/core';

export interface ShakeEvent {
  timestamp: number;
  acceleration: number;
  page: string;
}

@Injectable({ providedIn: 'root' })
export class AccelerometerService {
  private readonly shakeThreshold = 15;
  private lastX = 0;
  private lastY = 0;
  private lastZ = 0;
  private lastShake = 0;
  private readonly minInterval = 2000;

  readonly lastShakeEvent = signal<ShakeEvent | null>(null);

  private getLog(): ShakeEvent[] {
    try {
      return JSON.parse(localStorage.getItem('shakeLog') || '[]');
    } catch {
      return [];
    }
  }

  private saveLog(events: ShakeEvent[]): void {
    const recent = events.slice(-100);
    localStorage.setItem('shakeLog', JSON.stringify(recent));
  }

  start(currentPage: () => string): void {
    if (!('DeviceMotionEvent' in window)) return;

    window.addEventListener('devicemotion', (event) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      const x = acc.x;
      const y = acc.y;
      const z = acc.z;

      if (this.lastX === 0 && this.lastY === 0 && this.lastZ === 0) {
        this.lastX = x;
        this.lastY = y;
        this.lastZ = z;
        return;
      }

      const delta = Math.abs(x - this.lastX) + Math.abs(y - this.lastY) + Math.abs(z - this.lastZ);
      this.lastX = x;
      this.lastY = y;
      this.lastZ = z;

      const now = Date.now();
      if (delta > this.shakeThreshold && now - this.lastShake > this.minInterval) {
        this.lastShake = now;
        const evt: ShakeEvent = {
          timestamp: now,
          acceleration: delta,
          page: currentPage(),
        };
        this.lastShakeEvent.set(evt);
        const log = this.getLog();
        log.push(evt);
        this.saveLog(log);
      }
    });
  }

  stop(): void {
  }

  getHistory(): ShakeEvent[] {
    return this.getLog();
  }

  clearHistory(): void {
    localStorage.removeItem('shakeLog');
  }
}
