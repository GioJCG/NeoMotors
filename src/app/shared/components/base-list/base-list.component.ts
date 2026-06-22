import { Component, input, output, contentChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface BaseColumnDef {
  key: string;
  label: string;
  type?: 'text' | 'chip' | 'checkbox';
  chipColor?: (value: string, row: any) => { bg: string; color: string };
  width?: string;
}

@Component({
  selector: 'app-base-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>{{ title() }}</mat-card-title>
        @if (subtitle()) {
          <mat-card-subtitle>{{ subtitle() }}</mat-card-subtitle>
        }
      </mat-card-header>

      <mat-card-content>
        <div class="toolbar">
          @if (showSearch()) {
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>{{ searchPlaceholder() }}</mat-label>
              <input
                matInput
                [ngModel]="searchTerm()"
                (ngModelChange)="onSearch($event)"
                [placeholder]="searchPlaceholder()"
              />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          }

          <ng-content select="[toolbar-actions]" />
        </div>

        @if (loading()) {
          <div class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else {
          <div class="table-container">
            <table mat-table [dataSource]="data()" class="base-table">
              @for (col of columns(); track col.key) {
                <ng-container [matColumnDef]="col.key">
                  <th mat-header-cell *matHeaderCellDef [style.width]="col.width || 'auto'">
                    {{ col.label }}
                  </th>
                  <td mat-cell *matCellDef="let row" [style.width]="col.width || 'auto'">
                    @if (col.type === 'chip') {
                      <mat-chip
                        [style.background]="getChipBg(col, row) || undefined"
                        [style.color]="getChipColor(col, row) || undefined"
                      >
                        {{ row[col.key] }}
                      </mat-chip>
                    } @else if (col.type === 'checkbox') {
                      <mat-checkbox [checked]="row[col.key]" disabled></mat-checkbox>
                    } @else {
                      {{ row[col.key] }}
                    }
                  </td>
                </ng-container>
              }

              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let row">
                  <ng-container *ngTemplateOutlet="actionsTemplate() ?? null; context: { $implicit: row }" />
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>

              @if (data().length === 0) {
                <tr class="mat-row">
                  <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
                    {{ emptyMessage() }}
                  </td>
                </tr>
              }
            </table>
          </div>

          <mat-paginator
            [length]="totalItems()"
            [pageSize]="pageSize()"
            [pageSizeOptions]="[5, 10, 25, 50]"
            [pageIndex]="pageIndex()"
            (page)="pageChange.emit($event)"
            showFirstLastButtons
          />
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    mat-card-header { margin-bottom: 16px; }

    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 280px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .table-container {
      overflow-x: auto;
    }

    .base-table {
      width: 100%;
    }

    .no-data {
      text-align: center;
      padding: 24px;
      color: #999;
      font-style: italic;
    }
  `,
  encapsulation: ViewEncapsulation.None,
})
export class BaseListComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly columns = input.required<BaseColumnDef[]>();
  readonly data = input.required<any[]>();
  readonly totalItems = input.required<number>();
  readonly loading = input.required<boolean>();
  readonly searchTerm = input<string>('');
  readonly searchPlaceholder = input<string>('Buscar...');
  readonly emptyMessage = input<string>('No se encontraron registros');
  readonly showSearch = input<boolean>(true);
  readonly pageSize = input<number>(10);
  readonly pageIndex = input<number>(0);
  readonly showActions = input<boolean>(true);

  readonly pageChange = output<PageEvent>();
  readonly searchTermChange = output<string>();

  readonly actionsTemplate = contentChild<TemplateRef<any>>('actions');

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  get displayedColumns(): string[] {
    const cols = this.columns().map((c) => c.key);
    if (this.showActions() && this.actionsTemplate()) {
      cols.push('acciones');
    }
    return cols;
  }

  getChipBg(col: BaseColumnDef, row: any): string | null {
    return col.chipColor?.(row[col.key], row)?.bg ?? null;
  }

  getChipColor(col: BaseColumnDef, row: any): string | null {
    return col.chipColor?.(row[col.key], row)?.color ?? null;
  }

  onSearch(value: string): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.searchTermChange.emit(value);
    }, 300);
  }
}
