import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

/**
 * Interceptor pour gérer les erreurs HTTP globalement
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Erreur 401 - Token expiré ou invalide
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        // Tenter de rafraîchir le token
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Réessayer la requête avec le nouveau token
            const token = authService.getAccessToken();
            const clonedReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`
              }
            });
            return next(clonedReq);
          }),
          catchError(refreshError => {
            // Si le refresh échoue, déconnecter l'utilisateur
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }

      // Erreur 403 - Accès refusé
      if (error.status === 403) {
        router.navigate(['/acces-refuse']);
      }

      // Erreur 404 - Ressource non trouvée
      if (error.status === 404) {
        console.error('Ressource non trouvée:', error.url);
      }

      // Erreur 500 - Erreur serveur
      if (error.status === 500) {
        console.error('Erreur serveur:', error.message);
      }

      // Erreur réseau (pas de connexion)
      if (error.status === 0) {
        console.error('Erreur réseau: Impossible de contacter le serveur');
      }

      // Retourner l'erreur pour que le composant puisse la gérer
      return throwError(() => error);
    })
  );
};