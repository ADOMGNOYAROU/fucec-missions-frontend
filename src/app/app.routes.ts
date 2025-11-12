import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { 
  adminGuard, 
  validateurGuard, 
  financeGuard,
  allStaffGuard 
} from './core/guards/role.guard';
import { UserRole } from './core/services/auth.service';

// Import des composants de profil
import { AgentProfileComponent } from './features/profiles/agent-profile/agent-profile.component';
import { ChefAgenceProfileComponent } from './features/profiles/chef-agence-profile/chef-agence-profile.component';
import { ResponsableCopecProfileComponent } from './features/profiles/responsable-copec-profile/responsable-copec-profile.component';
import { DgProfileComponent } from './features/profiles/dg-profile/dg-profile.component';
import { RhProfileComponent } from './features/profiles/rh-profile/rh-profile.component';
import { ComptableProfileComponent } from './features/profiles/comptable-profile/comptable-profile.component';
import { DirecteurFinancesProfileComponent } from './features/profiles/directeur-finances-profile/directeur-finances-profile.component';
import { ChauffeurProfileComponent } from './features/profiles/chauffeur-profile/chauffeur-profile.component';
import { AdminProfileComponent } from './features/profiles/admin-profile/admin-profile.component';

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

      // Missions (accessible à tous)
      {
        path: 'missions',
        canActivate: [allStaffGuard],
        loadChildren: () => import('./features/missions/missions.routes')
          .then(m => m.MISSIONS_ROUTES)
      },

      {
        path: 'validations',
        loadChildren: () => import('./features/validations/validations.routes').then(m => m.VALIDATIONS_ROUTES),
        canActivate: [roleGuard([UserRole.DG, UserRole.RH, UserRole.CHEF_AGENCE, UserRole.RESPONSABLE_COPEC])]
      }, 

      // Finance (accessible à RH, Comptabilité, DG)
      {
        path: 'finance',
        canActivate: [financeGuard],
        loadChildren: () => import('./features/finance/finance.routes')
          .then(m => m.FINANCE_ROUTES)
      },

      // Justificatifs (accessible à tous)
      {
        path: 'justificatifs',
        canActivate: [allStaffGuard],
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
        path: 'profile',
        loadComponent: () => import('./shared/components/profile-layout')
          .then(m => m.ProfileLayoutComponent),
        canActivate: [authGuard],
        children: [
          { path: '', redirectTo: 'agent', pathMatch: 'full' }, // Redirect to agent by default
          { path: 'agent', component: AgentProfileComponent },
          { path: 'chef-agence', component: ChefAgenceProfileComponent },
          { path: 'responsable-copec', component: ResponsableCopecProfileComponent },
          { path: 'dg', component: DgProfileComponent },
          { path: 'rh', component: RhProfileComponent },
          { path: 'comptable', component: ComptableProfileComponent },
          { path: 'directeur-finances', component: DirecteurFinancesProfileComponent },
          { path: 'chauffeur', component: ChauffeurProfileComponent },
          { path: 'admin', component: AdminProfileComponent }
        ]
      },

      // Page d'accès refusé
      {
        path: 'acces-refuse',
        loadComponent: () => import('./shared/components/acces-refuse/acces-refuse.component')
          .then(m => m.AccesRefuseComponent)
      },

      // Page 404
      {
        path: '**',
        loadComponent: () => import('./shared/components/not-found/not-found.component')
          .then(m => m.NotFoundComponent)
      }
    ]
  }
];