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

    console.log('🔍 RoleGuard: Vérification des permissions');
    console.log('   Route:', state.url);
    console.log('   Rôles requis:', requiredRoles);

    // Vérifier si l'utilisateur est connecté
    if (!authService.isLoggedIn()) {
      console.log('❌ RoleGuard: Utilisateur non connecté');
      router.navigate(['/auth/login']);
      return false;
    }

    // Vérifier si l'utilisateur a un des rôles requis
    const currentUser = authService.getCurrentUser();
    console.log('👤 Utilisateur actuel:', currentUser);

    if (!currentUser) {
      console.log('❌ RoleGuard: Aucun utilisateur trouvé');
      router.navigate(['/auth/login']);
      return false;
    }

    console.log('🎭 Rôle de l\'utilisateur:', currentUser.role);

    // Utiliser la méthode hasAnyRole du service
    const hasRequiredRole = authService.hasAnyRole(requiredRoles);
    console.log('✅ A les permissions requises:', hasRequiredRole);

    if (hasRequiredRole) {
      console.log(`✅ RoleGuard: Accès autorisé pour rôle ${currentUser.role} (rôles requis: ${requiredRoles.join(', ')})`);
      return true;
    }

    // Rediriger vers une page d'accès refusé ou dashboard
    console.log(`❌ RoleGuard: Accès refusé pour rôle ${currentUser.role} (rôles requis: ${requiredRoles.join(', ')})`);
    router.navigate(['/acces-refuse']);
    return false;
  };
}

// Guards prédéfinis pour les rôles communs

export const agentGuard: CanActivateFn = roleGuard([UserRole.AGENT]);

export const chefAgenceGuard: CanActivateFn = roleGuard([UserRole.CHEF_AGENCE]);

export const responsableCopecGuard: CanActivateFn = roleGuard([UserRole.RESPONSABLE_COPEC]);

export const dgGuard: CanActivateFn = roleGuard([UserRole.DG]);

export const rhGuard: CanActivateFn = roleGuard([UserRole.RH]);

export const comptableGuard: CanActivateFn = roleGuard([UserRole.COMPTABLE]);

export const adminGuard: CanActivateFn = roleGuard([UserRole.ADMIN]);

// Guards pour groupes de rôles

export const validateurGuard: CanActivateFn = roleGuard([
  UserRole.CHEF_AGENCE,
  UserRole.RESPONSABLE_COPEC,
  UserRole.DG
]);

export const financeGuard: CanActivateFn = roleGuard([
  UserRole.COMPTABLE,
  UserRole.DIRECTEUR_FINANCES,
  UserRole.RH,
  UserRole.DG
]);

export const allStaffGuard: CanActivateFn = roleGuard([
  UserRole.AGENT,
  UserRole.CHEF_AGENCE,
  UserRole.RESPONSABLE_COPEC,
  UserRole.DG,
  UserRole.RH,
  UserRole.COMPTABLE,
  UserRole.ADMIN
]);