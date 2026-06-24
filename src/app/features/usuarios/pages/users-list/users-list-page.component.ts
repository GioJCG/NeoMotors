import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { UsuariosService } from '../../services/usuarios.service';
import { Usuario } from '../../models/usuario.model';
import { CreateUserDialogComponent } from '../../components/create-user-dialog/create-user-dialog.component';

@Component({
  selector: 'app-users-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="page-header">
      <h1>Usuarios</h1>
      <button mat-flat-button color="primary" (click)="openCreateDialog()">
        <mat-icon>add</mat-icon>
        Nuevo usuario
      </button>
    </div>

    <div class="table-container">
      <table mat-table [dataSource]="usuarios()" class="full-width">
        <ng-container matColumnDef="nombre">
          <th mat-header-cell *matHeaderCellDef>Nombre</th>
          <td mat-cell *matCellDef="let u">{{ u.nombre }}</td>
        </ng-container>

        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef>Email</th>
          <td mat-cell *matCellDef="let u">{{ u.email }}</td>
        </ng-container>

        <ng-container matColumnDef="roles">
          <th mat-header-cell *matHeaderCellDef>Roles</th>
          <td mat-cell *matCellDef="let u">
            <mat-chip-set>
              @for (rol of u.roles; track rol) {
                <mat-chip [class]="'rol-' + rol">
                  {{ rol }}
                </mat-chip>
              }
            </mat-chip-set>
          </td>
        </ng-container>

        <ng-container matColumnDef="sucursales">
          <th mat-header-cell *matHeaderCellDef>Sucursales</th>
          <td mat-cell *matCellDef="let u">
            {{ branchNames(u) }}
          </td>
        </ng-container>

        <ng-container matColumnDef="estado">
          <th mat-header-cell *matHeaderCellDef>Estado</th>
          <td mat-cell *matCellDef="let u">
            <span [class.activo]="u.estado === 'ACTIVO'" [class.inactivo]="u.estado !== 'ACTIVO'">
              {{ u.estado }}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef>Acciones</th>
          <td mat-cell *matCellDef="let u">
            <button mat-icon-button [matMenuTriggerFor]="menu">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item (click)="toggleStatus(u)">
                <mat-icon>{{ u.estado === 'ACTIVO' ? 'block' : 'check_circle' }}</mat-icon>
                {{ u.estado === 'ACTIVO' ? 'Desactivar' : 'Activar' }}
              </button>
            </mat-menu>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>

      @if (usuarios().length === 0 && !loading()) {
        <div class="empty-state">
          <mat-icon>group</mat-icon>
          <p>No hay usuarios registrados</p>
        </div>
      }
    </div>
  `,
  styles: `
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
    }

    .page-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }

    .table-container {
      padding: 0 24px 24px;
    }

    .full-width {
      width: 100%;
    }

    .activo {
      color: #2e7d32;
      font-weight: 500;
    }

    .inactivo {
      color: #c62828;
      font-weight: 500;
    }

    :host ::ng-deep .rol-SuperUsuario {
      background: #e3f2fd;
    }

    :host ::ng-deep .rol-AdministradorEmpresa {
      background: #e8f5e9;
    }

    :host ::ng-deep .rol-SupervisorSucursal {
      background: #fff3e0;
    }

    :host ::ng-deep .rol-Operador {
      background: #f3e5f5;
    }

    :host ::ng-deep .rol-Consulta {
      background: #fce4ec;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }
  `,
})
export class UsersListPageComponent implements OnInit {
  private readonly usuariosService = inject(UsuariosService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly usuarios = signal<Usuario[]>([]);
  readonly loading = signal(false);
  readonly displayedColumns = ['nombre', 'email', 'roles', 'sucursales', 'estado', 'acciones'];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.usuariosService.findAll().subscribe({
      next: (users) => {
        this.usuarios.set(users);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateUserDialogComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadUsers();
        this.snackBar.open('Usuario creado exitosamente', 'Cerrar', { duration: 3000 });
      }
    });
  }

  branchNames(user: Usuario): string {
    return user.sucursales.map(s => s.nombre).join(', ');
  }

  toggleStatus(user: Usuario): void {
    this.usuariosService.toggleStatus(user.id).subscribe({
      next: () => this.loadUsers(),
    });
  }
}
