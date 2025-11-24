import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { 
  roleGuard,
  adminGuard, 
  validateurGuard, 
  financeGuard,
  justificatifsGuard,
  allStaffGuard 
} from './core/guards/role.guard';

export const routes: Routes = [
  // Auth routes (accessible seulement si non connecté)
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component')
      .then(m => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component')
          .then(m => m.LoginComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },

  // Page d'accès refusé
  {
    path: 'acces-refuse',
    loadComponent: () => import('./core/pages/access-denied/access-denied.component')
      .then(m => m.AccessDeniedComponent)
  },

  // Routes protégées (nécessite authentification)
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/main-layout/main-layout.component')
      .then(m => m.MainLayoutComponent),
    children: [
      // Redirect root to dashboard within MainLayout
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      // Dashboard (accessible à tous les utilisateurs connectés)
      {
        path: 'dashboard',
        canActivate: [allStaffGuard],
        loadComponent: () => import('./features/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },

      // Routes des missions
      {
        path: 'missions',
        loadChildren: () => import('./features/missions/missions.routes')
          .then(m => m.MISSIONS_ROUTES)
      },

      // Création de mission pour chef service
      {
        path: 'chef-service/missions/create',
        canActivate: [roleGuard],
        data: { roles: ['RESPONSABLE_COPEC', 'ADMIN'] },
        loadComponent: () => import('./features/missions/chef-service-mission-create/chef-service-mission-create.component')
          .then(m => m.ChefServiceMissionCreateComponent)
      },

      // Validations (pour les rôles de validation)
      {
        path: 'validations',
        canActivate: [validateurGuard],
        loadChildren: () => import('./features/validations/validations.routes')
          .then(m => m.VALIDATIONS_ROUTES)
      },

      // Finance (accessible à RH, Comptabilité, DG, Directeur Financier)
      {
        path: 'finance',
        canActivate: [financeGuard],
        loadChildren: () => import('./features/finance/finance.routes')
          .then(m => m.FINANCE_ROUTES)
      },

      // Justificatifs (accessible à la plupart des utilisateurs)
      {
        path: 'justificatifs',
        canActivate: [justificatifsGuard],
        loadChildren: () => import('./features/justificatifs/justificatifs.routes')
          .then(m => m.JUSTIFICATIFS_ROUTES)
      },

      // Administration (admin seulement)
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadChildren: () => import('./features/admin/admin.routes')
          .then(m => m.ADMIN_ROUTES)
      },

      // Profil utilisateur
      {
        path: 'profil',
        canActivate: [allStaffGuard],
        loadComponent: () => import('./features/profil/profil.component')
          .then(m => m.ProfilComponent)
      },

      // Page 404 (doit être la dernière route)
      {
        path: '**',
        loadComponent: () => import('./core/pages/not-found/not-found.component')
          .then(m => m.NotFoundComponent)
      }
    ]
  },
  
  // Page 404 pour les routes non protégées
  {
    path: '**',
    loadComponent: () => import('./core/pages/not-found/not-found.component')
      .then(m => m.NotFoundComponent)
  }
];