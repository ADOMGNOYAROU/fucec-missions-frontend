import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full'
  },
  {
    path: 'users',
    loadComponent: () => import('./users-management/users-management.component')
      .then(m => m.UsersManagementComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.component')
      .then(m => m.SettingsComponent),
    canActivate: [adminGuard]
  }
];

export default ADMIN_ROUTES;
