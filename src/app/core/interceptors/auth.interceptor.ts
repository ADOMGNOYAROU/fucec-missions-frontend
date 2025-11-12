import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 🔵 DEBUG: Intercepteur appelé
  console.log('🔵 AuthInterceptor: Requête interceptée:', req.method, req.url);

  // Ignorer les requêtes qui ne nécessitent pas d'authentification
  if (req.url.includes('/auth/login/') || req.url.includes('/auth/token/refresh/')) {
    console.log('🔵 AuthInterceptor: Requête d\'authentification ignorée:', req.url);
    return next(req);
  }

  // Récupérer le token d'accès depuis le service
  const accessToken = authService.getAccessToken();

  // 🔑 DEBUG: Token récupéré
  console.log('🔑 AuthInterceptor: Token récupéré:', accessToken ? 'OUI' : 'NON');

  // Cloner la requête pour ajouter le header Authorization
  let authReq: HttpRequest<any> = req;

  if (accessToken) {
    // Ajouter le header Authorization avec le bon format
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    // 📤 DEBUG: Headers envoyés
    console.log('📤 AuthInterceptor: Header Authorization ajouté:', `Bearer ${accessToken.substring(0, 20)}...`);
  } else {
    console.log('⚠️ AuthInterceptor: Aucun token disponible pour cette requête');
  }

  // Traiter la requête et gérer les erreurs
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Vérifier si c'est une vraie erreur HTTP
      if (error instanceof HttpErrorResponse) {
        console.log('🔍 AuthInterceptor: Erreur HTTP détectée:', error.status, error.url);

        // Gérer les erreurs 401 (Unauthorized) - Tentative de refresh
        if (error.status === 401 && !req.url.includes('/auth/login/') && !req.url.includes('/auth/token/refresh/')) {
          console.log('🔄 AuthInterceptor: Erreur 401 détectée, tentative de refresh automatique...');

          const refreshToken = authService.getRefreshToken();

          if (refreshToken) {
            console.log('🔄 AuthInterceptor: Refresh token trouvé, tentative de rafraîchissement...');

            // Tenter de rafraîchir le token
            return authService.refreshToken().pipe(
              switchMap((response) => {
                // Récupérer le nouveau token d'accès
                const newAccessToken = authService.getAccessToken();

                if (newAccessToken) {
                  console.log('✅ AuthInterceptor: Token rafraîchi avec succès');

                  // Relancer la requête originale avec le nouveau token
                  const newReq = req.clone({
                    setHeaders: {
                      Authorization: `Bearer ${newAccessToken}`
                    }
                  });

                  return next(newReq);
                } else {
                  console.error('❌ AuthInterceptor: Impossible de récupérer le nouveau token après refresh');
                  authService.logout();
                  return throwError(() => error);
                }
              }),
              catchError((refreshError) => {
                console.error('❌ AuthInterceptor: Échec du refresh:', refreshError);
                // En cas d'échec du refresh, déconnecter l'utilisateur
                authService.logout();
                return throwError(() => refreshError);
              })
            );
          } else {
            console.log('❌ AuthInterceptor: Aucun refresh token disponible');
            authService.logout();
          }
        } else if (error.status === 403) {
          console.log('🚫 AuthInterceptor: Accès refusé (403) - Permissions insuffisantes');
        }
      } else {
        // Erreur non-HTTP (réseau, parsing, etc.)
        console.error('🔍 AuthInterceptor: Erreur non-HTTP détectée:', error);
      }

      // Pour les autres erreurs, propager l'erreur
      return throwError(() => error);
    })
  );
};
