import { inject, Inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivateFn, UrlTree } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService, UserRole } from '../services/auth.service';
import { environment } from '../../../environments/environment';

/**
 * Guard pour protéger les routes nécessitant une authentification
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
};

/**
 * Guard pour empêcher l'accès au login si déjà connecté
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true;
  }

  // Rediriger vers le dashboard si déjà connecté
  router.navigate(['/dashboard']);
  return false;
};