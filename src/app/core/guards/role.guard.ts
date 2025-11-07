import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService, UserRole } from '../services/auth.service';

/**
 * Factory pour créer un guard basé sur les rôles
 * Vérifie si l'utilisateur possède un ou plusieurs rôles requis
 */
export function roleGuard(requiredRoles: UserRole[]): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Vérifier si l'utilisateur est connecté
    if (!authService.isLoggedIn()) {
      console.log('RoleGuard: Utilisateur non connecté - laisser authGuard gérer la connexion automatique');
      // Ne pas rediriger ici, laisser authGuard faire la connexion automatique
      return true;
    }

    // Vérifier si l'utilisateur a un des rôles requis
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      console.log('RoleGuard: Aucun utilisateur trouvé');
      return false;
    }

    // Utiliser la méthode hasAnyRole du service
    const hasRequiredRole = authService.hasAnyRole(requiredRoles);

    if (hasRequiredRole) {
      console.log(`RoleGuard: Accès autorisé pour rôle ${currentUser.role} (rôles requis: ${requiredRoles.join(', ')})`);
      return true;
    }

    // Rediriger vers une page d'accès refusé ou dashboard
    console.log(`RoleGuard: Accès refusé pour rôle ${currentUser.role} (rôles requis: ${requiredRoles.join(', ')})`);
    router.navigate(['/acces-refuse']);
    return false;
  };
}

// Guards prédéfinis pour les rôles communs

export const agentGuard: CanActivateFn = roleGuard(['AGENT']);

export const chefAgenceGuard: CanActivateFn = roleGuard(['CHEF_AGENCE']);

export const responsableCopecGuard: CanActivateFn = roleGuard(['RESPONSABLE_COPEC']);

export const dgGuard: CanActivateFn = roleGuard(['DG']);

export const rhGuard: CanActivateFn = roleGuard(['RH']);

export const comptableGuard: CanActivateFn = roleGuard(['COMPTABLE']);

export const adminGuard: CanActivateFn = roleGuard(['ADMIN']);

// Guards pour groupes de rôles

export const validateurGuard: CanActivateFn = roleGuard([
  'CHEF_AGENCE',
  'RESPONSABLE_COPEC',
  'DG'
]);

export const financeGuard: CanActivateFn = roleGuard([
  'COMPTABLE',
  'DIRECTEUR_FINANCES',
  'RH',
  'DG'
]);

export const allStaffGuard: CanActivateFn = roleGuard([
  'AGENT',
  'CHEF_AGENCE',
  'RESPONSABLE_COPEC',
  'DG',
  'RH',
  'COMPTABLE',
  'ADMIN'
]);