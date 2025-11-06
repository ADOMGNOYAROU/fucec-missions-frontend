import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

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
    path: ':id',
    loadComponent: () => import('./mission-details/mission-details.component')
      .then(m => m.MissionDetailsComponent),
    canActivate: [authGuard]
  }
];

export default MISSIONS_ROUTES;
