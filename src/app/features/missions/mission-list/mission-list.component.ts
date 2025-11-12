import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BtnDirective } from '../../../shared/components/button/btn.directive';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { MissionService } from '../services/mission.service';
import { AuthService, User, ValidationDecision } from '../../../core/services/auth.service';

interface Mission {
  id: number;
  titre: string;
  description: string;
  status: string;
  date_debut: string;
  date_fin: string;
  lieu_mission: string;
  budget_prevu: number;
  createur: {
    id: number;
    nom: string;
    prenom: string;
    get_full_name: string;
  };
  intervenants_count: number;
  duree: number;
}

@Component({
  selector: 'app-mission-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BtnDirective, LoaderComponent, BadgeComponent],
  templateUrl: './mission-list.component.html',
  styleUrls: ['./mission-list.component.scss']
})
export class MissionListComponent implements OnInit {
  loading = true;
  missions: Mission[] = [];
  filteredMissions: Mission[] = [];
  currentUser: User | null = null;
  
  // Filtres
  statusFilter = '';
  searchFilter = '';
  
  // Permissions
  canValidate = false;
  canCreate = false;
  isChefAgence = false;
  
  constructor(private missionService: MissionService, private authService: AuthService) {}

  ngOnInit(): void {
    console.log('MissionListComponent: Initialisation');
    this.currentUser = this.authService.getCurrentUser();
    this.initializePermissions();
    this.loadMissions();
  }

  initializePermissions(): void {
    if (!this.currentUser?.role) return;
    
    this.isChefAgence = this.currentUser.role === 'CHEF_AGENCE';
    this.canValidate = ['CHEF_AGENCE', 'RESPONSABLE_COPEC', 'DG'].includes(this.currentUser.role);
    this.canCreate = this.currentUser.role !== 'CHAUFFEUR';
    
    console.log('MissionListComponent: Permissions -', {
      isChefAgence: this.isChefAgence,
      canValidate: this.canValidate,
      canCreate: this.canCreate
    });
  }

  loadMissions(): void {
    console.log('MissionListComponent: Chargement des missions');
    this.loading = true;
    this.missionService.list().subscribe({
      next: (response: any) => {
        console.log('MissionListComponent: Missions reçues:', response);
        // Le backend retourne directement la liste des missions filtrée
        this.missions = response || [];

        this.applyFilters();
        console.log('MissionListComponent: Missions filtrées:', this.filteredMissions);
        this.loading = false;
      },
      error: (error) => {
        console.error('MissionListComponent: Erreur lors du chargement:', error);
        this.missions = [];
        this.filteredMissions = [];
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredMissions = this.missions.filter(mission => {
      const matchesStatus = !this.statusFilter || mission.status === this.statusFilter;
      const matchesSearch = !this.searchFilter ||
        mission.titre.toLowerCase().includes(this.searchFilter.toLowerCase()) ||
        mission.lieu_mission.toLowerCase().includes(this.searchFilter.toLowerCase()) ||
        mission.description.toLowerCase().includes(this.searchFilter.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onSearchFilterChange(): void {
    this.applyFilters();
  }

  validateMission(missionId: number, decision: ValidationDecision, commentaire?: string): void {
    if (!this.canValidate) return;

    let message = '';
    switch (decision) {
      case 'VISER':
        message = 'Voulez-vous viser cette mission ?';
        break;
      case 'VALIDER':
        message = 'Voulez-vous valider cette mission ?';
        break;
      case 'APPROUVER':
        message = 'Voulez-vous approuver définitivement cette mission ?';
        break;
      case 'REJETER':
        message = 'Voulez-vous rejeter cette mission ?';
        break;
      case 'REPORTER':
        message = 'Voulez-vous reporter cette mission ?';
        break;
      default:
        message = `Voulez-vous ${(decision as string).toLowerCase()} cette mission ?`;
    }

    if (confirm(message)) {
      console.log(`Validation de la mission ${missionId}: ${decision}`);

      this.missionService.validateMission(missionId, decision, commentaire).subscribe({
        next: (response) => {
          console.log('Mission traitée:', response);
          // Recharger la liste après validation
          this.loadMissions();
        },
        error: (error) => {
          console.error('Erreur lors du traitement:', error);
          alert('Erreur lors du traitement de la mission');
        }
      });
    }
  }

  getValidationActions(mission: Mission): { canValidate: boolean, canEdit: boolean, canView: boolean, availableActions: ValidationDecision[] } {
    const canValidate = this.canValidate && mission.status === 'EN_ATTENTE';
    const canEdit = this.canCreate && (this.isChefAgence || mission.status === 'BROUILLON');
    const canView = true; // Tout le monde peut voir les détails
    
    let availableActions: ValidationDecision[] = [];
    
    if (canValidate && this.currentUser?.role) {
      switch (this.currentUser.role) {
        case 'CHEF_AGENCE':
          // N+1 peut : VISER, REJETER, REPORTER
          availableActions = ['VISER', 'REJETER', 'REPORTER'];
          break;
        case 'RESPONSABLE_COPEC':
          // N+2 peut : VALIDER, REJETER, REPORTER  
          availableActions = ['VALIDER', 'REJETER', 'REPORTER'];
          break;
        case 'DG':
          // DGA/DG peut : APPROUVER, REJETER, REPORTER
          availableActions = ['APPROUVER', 'REJETER', 'REPORTER'];
          break;
        default:
          availableActions = [];
      }
    }
    
    return { canValidate, canEdit, canView, availableActions };
  }

  // Méthodes utilitaires pour les actions
  getActionVariant(action: ValidationDecision): 'primary' | 'secondary' | 'danger' | 'outline' {
    switch (action) {
      case 'VISER':
      case 'VALIDER':
      case 'APPROUVER':
        return 'primary';
      case 'REJETER':
        return 'danger';
      case 'REPORTER':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  getActionTitle(action: ValidationDecision): string {
    switch (action) {
      case 'VISER':
        return 'Viser cette mission';
      case 'VALIDER':
        return 'Valider cette mission';
      case 'APPROUVER':
        return 'Approuver définitivement cette mission';
      case 'REJETER':
        return 'Rejeter cette mission';
      case 'REPORTER':
        return 'Reporter cette mission';
      default:
        return action;
    }
  }

  getActionLabel(action: ValidationDecision): string {
    switch (action) {
      case 'VISER':
        return 'Viser';
      case 'VALIDER':
        return 'Valider';
      case 'APPROUVER':
        return 'Approuver';
      case 'REJETER':
        return 'Rejeter';
      case 'REPORTER':
        return 'Reporter';
      default:
        return action;
    }
  }

  getPageTitle(): string {
    return this.isChefAgence ? 'Gestion des Missions' : 'Mes Missions';
  }

  getCreateButtonText(): string {
    return 'Créer une Mission';
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
}
