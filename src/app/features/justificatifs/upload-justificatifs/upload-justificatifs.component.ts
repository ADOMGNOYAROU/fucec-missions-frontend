import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BtnDirective } from '../../../shared/components/button/btn.directive';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { CardHeaderComponent } from '../../../shared/components/card/card-header.component';
import { CardBodyComponent } from '../../../shared/components/card/card-body.component';
import { JustificatifService } from '../services/justificatif.service';
import { Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { ActivatedRoute } from '@angular/router';
import { MissionService } from '../../missions/services/mission.service';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-upload-justificatifs',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    BtnDirective,
    HeaderComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    ConfirmationDialogComponent
  ],
  templateUrl: './upload-justificatifs.component.html',
  styleUrls: ['./upload-justificatifs.component.scss']
})
export class UploadJustificatifsComponent {
  files: File[] = [];
  loading = false;
  categories = ['Transport', 'Hébergement', 'Restauration', 'Communication', 'Autres'];
  meta: Record<string, { category: string; amount: number }> = {};
  missionId: string | number | undefined = undefined;
  missionBudget: number | undefined = undefined;
  showConfirm = false;
  uploadSuccess = false;
  uploadedJustificatifs: any[] = [];

  get totalAmount(): number {
    return this.files.reduce((sum, f) => sum + (this.meta[f.name]?.amount || 0), 0);
  }

  get overBudget(): boolean {
    if (this.missionBudget == null) return false;
    return this.totalAmount > this.missionBudget;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const added = Array.from(input.files);
      this.files = [...this.files, ...added];
      // init meta defaults
      added.forEach(f => {
        if (!this.meta[f.name]) this.meta[f.name] = { category: 'Autres', amount: 0 };
      });
      input.value = '';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files?.length) {
      const added = Array.from(event.dataTransfer.files);
      this.files = [...this.files, ...added];
      added.forEach(f => {
        if (!this.meta[f.name]) this.meta[f.name] = { category: 'Autres', amount: 0 };
      });
    }
  }

  removeFile(i: number): void {
    const removed = this.files[i];
    this.files.splice(i, 1);
    this.files = [...this.files];
    if (removed?.name && this.meta[removed.name]) {
      delete this.meta[removed.name];
    }
  }

  constructor(
    private justificatifService: JustificatifService,
    private router: Router,
    private toast: ToastService,
    private route: ActivatedRoute,
    private missionService: MissionService
  ) {
    const qId = this.route.snapshot.queryParamMap.get('missionId');
    if (qId) {
      this.missionId = qId;
      this.loadMissionBudget(qId);
    }
  }

  private loadMissionBudget(id: string | number) {
    this.missionService.getOne(id).subscribe({
      next: (mission: any) => {
        // suppose champ budget
        this.missionBudget = Number(mission?.budget ?? 0) || 0;
      },
      error: () => {
        this.missionBudget = undefined;
      }
    });
  }

  upload(): void {
    if (!this.files.length || this.loading) return;
    if (this.overBudget) {
      this.showConfirm = true;
      return;
    }
    this.proceedUpload();
  }

  onCancelConfirm() { this.showConfirm = false; }

  onConfirmUpload() {
    this.showConfirm = false;
    this.toast.warning('Le total dépasse le budget de la mission');
    this.proceedUpload();
  }

  private proceedUpload() {
    this.loading = true;
    const meta = this.files.map(f => ({ filename: f.name, category: this.meta[f.name]?.category || 'Autres', amount: Number(this.meta[f.name]?.amount || 0) }));
    this.justificatifService.upload(this.files, meta).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.uploadSuccess = true;
        // Stocker les justificatifs uploadés pour l'envoi au comptable
        this.uploadedJustificatifs = response?.data || [];
        this.toast.success('Justificatifs importés avec succès !');
        // Garder les fichiers affichés pour permettre l'envoi au comptable
      },
      error: () => {
        this.loading = false;
        this.toast.error("Une erreur est survenue lors de l'import.");
      }
    });
  }

  sendToComptable(): void {
    if (this.loading) return;
    this.loading = true;

    // Simuler l'envoi au comptable - en réalité, cela changerait le statut des justificatifs
    this.justificatifService.submitToComptable(this.uploadedJustificatifs).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success('Justificatifs envoyés au comptable avec succès !');
        this.router.navigate(['/justificatifs']);
      },
      error: () => {
        this.loading = false;
        this.toast.error('Erreur lors de l\'envoi au comptable.');
      }
    });
  }

  continueLater(): void {
    this.router.navigate(['/justificatifs']);
  }
}
