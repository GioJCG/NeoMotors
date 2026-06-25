import { Component, input, output, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-color-picker-field',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="color-picker-row">
      <label class="color-label">{{ label() }}</label>
      <div class="color-input-wrapper">
        <div class="color-swatch" [style.background]="value() || '#000000'" (click)="nativeInput.click()">
          <input #nativeInput type="color" [value]="value() || '#000000'" (input)="onColorChange($event)" class="color-native-input" />
        </div>
        <mat-form-field appearance="outline" class="hex-field">
          <input matInput [ngModel]="value()" (ngModelChange)="onHexChange($event)" placeholder="#HEX" maxlength="7" />
        </mat-form-field>
      </div>
    </div>
  `,
  styles: `
    .color-picker-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .color-label {
      font-size: 13px;
      color: #666;
      margin-bottom: 4px;
      display: block;
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
  `,
})
export class ColorPickerFieldComponent {
  readonly label = input<string>('Color');
  readonly value = model<string>('#000000');

  onColorChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value.set(input.value);
  }

  onHexChange(value: string): void {
    if (!value.startsWith('#')) {
      value = '#' + value;
    }
    if (/^#[0-9a-fA-F]{0,6}$/.test(value)) {
      this.value.set(value.toUpperCase());
    }
  }
}
