import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';

/**
 * Interceptor pour gérer les erreurs HTTP globalement
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // On laisse auth.interceptor gérer les erreurs 401
      if (error.status === 401) {
        return throwError(() => error);
      }

      // Erreur 403 - Accès refusé
      if (error.status === 403) {
        toast.error('Accès refusé');
        router.navigate(['/acces-refuse']);
      }

      // Erreur 404 - Ressource non trouvée
      if (error.status === 404) {
        toast.warning('Ressource non trouvée');
      }

      // Erreur 500 - Erreur serveur
      if (error.status === 500) {
        toast.error('Erreur serveur, veuillez réessayer');
      }

      // Erreur réseau (pas de connexion)
      if (error.status === 0) {
        toast.error('Erreur réseau: impossible de contacter le serveur');
      }

      // Retourner l'erreur pour que le composant puisse la gérer
      return throwError(() => error);
    })
  );
};