import { Injectable, signal, computed } from '@angular/core';
import { TokenPayload, User, CompanyItem, BranchItem } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly userSignal = signal<User | null>(null);
  private readonly rolesSignal = signal<string[]>([]);
  private readonly permisosSignal = signal<string[]>([]);
  private readonly availableCompaniesSignal = signal<CompanyItem[]>([]);
  private readonly availableBranchesSignal = signal<BranchItem[]>([]);
  private readonly currentCompanyIdSignal = signal<string | null>(null);
  private readonly currentBranchIdSignal = signal<string | null>(null);
  private readonly requiresCompanySignal = signal<boolean>(false);

  readonly user = this.userSignal.asReadonly();
  readonly roles = this.rolesSignal.asReadonly();
  readonly permisos = this.permisosSignal.asReadonly();
  readonly availableCompanies = this.availableCompaniesSignal.asReadonly();
  readonly availableBranches = this.availableBranchesSignal.asReadonly();
  readonly currentCompanyId = this.currentCompanyIdSignal.asReadonly();
  readonly currentBranchId = this.currentBranchIdSignal.asReadonly();
  readonly requiresCompany = this.requiresCompanySignal.asReadonly();

  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  readonly currentCompanyName = computed(() => {
    const companies = this.availableCompaniesSignal();
    const currentId = this.currentCompanyIdSignal();
    if (!currentId) return null;
    const found = companies.find((c) => c.id === currentId);
    return found?.nombre || null;
  });

  readonly currentBranchName = computed(() => {
    const branches = this.availableBranchesSignal();
    const currentId = this.currentBranchIdSignal();
    if (!currentId) return null;
    const found = branches.find((b) => b.id === currentId);
    return found?.nombre || null;
  });

  constructor() {
    this.loadFromToken();
  }

  private loadFromToken(): void {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as TokenPayload;

      if (payload.exp && payload.exp * 1000 < Date.now()) {
        this.clear();
        return;
      }

      const storedCompanyId = localStorage.getItem('currentCompanyId') || payload.companyId || null;
      const storedBranchId = localStorage.getItem('currentBranchId') || payload.branchId || null;
      const roles = payload.roles || [];
      const isAdmin = roles.includes('AdministradorEmpresa');
      const needsCompany = isAdmin && !storedCompanyId;

      this.userSignal.set({
        id: payload.sub,
        email: payload.email,
        nombre: null,
        companyId: storedCompanyId,
        branchId: storedBranchId,
        roles,
        permisos: payload.permisos || [],
      });
      this.rolesSignal.set(roles);
      this.permisosSignal.set(payload.permisos || []);
      this.currentCompanyIdSignal.set(storedCompanyId);
      this.currentBranchIdSignal.set(storedBranchId);
      this.requiresCompanySignal.set(needsCompany);
    } catch {
      this.clear();
    }
  }

  setFromLogin(user: User, requiresCompany?: boolean): void {
    this.userSignal.set(user);
    this.rolesSignal.set(user.roles);
    this.permisosSignal.set(user.permisos);
    this.currentCompanyIdSignal.set(user.companyId);
    this.currentBranchIdSignal.set(user.branchId);
    this.requiresCompanySignal.set(requiresCompany ?? false);
    if (user.companyId) localStorage.setItem('currentCompanyId', user.companyId);
    if (user.branchId) localStorage.setItem('currentBranchId', user.branchId);
  }

  setAvailableCompanies(companies: CompanyItem[]): void {
    this.availableCompaniesSignal.set(companies);
  }

  setAvailableBranches(branches: BranchItem[]): void {
    this.availableBranchesSignal.set(branches);
  }

  setCurrentCompany(companyId: string, companyName?: string): void {
    this.currentCompanyIdSignal.set(companyId);
    this.requiresCompanySignal.set(false);
    localStorage.setItem('currentCompanyId', companyId);
    const current = this.userSignal();
    if (current) {
      this.userSignal.set({ ...current, companyId, branchId: null });
    }
    this.currentBranchIdSignal.set(null);
    localStorage.removeItem('currentBranchId');
    this.availableBranchesSignal.set([]);
  }

  setCurrentBranch(branchId: string): void {
    this.currentBranchIdSignal.set(branchId);
    localStorage.setItem('currentBranchId', branchId);
    const current = this.userSignal();
    if (current) {
      this.userSignal.set({ ...current, branchId });
    }
  }

  refresh(): void {
    this.loadFromToken();
  }

  clear(): void {
    this.userSignal.set(null);
    this.rolesSignal.set([]);
    this.permisosSignal.set([]);
    this.availableCompaniesSignal.set([]);
    this.availableBranchesSignal.set([]);
    this.currentCompanyIdSignal.set(null);
    this.currentBranchIdSignal.set(null);
    this.requiresCompanySignal.set(false);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentCompanyId');
    localStorage.removeItem('currentBranchId');
  }

  hasPermission(permiso: string): boolean {
    return this.permisosSignal().includes(permiso);
  }

  hasRole(role: string): boolean {
    return this.rolesSignal().includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.rolesSignal().includes(role));
  }
}
