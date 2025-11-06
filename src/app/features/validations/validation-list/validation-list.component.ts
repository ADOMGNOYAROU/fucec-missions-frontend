import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BtnDirective } from '../../../shared/components/button/btn.directive';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ValidationsService, ValidationItem } from '../services/validations.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-validation-list',
  standalone: true,
  imports: [CommonModule, RouterModule, BtnDirective, BadgeComponent, LoaderComponent, ConfirmationDialogComponent],
  templateUrl: './validation-list.component.html',
  styleUrls: ['./validation-list.component.scss']
})
export class ValidationListComponent {
  loading = false;
  items: ValidationItem[] = [];
  roleFilter: string | undefined = undefined;

  // Reject confirmation
  showReject = false;
  targetId: string | number | undefined = undefined;

  constructor(private service: ValidationsService, private toast: ToastService) {}

  ngOnInit() {
    this.fetch();
  }

  fetch() {
    this.loading = true;
    this.service.listMyValidations({ role: this.roleFilter }).subscribe({
      next: (data) => { this.items = data || []; this.loading = false; },
      error: () => { this.items = []; this.loading = false; this.toast.error('Impossible de charger les validations'); }
    });
  }

  applyRoleFilter(role?: string) {
    this.roleFilter = role;
    this.fetch();
  }

  approve(id: string | number) {
    this.loading = true;
    this.service.approve(id).subscribe({
      next: () => { this.loading = false; this.toast.success('Validation approuvée'); this.fetch(); },
      error: () => { this.loading = false; this.toast.error('Échec de l\'approbation'); }
    });
  }

  openReject(id: string | number) {
    this.targetId = id;
    this.showReject = true;
  }

  onCancelReject() {
    this.showReject = false;
    this.targetId = undefined;
  }

  onConfirmReject() {
    if (this.targetId == null) return;
    this.loading = true;
    this.service.reject(this.targetId).subscribe({
      next: () => { this.loading = false; this.onCancelReject(); this.toast.success('Validation rejetée'); this.fetch(); },
      error: () => { this.loading = false; this.onCancelReject(); this.toast.error('Échec du rejet'); }
    });
  }
}
