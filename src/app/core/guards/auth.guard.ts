import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

/**
 * Guard pour protéger les routes nécessitant une authentification
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Dev bypass - force dev login if needed (frontend only mode)
  if (environment.devAutoLogin) {
    // Force dev user login if not already logged in
    if (!authService.isLoggedIn()) {
      // Check if we're in browser environment
      if (typeof window !== 'undefined') {
        const devUser = environment.devUser as any;
        localStorage.setItem('current_user', JSON.stringify(devUser));
        localStorage.setItem('access_token', 'dev');
        localStorage.setItem('refresh_token', 'dev');
        authService['currentUserSubject'].next(devUser);
      }
    }
    return true;
  }

  if (authService.isLoggedIn()) {
    return true;
  }

  // Frontend only mode - redirect to login
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
  
  return false;
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