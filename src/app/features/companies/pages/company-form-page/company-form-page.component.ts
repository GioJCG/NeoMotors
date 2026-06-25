import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { CompanyFormComponent } from '../../../../shared/components/company-form/company-form.component';

@Component({
  selector: 'app-company-form-page',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule, CompanyFormComponent],
  template: `
    <app-company-form
      [mode]="mode"
      [companyId]="companyId"
      cancelRoute="/companies"
      [subtitle]="isEditMode() ? 'Actualiza los datos de la empresa' : 'Registra una nueva empresa en el sistema'"
      (saved)="onCompanySaved()"
    />
  `,
})
export class CompanyFormPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  readonly isEditMode = signal(false);
  mode: 'create' | 'edit' = 'create';
  companyId: string | null = null;

  ngOnInit(): void {
    this.companyId = this.route.snapshot.paramMap.get('id');
    if (this.companyId) {
      this.isEditMode.set(true);
      this.mode = 'edit';
    }
  }

  onCompanySaved(): void {
    this.snackBar.open(
      this.isEditMode() ? 'Empresa actualizada exitosamente' : 'Empresa creada exitosamente',
      'Cerrar',
      { duration: 3000 },
    );
    this.router.navigate(['/companies']);
  }
}
