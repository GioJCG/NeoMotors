import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

export const authGuard: CanActivateFn = (route) => {
  const userService = inject(UserService);
  const router = inject(Router);

  if (!userService.isAuthenticated()) {
    return router.parseUrl('/auth/login');
  }

  if (userService.requiresCompany() && !route.url.toString().includes('onboarding')) {
    return router.parseUrl('/onboarding/company');
  }

  return true;
};
