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

  // Mode développement - connexion automatique si activé
  if (environment.devAutoLogin && !authService.isLoggedIn() && typeof window !== 'undefined') {
    const devUser = environment.devUser as any;
    if (devUser) {
      // Création d'un utilisateur compatible avec l'interface User
      const normalizedUser = {
        id: devUser.id || 1,
        identifiant: devUser.identifiant || 'dev',
        first_name: devUser.first_name || devUser.prenom || 'Développeur',
        last_name: devUser.last_name || devUser.nom || 'Local',
        prenom: devUser.prenom || devUser.first_name || 'Développeur',
        nom: devUser.nom || devUser.last_name || 'Local',
        email: devUser.email || 'dev@example.com',
        role: devUser.role || 'ADMIN',
        telephone: devUser.telephone || '',
        matricule: devUser.matricule || ''
      };

      // Utilisation de localStorage directement pour éviter les problèmes de visibilité
      localStorage.setItem('current_user', JSON.stringify(normalizedUser));
      localStorage.setItem('access_token', 'dev_access_token');
      localStorage.setItem('refresh_token', 'dev_refresh_token');
      
      // Forcer le rafraîchissement de l'état d'authentification
      authService['currentUserSubject'].next(normalizedUser);
      return true;
    }
  }

  // Vérifier si l'utilisateur est connecté
  if (authService.isLoggedIn()) {
    return true;
  }

  // Rediriger vers la page de connexion avec l'URL de retour
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
  return router.createUrlTree(['/dashboard']);
};