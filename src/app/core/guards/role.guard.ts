import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService, UserRole } from '../services/auth.service';

/**
 * Factory pour créer un guard basé sur les rôles
 */
export function roleGuard(allowedRoles: UserRole[]): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Vérifier si l'utilisateur est connecté
    if (!authService.isLoggedIn()) {
      router.navigate(['/auth/login']);
      return false;
    }

    // Vérifier si l'utilisateur a le bon rôle
    if (authService.hasAnyRole(allowedRoles)) {
      return true;
    }

    // Rediriger vers une page d'accès refusé ou dashboard
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

// Guard commun pour Chef d'Agence et Directeur de Service
export const chefResponsableGuard: CanActivateFn = roleGuard([
  'CHEF_AGENCE',
  'RESPONSABLE_COPEC'
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