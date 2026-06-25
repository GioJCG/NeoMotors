import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../core/services/user.service';
import { ContextService } from '../../core/services/context.service';

@Component({
  selector: 'app-context-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="context-selector">
      @if (loadingCompanies()) {
        <mat-spinner diameter="20"></mat-spinner>
      } @else {
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="context-field">
          <mat-label>Empresa</mat-label>
          <mat-select
            [value]="userService.currentCompanyId()"
            (selectionChange)="onCompanyChange($event.value)"
          >
            @for (c of userService.availableCompanies(); track c.id) {
              <mat-option [value]="c.id">
                <div class="option-item">
                  <mat-icon>business</mat-icon>
                  <span>{{ c.nombre }}</span>
                  @if (c.activa) {
                    <mat-icon class="active-icon" [inline]="true">check_circle</mat-icon>
                  }
                </div>
              </mat-option>
            }
          </mat-select>
        </mat-form-field>
      }

      @if (userService.currentCompanyId()) {
        @if (loadingBranches()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="context-field">
            <mat-label>Sucursal</mat-label>
            <mat-select
              [value]="userService.currentBranchId()"
              (selectionChange)="onBranchChange($event.value)"
            >
              @for (b of userService.availableBranches(); track b.id) {
                <mat-option [value]="b.id">
                  <div class="option-item">
                    <mat-icon>store</mat-icon>
                    <span>{{ b.nombre }}</span>
                    @if (b.estado === 'ACTIVA') {
                      <mat-icon class="active-icon" [inline]="true">check_circle</mat-icon>
                    }
                  </div>
                </mat-option>
              }
            </mat-select>
          </mat-form-field>
        }
      }
    </div>
  `,
  styles: `
    .context-selector {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .context-field {
      min-width: 180px;
      max-width: 250px;
    }

    .option-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .option-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .active-icon {
      color: #4caf50;
      margin-left: auto;
    }
  `,
})
export class ContextSelectorComponent implements OnInit {
  readonly userService = inject(UserService);
  private readonly contextService = inject(ContextService);

  readonly loadingCompanies = signal(false);
  readonly loadingBranches = signal(false);

  ngOnInit(): void {
    this.loadCompanies();
  }

  private loadCompanies(): void {
    this.loadingCompanies.set(true);
    this.contextService.getCompanies().subscribe({
      next: (companies) => {
        this.userService.setAvailableCompanies(companies);
        this.loadingCompanies.set(false);
        const currentId = this.userService.currentCompanyId();
        if (currentId) {
          this.loadBranches(currentId);
        }
      },
      error: () => this.loadingCompanies.set(false),
    });
  }

  loadBranches(empresaId: string): void {
    this.loadingBranches.set(true);
    this.contextService.getBranches(empresaId).subscribe({
      next: (branches) => {
        this.userService.setAvailableBranches(branches);
        this.loadingBranches.set(false);
      },
      error: () => this.loadingBranches.set(false),
    });
  }

  onCompanyChange(empresaId: string): void {
    if (!empresaId) return;
    this.contextService.setActiveCompany(empresaId).subscribe({
      next: () => {
        this.userService.setCurrentCompany(empresaId);
        this.loadBranches(empresaId);
      },
    });
  }

  onBranchChange(sucursalId: string): void {
    if (!sucursalId) return;
    this.contextService.setActiveBranch(sucursalId).subscribe({
      next: () => {
        this.userService.setCurrentBranch(sucursalId);
      },
    });
  }
}
