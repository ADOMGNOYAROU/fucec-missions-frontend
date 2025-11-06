import { Routes } from '@angular/router';
import { ValidationListComponent } from './validation-list/validation-list.component';
import { ValidationDetailsComponent } from './validation-details/validation-details.component';

export const VALIDATIONS_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: ValidationListComponent,
    title: 'Validations'
  },
  {
    path: ':id',
    component: ValidationDetailsComponent,
    title: 'Détails de validation'
  }
];
