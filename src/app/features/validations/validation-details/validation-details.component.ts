import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BtnDirective } from '../../../shared/components/button/btn.directive';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { CardHeaderComponent } from '../../../shared/components/card/card-header.component';
import { CardBodyComponent } from '../../../shared/components/card/card-body.component';
import { ActivatedRoute } from '@angular/router';
import { ValidationsService } from '../services/validations.service';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-validation-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BtnDirective,
    BadgeComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    ConfirmationDialogComponent
  ],
  templateUrl: './validation-details.component.html',
  styleUrls: ['./validation-details.component.scss']
})
export class ValidationDetailsComponent {
  loading = false;
  item: any;
  showReject = false;
  constructor(
    private route: ActivatedRoute,
    private service: ValidationsService,
    private toast: ToastService
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.fetch(id);
  }

  fetch(id: string | number) {
    this.loading = true;
    this.service.getOne(id).subscribe({
      next: (data) => { this.item = data; this.loading = false; },
      error: () => { this.loading = false; this.toast.error('Impossible de charger la validation'); }
    });
  }

  approve() {
    if (!this.item?.id) return;
    this.loading = true;
    this.service.approve(this.item.id).subscribe({
      next: () => { this.loading = false; this.toast.success('Validation approuvée'); this.fetch(this.item.id); },
      error: () => { this.loading = false; this.toast.error('Échec de l\'approbation'); }
    });
  }

  openReject() { this.showReject = true; }
  onCancelReject() { this.showReject = false; }
  onConfirmReject() {
    if (!this.item?.id) return;
    this.loading = true;
    this.service.reject(this.item.id).subscribe({
      next: () => { this.loading = false; this.showReject = false; this.toast.success('Validation rejetée'); this.fetch(this.item.id); },
      error: () => { this.loading = false; this.showReject = false; this.toast.error('Échec du rejet'); }
    });
  }
}
