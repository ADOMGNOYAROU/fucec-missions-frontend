import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { allStaffGuard } from '../../core/guards/role.guard';

export const MISSIONS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, allStaffGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./mission-list/mission-list.component')
          .then(m => m.MissionListComponent)
      },
      {
        path: 'create',
        loadComponent: () => import('./mission-create/mission-create.component')
          .then(m => m.MissionCreateComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./mission-details/mission-details.component')
          .then(m => m.MissionDetailsComponent)
      },
      {
        path: '**',
        redirectTo: ''
      }
    ]
  }
];

export default MISSIONS_ROUTES;
