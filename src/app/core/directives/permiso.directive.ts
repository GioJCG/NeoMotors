import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { UserService } from '../services/user.service';

@Directive({
  selector: '[appPermiso]',
  standalone: true,
})
export class PermisoDirective {
  private readonly userService = inject(UserService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);

  @Input({ required: true, alias: 'appPermiso' }) permiso = '';

  constructor() {
    effect(() => {
      this.userService.permisos();
      this.updateView();
    });
  }

  private updateView(): void {
    this.viewContainer.clear();
    if (this.userService.hasPermission(this.permiso)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
