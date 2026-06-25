import { Injectable, inject } from '@angular/core';
import { UserService } from './user.service';
import { CompaniesService } from '../../features/companies/services/companies.service';

const DEFAULT_PRIMARY = '#1976d2';
const DEFAULT_SECONDARY = '#ff5722';
const FALLBACK_BG = '#f5f5f5';

@Injectable({ providedIn: 'root' })
export class BrandingService {
  private readonly userService = inject(UserService);
  private readonly companiesService = inject(CompaniesService);

  init(): void {
    this.applyFromCurrentCompany();
  }

  refresh(): void {
    this.applyFromCurrentCompany();
  }

  private applyFromCurrentCompany(): void {
    const companyId = this.userService.currentCompanyId();
    if (!companyId) {
      this.applyDefaults();
      return;
    }

    this.companiesService.findById(companyId).subscribe({
      next: (res) => {
        const company = res;
        this.applyBranding(
          company.colorPrimario || undefined,
          company.colorSecundario || undefined,
          company.logoUrl || undefined,
          company.tema || undefined,
        );
      },
      error: () => this.applyDefaults(),
    });
  }

  private applyBranding(
    primary?: string,
    secondary?: string,
    logoUrl?: string,
    theme?: string,
  ): void {
    const root = document.documentElement;

    const p = primary || DEFAULT_PRIMARY;
    const s = secondary || DEFAULT_SECONDARY;

    root.style.setProperty('--brand-primary', p);
    root.style.setProperty('--brand-secondary', s);
    root.style.setProperty('--brand-primary-rgb', this.hexToRgb(p));
    root.style.setProperty('--brand-secondary-rgb', this.hexToRgb(s));

    if (logoUrl) {
      root.style.setProperty('--brand-logo-url', `url(${logoUrl})`);
    } else {
      root.style.removeProperty('--brand-logo-url');
    }

    root.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');

    const bgColor = theme === 'dark' ? '#121212' : FALLBACK_BG;
    root.style.setProperty('--app-bg', bgColor);
  }

  private applyDefaults(): void {
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', DEFAULT_PRIMARY);
    root.style.setProperty('--brand-secondary', DEFAULT_SECONDARY);
    root.style.setProperty('--brand-primary-rgb', this.hexToRgb(DEFAULT_PRIMARY));
    root.style.setProperty('--brand-secondary-rgb', this.hexToRgb(DEFAULT_SECONDARY));
    root.style.removeProperty('--brand-logo-url');
    root.setAttribute('data-theme', 'light');
    root.style.setProperty('--app-bg', FALLBACK_BG);
  }

  private hexToRgb(hex: string): string {
    const cleaned = hex.replace('#', '');
    if (cleaned.length === 3) {
      const r = parseInt(cleaned[0] + cleaned[0], 16);
      const g = parseInt(cleaned[1] + cleaned[1], 16);
      const b = parseInt(cleaned[2] + cleaned[2], 16);
      return `${r}, ${g}, ${b}`;
    }
    const r = parseInt(cleaned.substring(0, 2), 16);
    const g = parseInt(cleaned.substring(2, 4), 16);
    const b = parseInt(cleaned.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }
}
