import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError, from, BehaviorSubject, of } from 'rxjs';
import { catchError, switchMap, filter, take, tap, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

// État global pour gérer le rafraîchissement du token
let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Ne pas intercepter les requêtes d'authentification ou de rafraîchissement
  if (isAuthOrRefreshRequest(req.url)) {
    return next(req);
  }

  // Récupérer le token d'accès actuel
  const token = authService.getAccessToken();
  
  // Si pas de token, on laisse passer (sera bloqué par le backend si nécessaire)
  if (!token) {
    return next(req);
  }

  // Cloner la requête et ajouter le token
  const authReq = addTokenToRequest(req, token);

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si l'erreur n'est pas une 401, on la renvoie
      if (error.status !== 401) {
        return throwError(() => error);
      }

      // Si on est déjà en train de rafraîchir le token
      if (isRefreshing) {
        return refreshTokenSubject.pipe(
          filter(token => token !== null),
          take(1),
          switchMap(token => {
            const newReq = addTokenToRequest(req, token!);
            return next(newReq);
          })
        );
      }

      // Sinon, on tente de rafraîchir le token
      isRefreshing = true;
      refreshTokenSubject.next(null);

      const refreshToken = authService.getRefreshToken();
      if (!refreshToken) {
        authService.logout();
        return throwError(() => new Error('Aucun refresh token disponible'));
      }

      const refreshRequest = authService.refreshToken();
      if (!refreshRequest) {
        authService.logout();
        return throwError(() => new Error('Impossible de rafraîchir le token'));
      }

      return refreshRequest.pipe(
        switchMap((response: any) => {
          isRefreshing = false;
          const newToken = response?.access;
          if (!newToken) {
            throw new Error('Token de rafraîchissement invalide');
          }
          
          // Le token est déjà sauvegardé par le service via le pipe(tap())
          refreshTokenSubject.next(newToken);
          
          // Rejouer la requête originale avec le nouveau token
          const newReq = addTokenToRequest(req, newToken);
          return next(newReq);
        }),
        catchError((refreshError: any) => {
          isRefreshing = false;
          authService.logout();
          router.navigate(['/auth/login']);
          return throwError(() => refreshError);
        })
      );
    })
  );
};

// Vérifie si la requête est une requête d'authentification ou de rafraîchissement
function isAuthOrRefreshRequest(url: string): boolean {
  return url.includes('/auth/') || 
         url.includes('/token/refresh/') || 
         url.includes('/token/verify/');
}

// Ajoute le token à l'en-tête de la requête
function addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
  // Ne pas ajouter de Content-Type pour les requêtes FormData
  if (request.body instanceof FormData) {
    return request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // Pour les autres requêtes, ajouter les en-têtes standards
  return request.clone({
    setHeaders: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
      // Ne pas ajouter Content-Type ici pour laisser Angular le gérer
    }
  });
}
