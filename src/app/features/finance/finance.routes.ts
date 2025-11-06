import { Routes } from '@angular/router';
import { TicketsListComponent } from './tickets-list/tickets-list.component';
import { AvancesListComponent } from './avances-list/avances-list.component';

export const FINANCE_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'tickets'
  },
  {
    path: 'tickets',
    component: TicketsListComponent,
    title: 'Tickets - Finance'
  },
  {
    path: 'avances',
    component: AvancesListComponent,
    title: 'Avances - Finance'
  }
];
