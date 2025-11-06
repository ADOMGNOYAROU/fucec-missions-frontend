import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BtnDirective } from '../../../shared/components/button/btn.directive';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { CardHeaderComponent } from '../../../shared/components/card/card-header.component';
import { CardBodyComponent } from '../../../shared/components/card/card-body.component';
import { JustificatifService } from '../services/justificatif.service';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-justificatifs',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    BtnDirective,
    BadgeComponent,
    LoaderComponent,
    HeaderComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    ConfirmationDialogComponent
  ],
  templateUrl: './list-justificatifs.component.html',
  styleUrls: ['./list-justificatifs.component.scss']
})
export class ListJustificatifsComponent {
  loading = false;
  hasItems = true;
  items: any[] = [];
  search = '';
  categories: string[] = [];
  selectedCategory: string | undefined = undefined;
  totals = { overall: 0, byCategory: {} as Record<string, number> };
  // delete confirm
  showDelete = false;
  targetId: string | number | undefined = undefined;

  constructor(private justificatifService: JustificatifService, private toast: ToastService, private router: Router) {
    this.fetch();
  }

  fetch() {
    this.loading = true;
    this.justificatifService.list().subscribe({
      next: (res: any) => {
        this.items = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        this.hasItems = this.items.length > 0;
        this.computeCategories();
        this.computeTotals();
        this.loading = false;
      },
      error: () => {
        this.items = [];
        this.hasItems = false;
        this.loading = false;
        this.toast.error('Impossible de charger les justificatifs');
      }
    });
  }

  get filteredItems() {
    return this.items.filter(it => {
      const mCat = this.selectedCategory ? (it.category === this.selectedCategory) : true;
      const mSearch = this.search.trim() ? (JSON.stringify(it).toLowerCase().includes(this.search.trim().toLowerCase())) : true;
      return mCat && mSearch;
    });
  }

  onSearchChange() { /* triggers change detection */ }
  onCategoryChange() { /* triggers filter and totals if needed */ }

  computeCategories() {
    const set = new Set<string>();
    this.items.forEach(it => { if (it?.category) set.add(String(it.category)); });
    this.categories = Array.from(set);
  }

  computeTotals() {
    let overall = 0;
    const by: Record<string, number> = {};
    this.items.forEach(it => {
      const amt = Number(it?.amount || 0) || 0;
      overall += amt;
      const cat = String(it?.category || 'Autres');
      by[cat] = (by[cat] || 0) + amt;
    });
    this.totals = { overall, byCategory: by };
  }

  openDelete(id: string | number) {
    this.targetId = id;
    this.showDelete = true;
  }

  onCancelDelete() { this.showDelete = false; this.targetId = undefined; }

  onConfirmDelete() {
    if (this.targetId == null) return;
    this.loading = true;
    this.justificatifService.delete(this.targetId).subscribe({
      next: () => { this.loading = false; this.onCancelDelete(); this.toast.success('Justificatif supprimé'); this.fetch(); },
      error: () => { this.loading = false; this.onCancelDelete(); this.toast.error('Échec de la suppression'); }
    });
  }

  viewDetails(id: string | number) {
    this.router.navigate(['/justificatifs', id]);
  }

  getStatusVariant(status: string): 'BROUILLON' | 'EN_ATTENTE' | 'VALIDEE' | 'IN_PROGRESS' | 'CLOTUREE' | 'REJETEE' {
    switch(status?.toUpperCase()) {
      case 'APPROVED': return 'VALIDEE';
      case 'PENDING': return 'EN_ATTENTE';
      case 'REJECTED': return 'REJETEE';
      case 'IN_PROGRESS': return 'IN_PROGRESS';
      case 'CLOSED': return 'CLOTUREE';
      default: return 'BROUILLON';
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'APPROVED': 'Approuvé',
      'PENDING': 'En attente',
      'REJECTED': 'Rejeté',
      'IN_PROGRESS': 'En cours',
      'CLOSED': 'Clôturé'
    };
    return labels[status?.toUpperCase()] || status || 'En attente';
  }
}
