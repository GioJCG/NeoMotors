import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

export const roleGuard: CanActivateFn = (route) => {
  const userService = inject(UserService);
  const router = inject(Router);

  const requiredRoles = route.data?.['roles'] as string[] | undefined;

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  if (userService.hasAnyRole(requiredRoles)) {
    return true;
  }

  return router.parseUrl('/');
};
