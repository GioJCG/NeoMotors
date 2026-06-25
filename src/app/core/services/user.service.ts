import { Injectable, signal, computed } from '@angular/core';
import { TokenPayload, User, CompanyItem, BranchItem } from '../../shared/models/user.model';

export interface MenuItem {
  label: string;
  icon: string;
  route: string;
  requiredRoles?: string[];
  requiresCompany?: boolean;
}

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

  readonly menuItems = computed<MenuItem[]>(() => {
    const roles = this.rolesSignal();
    const hasCompany = !!this.currentCompanyIdSignal();
    const canAccess = (allowedRoles?: string[]) =>
      !allowedRoles || allowedRoles.length === 0 || allowedRoles.some((r) => roles.includes(r));

    const allItems: MenuItem[] = [
      { label: 'Empresas', icon: 'business', route: '/companies', requiredRoles: ['SuperUsuario'] },
      { label: 'Usuarios', icon: 'group', route: '/users', requiredRoles: ['SuperUsuario', 'AdministradorEmpresa'], requiresCompany: true },
      { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', requiresCompany: true },
      { label: 'Sucursales', icon: 'store', route: '/branches', requiredRoles: ['SuperUsuario', 'AdministradorEmpresa', 'SupervisorSucursal'], requiresCompany: true },
      { label: 'Clientes', icon: 'people', route: '/customers', requiresCompany: true },
      { label: 'Vehículos', icon: 'directions_car', route: '/vehicles', requiresCompany: true },
      { label: 'Citas', icon: 'calendar_today', route: '/appointments', requiresCompany: true },
      { label: 'Recepción', icon: 'assignment_returned', route: '/work-orders/reception', requiresCompany: true },
      { label: 'Órdenes', icon: 'build', route: '/work-orders', requiresCompany: true },
      { label: 'Cotizaciones', icon: 'request_quote', route: '/quotes', requiresCompany: true },
      { label: 'Proveedores', icon: 'local_shipping', route: '/suppliers', requiredRoles: ['SuperUsuario', 'AdministradorEmpresa', 'SupervisorSucursal', 'Consulta'], requiresCompany: true },
      { label: 'Compras', icon: 'shopping_cart', route: '/purchase-orders', requiredRoles: ['SuperUsuario', 'AdministradorEmpresa', 'SupervisorSucursal', 'Consulta'], requiresCompany: true },
      { label: 'Refacciones', icon: 'handyman', route: '/parts', requiredRoles: ['SuperUsuario', 'AdministradorEmpresa', 'SupervisorSucursal', 'Consulta'], requiresCompany: true },
      { label: 'Inventario', icon: 'inventory_2', route: '/inventory', requiredRoles: ['SuperUsuario', 'AdministradorEmpresa', 'SupervisorSucursal', 'Consulta'], requiresCompany: true },
      { label: 'Caja', icon: 'point_of_sale', route: '/cash-desk', requiresCompany: true },
      { label: 'Notificaciones', icon: 'notifications', route: '/notifications', requiresCompany: true },
      { label: 'Auditoría', icon: 'receipt_long', route: '/audit-logs', requiredRoles: ['SuperUsuario', 'AdministradorEmpresa'], requiresCompany: true },
      { label: 'CSD', icon: 'verified', route: '/fiscal/csd', requiredRoles: ['SuperUsuario', 'AdministradorEmpresa'], requiresCompany: true },
    ];

    return allItems.filter((item) => {
      if (item.requiresCompany && !hasCompany) return false;
      return canAccess(item.requiredRoles);
    });
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
