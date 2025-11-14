import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Obtenir le token d'accès
  const token = authService.getAccessToken();

  // Ajouter le token aux requêtes si disponible (sauf pour les requêtes de login)
  if (token && !req.url.includes('/auth/login/')) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
