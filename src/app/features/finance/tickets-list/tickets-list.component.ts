import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from '../services/finance.service';

@Component({
  selector: 'app-tickets-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tickets-list.component.html',
  styleUrls: ['./tickets-list.component.scss']
})
export class TicketsListComponent {
  tickets: any[] = [];
  loading = false;
  error?: string;

  private finance = inject(FinanceService);

  ngOnInit() {
    this.loadTickets();
  }

  loadTickets() {
    this.loading = true;
    this.finance.getTickets().subscribe({
      next: (data: any) => {
        this.tickets = Array.isArray(data) ? data : (data?.results ?? []);
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.message || 'Erreur lors du chargement des tickets';
        this.loading = false;
      }
    });
  }

  validate(ticket: any) {
    const id = ticket?.id ?? ticket?.uuid ?? ticket?.pk;
    if (!id) return;
    this.finance.validateTicket(id).subscribe(() => this.loadTickets());
  }

  reject(ticket: any) {
    const id = ticket?.id ?? ticket?.uuid ?? ticket?.pk;
    if (!id) return;
    this.finance.rejectTicket(id).subscribe(() => this.loadTickets());
  }

  requestJustifs(ticket: any) {
    const id = ticket?.id ?? ticket?.uuid ?? ticket?.pk;
    if (!id) return;
    this.finance.requestJustificatifs(id).subscribe(() => this.loadTickets());
  }
}
