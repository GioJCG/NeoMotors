import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-tts-reader',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    @if (supported()) {
      <button
        mat-icon-button
        [color]="speaking() ? 'warn' : 'primary'"
        (click)="toggle()"
        [matTooltip]="speaking() ? 'Detener' : 'Leer en voz alta'"
      >
        <mat-icon>{{ speaking() ? 'volume_up' : 'volume_up' }}</mat-icon>
      </button>
    }
  `,
  styles: `
    :host { display: inline-flex; }
  `,
})
export class TtsReaderComponent {
  readonly text = input.required<string>();
  readonly lang = input<string>('es-MX');

  readonly speaking = signal(false);
  readonly supported = signal(typeof window !== 'undefined' && 'speechSynthesis' in window);

  private utterance: SpeechSynthesisUtterance | null = null;

  toggle(): void {
    if (this.speaking()) {
      this.stop();
    } else {
      this.speak();
    }
  }

  speak(): void {
    if (!this.supported()) return;

    window.speechSynthesis.cancel();

    this.utterance = new SpeechSynthesisUtterance(this.text());
    this.utterance.lang = this.lang();
    this.utterance.rate = 0.9;

    this.utterance.onstart = () => this.speaking.set(true);
    this.utterance.onend = () => this.speaking.set(false);
    this.utterance.onerror = () => this.speaking.set(false);

    window.speechSynthesis.speak(this.utterance);
  }

  stop(): void {
    window.speechSynthesis.cancel();
    this.speaking.set(false);
  }
}
