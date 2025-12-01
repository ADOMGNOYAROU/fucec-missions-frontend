import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Variables pour gérer le rafraîchissement du token
let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

/**
 * Intercepteur HTTP pour gérer l'authentification
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Ne pas ajouter le token pour les requêtes d'authentification
  if (req.url.includes('/auth/')) {
    return next(req);
  }

  // Récupérer le token directement depuis le localStorage pour éviter les problèmes de timing
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('access_token');
  }
  
  // Debug: Log token status
  console.log('[Auth Interceptor] Request URL:', req.url);
  console.log('[Auth Interceptor] Token available:', !!token);
  if (token) {
    console.log('[Auth Interceptor] Token preview:', token.substring(0, 20) + '...');
  } else {
    console.warn('[Auth Interceptor] No token found in localStorage');
  }
  
  // Si pas de token, continuer sans modification
  if (!token) {
    console.warn('[Auth Interceptor] No token found, sending request without auth');
    return next(req);
  }

  // Cloner la requête et ajouter le token d'authentification
  const authReq = addTokenHeader(req, token);
  
  // Exécuter la requête et gérer les erreurs
  return next(authReq).pipe(
    catchError(error => {
      // Si l'erreur est une 401 (Non autorisé), essayer de rafraîchir le token
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(authReq, next, authService, router);
      }
      // Pour les autres erreurs, propager l'erreur
      return throwError(() => error);
    })
  );
};

/**
 * Gère les erreurs 401 en tentant de rafraîchir le token
 */
function handle401Error(
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
): Observable<HttpEvent<any>> {
  // Si on est déjà en train de rafraîchir le token
  if (isRefreshing) {
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => {
        return next(addTokenHeader(request, token!));
      })
    );
  }

  // Sinon, on lance le rafraîchissement du token
  isRefreshing = true;
  refreshTokenSubject.next(null);

  const refreshToken = authService.refreshToken;
  
  // Si on a un refresh token, on tente de rafraîchir le token
  if (refreshToken) {
    return authService.refreshAccessToken().pipe(
      switchMap((response: any) => {
        isRefreshing = false;
        
        // Mettre à jour le token dans le localStorage
        if (response.access) {
          // Stocker le nouveau token
          localStorage.setItem('access_token', response.access);
          
          // Si on a un nouveau refresh token, le stocker aussi
          if (response.refresh) {
            localStorage.setItem('refresh_token', response.refresh);
          }
          
          // Mettre à jour le BehaviorSubject
          refreshTokenSubject.next(response.access);
          
          // Renvoyer la requête originale avec le nouveau token
          return next(addTokenHeader(request, response.access));
        }
        
        // Si pas de nouveau token, déconnecter l'utilisateur
        authService.logout();
        router.navigate(['/auth/login']);
        return throwError(() => new Error('Échec du rafraîchissement du token'));
      }),
      catchError((error) => {
        isRefreshing = false;
        
        // En cas d'erreur, déconnecter l'utilisateur
        authService.logout();
        router.navigate(['/auth/login']);
        
        return throwError(() => error);
      })
    );
  } else {
    // Si pas de refresh token, déconnecter l'utilisateur
    isRefreshing = false;
    authService.logout();
    router.navigate(['/auth/login']);
    return throwError(() => new Error('Aucun refresh token disponible'));
  }
}

/**
 * Ajoute le token d'authentification à l'en-tête de la requête
 */
function addTokenHeader(request: HttpRequest<any>, token: string | null): HttpRequest<any> {
  if (token) {
    console.log('[Auth Interceptor] Adding token to request headers');
    const authReq = request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    console.log('[Auth Interceptor] Request headers:', authReq.headers.keys());
    return authReq;
  }
  console.warn('[Auth Interceptor] No token provided to addTokenHeader');
  return request;
}
