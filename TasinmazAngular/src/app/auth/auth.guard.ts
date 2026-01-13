import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Login değilse → login
  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  if (state.url.startsWith('/dashboard/admin')) {
    if (!authService.isAdmin()) {
      return router.createUrlTree(['/dashboard/tasinmaz/list']);
    }
  }

  if (
    state.url.startsWith('/dashboard/tasinmaz/add') ||
    state.url.startsWith('/dashboard/tasinmaz/edit') ||
    state.url.startsWith('/dashboard/hesaplama/alan-hesabi')
  ) {
    if (authService.isAdmin()) {
      return router.createUrlTree(['/dashboard/tasinmaz/list']);
    }
  }
  return true;
};
