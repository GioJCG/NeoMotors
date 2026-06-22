import { Injectable, signal, computed } from '@angular/core';
import { TokenPayload, User } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly userSignal = signal<User | null>(null);
  private readonly rolesSignal = signal<string[]>([]);
  private readonly permisosSignal = signal<string[]>([]);

  readonly user = this.userSignal.asReadonly();
  readonly roles = this.rolesSignal.asReadonly();
  readonly permisos = this.permisosSignal.asReadonly();

  readonly isAuthenticated = computed(() => this.userSignal() !== null);

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

      this.userSignal.set({
        id: payload.sub,
        email: payload.email,
        nombre: null,
        roles: payload.roles || [],
        permisos: payload.permisos || [],
      });
      this.rolesSignal.set(payload.roles || []);
      this.permisosSignal.set(payload.permisos || []);
    } catch {
      this.clear();
    }
  }

  setFromLogin(user: User): void {
    this.userSignal.set(user);
    this.rolesSignal.set(user.roles);
    this.permisosSignal.set(user.permisos);
  }

  refresh(): void {
    this.loadFromToken();
  }

  clear(): void {
    this.userSignal.set(null);
    this.rolesSignal.set([]);
    this.permisosSignal.set([]);
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
