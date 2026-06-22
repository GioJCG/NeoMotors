import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

export const permisoGuard: CanActivateFn = (route) => {
  const userService = inject(UserService);
  const router = inject(Router);

  const requiredPermiso = route.data?.['permiso'] as string | undefined;

  if (!requiredPermiso) {
    return true;
  }

  if (userService.hasPermission(requiredPermiso)) {
    return true;
  }

  return router.parseUrl('/');
};
