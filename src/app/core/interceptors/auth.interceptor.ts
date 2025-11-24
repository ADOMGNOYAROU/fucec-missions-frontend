import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Obtenir le token d'accès
  const token = authService.getAccessToken();
  const refreshToken = authService.getRefreshToken();

  // Ne pas ajouter le token pour les requêtes d'authentification
  if (req.url.includes('/auth/')) {
    return next(req);
  }

  // Cloner la requête et ajouter le token d'authentification
  const authReq = req.clone({
    setHeaders: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // Gérer la réponse
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si l'erreur est une 401 (Non autorisé)
      if (error.status === 401) {
        // Si c'est une requête de rafraîchissement qui échoue, on déconnecte
        if (req.url.includes('/auth/refresh/')) {
          authService.logout();
          router.navigate(['/auth/login']);
          return throwError(() => new Error('Session expirée, veuillez vous reconnecter'));
        }
        
        // Si on a un refresh token, on tente de le rafraîchir
        if (refreshToken) {
          const refresh$ = authService.refreshToken();
          
          if (!refresh$) {
            return throwError(() => new Error('Impossible de rafraîchir la session'));
          }
          
          return refresh$.pipe(
            switchMap(() => {
              const newToken = authService.getAccessToken();
              if (!newToken) {
                authService.logout();
                return throwError(() => new Error('Session invalide'));
              }
              
              // Recréer la requête avec le nouveau token
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`,
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                }
              });
              
              // Réessayer la requête originale
              return next(newReq);
            }),
            catchError((refreshError) => {
              // Si le rafraîchissement échoue, on ne déconnecte pas immédiatement
              // pour éviter des boucles de déconnexion
              console.error('Erreur de rafraîchissement du token:', refreshError);
              return throwError(() => refreshError);
            })
          );
        }
      }
      
      // Pour les autres erreurs, on les renvoie telles quelles
      return throwError(() => error);
    })
  );
};
