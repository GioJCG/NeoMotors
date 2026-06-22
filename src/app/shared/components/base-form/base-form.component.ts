import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-base-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="base-form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ title() }}</mat-card-title>
          @if (subtitle()) {
            <mat-card-subtitle>{{ subtitle() }}</mat-card-subtitle>
          }
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="formGroup()" (ngSubmit)="onSubmit()" class="base-form-content">
            <ng-content />

            @if (error(); as err) {
              <div class="error-message">
                <mat-icon color="warn">error</mat-icon>
                <span>{{ err }}</span>
              </div>
            }

            <div class="form-actions">
              @if (cancelRoute()) {
                <button mat-stroked-button type="button" [routerLink]="cancelRoute()" [queryParams]="cancelQueryParams()">
                  Cancelar
                </button>
              }
              <button
                mat-flat-button
                color="primary"
                type="submit"
                [disabled]="formGroup().invalid || saving()"
              >
                @if (saving()) {
                  <mat-spinner diameter="20" />
                } @else {
                  {{ submitLabel() }}
                }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .base-form-container {
      max-width: 800px;
      margin: 24px auto;
      padding: 0 16px;
    }

    mat-card-header {
      margin-bottom: 16px;
    }

    .base-form-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
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

    .error-message mat-icon {
      flex-shrink: 0;
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
export class BaseFormComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly formGroup = input.required<any>();
  readonly saving = input.required<boolean>();
  readonly error = input<string | null>(null);
  readonly submitLabel = input<string>('Guardar');
  readonly cancelRoute = input<string>('');
  readonly cancelQueryParams = input<Record<string, string>>({});

  readonly submit = output<void>();

  onSubmit(): void {
    this.submit.emit();
  }
}
