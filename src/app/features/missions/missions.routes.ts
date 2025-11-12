import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { UserRole } from '../../core/services/auth.service';

export const MISSIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./mission-list/mission-list.component')
      .then(m => m.MissionListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'create',
    loadComponent: () => import('./mission-create/mission-create.component')
      .then(m => m.MissionCreateComponent),
    canActivate: [authGuard]
  },
  {
    path: 'create-order',
    loadComponent: () => import('./order-mission-create/order-mission-create.component')
      .then(m => m.OrderMissionCreateComponent),
    canActivate: [authGuard, roleGuard([UserRole.AGENT, UserRole.CHEF_AGENCE])],
    data: { requiresAuth: true }
  },
  {
    path: ':id',
    loadComponent: () => import('./mission-details/mission-details.component')
      .then(m => m.MissionDetailsComponent),
    canActivate: [authGuard]
  }
];

export default MISSIONS_ROUTES;
