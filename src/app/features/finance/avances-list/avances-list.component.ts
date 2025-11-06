import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from '../services/finance.service';

@Component({
  selector: 'app-avances-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avances-list.component.html',
  styleUrls: ['./avances-list.component.scss']
})
export class AvancesListComponent {
  avances: any[] = [];
  loading = false;
  error?: string;

  private finance = inject(FinanceService);

  ngOnInit() {
    this.loadAvances();
  }

  loadAvances() {
    this.loading = true;
    this.finance.getAvances().subscribe({
      next: (data: any) => {
        this.avances = Array.isArray(data) ? data : (data?.results ?? []);
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.message || 'Erreur lors du chargement des avances';
        this.loading = false;
      }
    });
  }
}
