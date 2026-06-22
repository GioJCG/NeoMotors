import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { UserService } from '../services/user.service';

@Directive({
  selector: '[appRol]',
  standalone: true,
})
export class RolDirective {
  private readonly userService = inject(UserService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);

  @Input({ required: true, alias: 'appRol' }) roles: string[] = [];

  constructor() {
    effect(() => {
      this.userService.roles();
      this.updateView();
    });
  }

  private updateView(): void {
    this.viewContainer.clear();
    if (this.userService.hasAnyRole(this.roles)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
