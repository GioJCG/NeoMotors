import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsuariosService } from '../../services/usuarios.service';
import { ContextService } from '../../../../core/services/context.service';
import { UserService } from '../../../../core/services/user.service';
import { BranchItem } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-create-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Crear nuevo usuario</h2>
    <mat-dialog-content>
      <form [formGroup]="userForm" class="user-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" placeholder="Nombre completo" />
          @if (userForm.get('nombre')?.hasError('required') && userForm.get('nombre')?.touched) {
            <mat-error>Requerido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Correo electrónico</mat-label>
          <input matInput formControlName="email" type="email" placeholder="usuario@taller.com" />
          @if (userForm.get('email')?.hasError('required') && userForm.get('email')?.touched) {
            <mat-error>Requerido</mat-error>
          }
          @if (userForm.get('email')?.hasError('email') && userForm.get('email')?.touched) {
            <mat-error>Email inválido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Contraseña</mat-label>
          <input matInput formControlName="password" type="password" />
          @if (userForm.get('password')?.hasError('required') && userForm.get('password')?.touched) {
            <mat-error>Requerido</mat-error>
          }
          @if (userForm.get('password')?.hasError('minlength') && userForm.get('password')?.touched) {
            <mat-error>Mínimo 8 caracteres</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Rol</mat-label>
          <mat-select formControlName="rol">
            <mat-option value="SupervisorSucursal">Supervisor de Sucursal</mat-option>
            <mat-option value="Operador">Operador</mat-option>
            <mat-option value="Consulta">Consulta</mat-option>
          </mat-select>
          @if (userForm.get('rol')?.hasError('required') && userForm.get('rol')?.touched) {
            <mat-error>Requerido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Sucursal</mat-label>
          <mat-select formControlName="sucursalId">
            @for (branch of branches(); track branch.id) {
              <mat-option [value]="branch.id">{{ branch.nombre }}</mat-option>
            }
          </mat-select>
          @if (userForm.get('sucursalId')?.hasError('required') && userForm.get('sucursalId')?.touched) {
            <mat-error>Requerido</mat-error>
          }
        </mat-form-field>

        @if (error(); as err) {
          <div class="error-message">
            <span>{{ err }}</span>
          </div>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" (click)="onSubmit()" [disabled]="userForm.invalid || loading()">
        @if (loading()) {
          <mat-spinner diameter="18"></mat-spinner>
        } @else {
          Crear usuario
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .user-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 8px;
    }

    .full-width {
      width: 100%;
    }

    .error-message {
      padding: 8px 12px;
      background: #fce4ec;
      border-radius: 4px;
      color: #c62828;
      font-size: 14px;
    }
  `,
})
export class CreateUserDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CreateUserDialogComponent>);
  private readonly usuariosService = inject(UsuariosService);
  private readonly contextService = inject(ContextService);
  private readonly userService = inject(UserService);

  readonly branches = signal<BranchItem[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly userForm: FormGroup;

  constructor() {
    this.userForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rol: ['', Validators.required],
      sucursalId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const companyId = this.userService.currentCompanyId();
    if (companyId) {
      this.contextService.getBranches(companyId).subscribe({
        next: (branches) => this.branches.set(branches),
      });
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    this.usuariosService.create(this.userForm.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al crear usuario');
        this.loading.set(false);
      },
    });
  }
}
