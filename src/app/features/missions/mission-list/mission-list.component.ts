import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BtnDirective } from '../../../shared/components/button/btn.directive';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { MissionService } from '../services/mission.service';
import { AuthService, UserRole } from '../../../core/services/auth.service';
import { MissionValidationDialogComponent, MissionDialogData } from '../mission-validation-dialog/mission-validation-dialog.component';
import { RejectReasonDialogComponent } from '../reject-reason-dialog/reject-reason-dialog.component';

interface Mission {
  id: number;
  title: string;
  status: string;
  date: string;
  location: string;
}

@Component({
  selector: 'app-mission-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    BtnDirective, 
    LoaderComponent, 
    BadgeComponent,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './mission-list.component.html',
  styleUrls: ['./mission-list.component.scss']
})
export class MissionListComponent implements OnInit {
  loading = true;
  missions: Mission[] = [];

  constructor(
    private missionService: MissionService, 
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMissions();
  }

  loadMissions(): void {
    this.loading = true;
    this.missionService.list().subscribe({
      next: (response: any) => {
        // Gérer différents formats de réponse
        if (Array.isArray(response)) {
          this.missions = response;
        } else if (response && Array.isArray(response.results)) {
          this.missions = response.results;
        } else if (response && Array.isArray(response.data)) {
          this.missions = response.data;
        } else {
          console.error('Format de réponse inattendu:', response);
          this.missions = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des missions:', error);
        this.missions = [];
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): 'BROUILLON' | 'EN_ATTENTE' | 'VALIDEE' | 'IN_PROGRESS' | 'CLOTUREE' | 'REJETEE' {
    switch(status) {
      case 'EN_ATTENTE': return 'EN_ATTENTE';
      case 'VALIDEE': return 'VALIDEE';
      case 'REJETEE': return 'REJETEE';
      case 'EN_COURS': return 'IN_PROGRESS';
      default: return 'BROUILLON';
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'EN_ATTENTE': 'En attente',
      'VALIDEE': 'Validée',
      'REJETEE': 'Rejetée',
      'EN_COURS': 'En cours'
    };
    return labels[status] || status;
  }

  canCreateMission(): boolean {
    const roles: UserRole[] = ['AGENT', 'CHEF_AGENCE', 'RESPONSABLE_COPEC', 'DG', 'ADMIN'];
    return this.authService.hasAnyRole(roles);
  }

  canSubmitMission(): boolean {
    const roles: UserRole[] = ['AGENT', 'CHEF_AGENCE'];
    return this.authService.hasAnyRole(roles);
  }

  openValidationDialog(mission: any, event: Event): void {
    event.preventDefault();
    
    if (!this.canSubmitMission()) {
      this.showError("Vous n'avez pas les droits pour effectuer cette action");
      return;
    }
    
    const dialogRef = this.dialog.open(MissionValidationDialogComponent, {
      width: '550px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true,
      panelClass: ['mission-dialog', 'mat-elevation-z8'],
      backdropClass: 'custom-dialog-backdrop',
      hasBackdrop: true,
      position: {},
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '200ms',
      data: { mission }
    });

    dialogRef.afterClosed().subscribe((result: { action: string, reason?: string } | undefined) => {
      if (!result) return;

      if (result.action === 'submit') {
        this.missionService.submitMission(mission.id).subscribe({
          next: () => {
            this.loadMissions();
            this.showSuccess('Mission soumise avec succès. Elle est maintenant en attente de validation.');
          },
          error: (error) => {
            console.error('Erreur lors de la soumission:', error);
            this.showError(error.error?.message || 'Erreur lors de la soumission de la mission');
          }
        });
      } else if (result.action === 'reject' && result.reason) {
        this.missionService.rejectMission(mission.id, result.reason).subscribe({
          next: () => {
            this.loadMissions();
            this.showSuccess('Mission rejetée avec succès');
          },
          error: (error) => {
            console.error('Erreur lors du rejet:', error);
            this.showError(error.error?.message || 'Erreur lors du rejet de la mission');
          }
        });
      }
    });
  }

  private openRejectDialog(mission: any): void {
    const dialogRef = this.dialog.open(RejectReasonDialogComponent, {
      width: '500px',
      data: { missionId: mission.id }
    });

    dialogRef.afterClosed().subscribe((result: { reason: string } | undefined) => {
      if (result?.reason) {
        this.missionService.rejectMission(mission.id, result.reason).subscribe({
          next: () => {
            this.loadMissions();
            this.showSuccess('Mission rejetée avec succès');
          },
          error: (error) => {
            console.error('Erreur lors du rejet:', error);
            this.showError(error.error?.message || 'Erreur lors du rejet de la mission');
          }
        });
      }
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['snackbar-success']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['snackbar-error']
    });
  }

  private validateMission(missionId: number, comment: string): void {
    // Implémentez ici l'appel au service pour valider la mission
    console.log(`Validation de la mission ${missionId} avec le commentaire: ${comment}`);
    // Exemple d'appel au service (à décommenter et adapter) :
    /*
    this.missionService.validateMission(missionId, comment).subscribe({
      next: () => {
        // Recharger la liste des missions après validation
        this.loadMissions();
        // Afficher un message de succès
        // this.snackBar.open('Mission validée avec succès', 'Fermer', { duration: 3000 });
      error: (error) => {
        console.error('Erreur lors de la validation de la mission', error);
        // Afficher un message d'erreur
        // this.snackBar.open('Erreur lors de la validation', 'Fermer', { duration: 3000 });
      }
    });
    */
  }
}
