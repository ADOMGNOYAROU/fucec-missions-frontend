import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService, UserRole } from '../services/auth.service';

/**
 * Factory pour créer un guard basé sur les rôles
 */
export function roleGuard(allowedRoles: (UserRole | string)[]): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    console.log('[RoleGuard] Vérification des rôles:', { allowedRoles, currentUrl: state.url });

    // Vérifier si l'utilisateur est connecté
    if (!authService.isLoggedIn()) {
      console.log('[RoleGuard] Utilisateur non connecté, redirection vers /login');
      return router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    const userRole = authService.getUserRole();
    console.log('[RoleGuard] Rôle actuel de l\'utilisateur:', userRole);

    // Vérifier si l'utilisateur a le bon rôle
    if (authService.hasAnyRole(allowedRoles)) {
      console.log('[RoleGuard] Accès autorisé pour le rôle:', userRole);
      return true;
    }

    console.warn('[RoleGuard] Accès refusé. Rôle requis:', allowedRoles, 'Rôle actuel:', userRole);
    
    // Rediriger vers une page d'accès refusé ou le tableau de bord
    return router.createUrlTree(['/acces-refuse'], {
      queryParams: { 
        requiredRoles: JSON.stringify(allowedRoles),
        currentRole: userRole,
        fromUrl: state.url
      }
    });
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

export const justificatifsGuard: CanActivateFn = roleGuard([
  'AGENT',
  'CHEF_AGENCE',
  'RESPONSABLE_COPEC',
  'DG',
  'RH',
  'COMPTABLE',
  'ADMIN'
]);