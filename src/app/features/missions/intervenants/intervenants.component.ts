import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BtnDirective } from '../../../shared/components/button/btn.directive';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { CardHeaderComponent } from '../../../shared/components/card/card-header.component';
import { CardBodyComponent } from '../../../shared/components/card/card-body.component';
import { OwnerOnlyDirective } from '../../../shared/directives/owner-only.directive';
import { IntervenantsService } from '../services/intervenants.service';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-intervenants',
  standalone: true,
  imports: [CommonModule, FormsModule, BtnDirective, BadgeComponent, CardComponent, CardHeaderComponent, CardBodyComponent, OwnerOnlyDirective, ConfirmationDialogComponent],
  templateUrl: './intervenants.component.html',
  styleUrls: ['./intervenants.component.scss']
})
export class IntervenantsComponent {
  @Input() missionId!: string | number;
  @Input() missionCreatedById!: string | number;
  @Input() currentUserId!: string | number;

  intervenants: Array<{ id: string | number; nom: string; prenom: string; role: string }> = [];

  bulkText = '';
  showModal = false;
  loading = false;
  // Role editor UI state
  editingRoleUserId: string | number | undefined = undefined;
  selectedRole: string = 'Participant';
  // Delete confirmation state
  showDelete = false;
  targetUserId: string | number | undefined = undefined;

  getInitials(i: { nom: string; prenom: string }) {
    const n = (i.nom || '').charAt(0);
    const p = (i.prenom || '').charAt(0);
    return (n + p).toUpperCase();
  }

  isYou(userId: string | number) {
    return String(userId) === String(this.currentUserId);
  }

  constructor(private intervenantsService: IntervenantsService, private toast: ToastService) {}

  ngOnInit() {
    this.fetch();
  }

  fetch() {
    if (!this.missionId) return;
    this.loading = true;
    this.intervenantsService.list(this.missionId).subscribe({
      next: (items) => { this.intervenants = items || []; this.loading = false; },
      error: () => { this.intervenants = []; this.loading = false; this.toast.error('Impossible de charger les intervenants'); }
    });
  }

  addIntervenant() {
    if (String(this.missionCreatedById) !== String(this.currentUserId)) return;
    this.showModal = true;
  }

  addFromText() {
    if (String(this.missionCreatedById) !== String(this.currentUserId)) return;
    const lines = this.bulkText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const toAdd = lines.map((line) => {
      const [namePart, rolePart] = line.split(/\s*-\s*/);
      const role = (rolePart || '').trim() || 'Participant';
      const name = (namePart || '').trim();
      const parts = name.split(/\s+/);
      const nom = parts[0] || '';
      const prenom = parts.slice(1).join(' ') || '';
      return { nom, prenom, role };
    });
    if (!toAdd.length) return;
    this.loading = true;
    this.intervenantsService.addBulk(this.missionId, toAdd).subscribe({
      next: () => { this.loading = false; this.bulkText = ''; this.showModal = false; this.toast.success('Intervenants ajoutés'); this.fetch(); },
      error: () => { this.loading = false; this.toast.error('Échec de l\'ajout des intervenants'); }
    });
  }

  closeModal() {
    this.showModal = false;
  }

  removeIntervenant(userId: string | number) {
    if (String(this.missionCreatedById) !== String(this.currentUserId)) return;
    this.targetUserId = userId;
    this.showDelete = true;
  }

  onCancelDelete() {
    this.showDelete = false;
    this.targetUserId = undefined;
  }

  onConfirmDelete() {
    if (this.targetUserId == null) return;
    this.loading = true;
    this.intervenantsService.remove(this.missionId, this.targetUserId).subscribe({
      next: () => { this.loading = false; this.onCancelDelete(); this.toast.success('Intervenant supprimé'); this.fetch(); },
      error: () => { this.loading = false; this.onCancelDelete(); this.toast.error('Échec de la suppression'); }
    });
  }

  openRoleEditor(userId: string | number, currentRole: string) {
    if (String(this.missionCreatedById) !== String(this.currentUserId)) return;
    this.editingRoleUserId = userId;
    this.selectedRole = currentRole || 'Participant';
  }

  cancelRole() {
    this.editingRoleUserId = undefined;
  }

  saveRole(userId: string | number) {
    if (String(this.missionCreatedById) !== String(this.currentUserId)) return;
    const role = (this.selectedRole || '').trim();
    if (!role) return;
    this.loading = true;
    this.intervenantsService.updateRole(this.missionId, userId, role).subscribe({
      next: () => { this.loading = false; this.editingRoleUserId = undefined; this.toast.success('Rôle mis à jour'); this.fetch(); },
      error: () => { this.loading = false; this.toast.error('Échec de la mise à jour du rôle'); }
    });
  }
}
