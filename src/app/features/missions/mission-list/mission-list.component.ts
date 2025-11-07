import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BtnDirective } from '../../../shared/components/button/btn.directive';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { MissionService } from '../services/mission.service';
import { AuthService, User } from '../../../core/services/auth.service';

interface Mission {
  id: number;
  title: string;
  status: string;
  date: string;
  location: string;
  creator?: {
    prenom: string;
    nom: string;
  };
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
        const allMissions = response?.data || [];
        
        // Filtrer les missions selon la hiérarchie
        this.missions = this.filterMissionsByHierarchy(allMissions);
        
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

  /**
   * Filtrer les missions selon la hiérarchie organisationnelle
   * Un chef de service voit ses propres missions + celles de ses subordonnés (N-1)
   */
  filterMissionsByHierarchy(allMissions: any[]): any[] {
    if (!this.currentUser) return allMissions;

    // Si c'est un admin ou DG, voir toutes les missions
    if (['ADMIN', 'DG', 'RH', 'COMPTABLE'].includes(this.currentUser.role)) {
      return allMissions;
    }

    // Si c'est un chef de service, voir ses missions + celles de ses subordonnés
    if (this.currentUser.role === 'CHEF_AGENCE') {
      const subordinates = this.authService.getSubordinates(this.currentUser.id);
      const subordinateIds = subordinates.map(sub => sub.id);
      
      return allMissions.filter(mission => 
        mission.creator?.id === this.currentUser!.id || // Ses propres missions
        subordinateIds.includes(mission.creator?.id) // Missions de ses subordonnés
      );
    }

    // Si c'est un agent simple, voir seulement ses propres missions
    if (this.currentUser.role === 'AGENT') {
      return allMissions.filter(mission => mission.creator?.id === this.currentUser!.id);
    }

    // Par défaut, retourner toutes les missions
    return allMissions;
  }

  applyFilters(): void {
    this.filteredMissions = this.missions.filter(mission => {
      const matchesStatus = !this.statusFilter || mission.status === this.statusFilter;
      const matchesSearch = !this.searchFilter || 
        mission.title.toLowerCase().includes(this.searchFilter.toLowerCase()) ||
        mission.location.toLowerCase().includes(this.searchFilter.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onSearchFilterChange(): void {
    this.applyFilters();
  }

  validateMission(missionId: number, decision: 'VALIDEE' | 'REJETEE'): void {
    if (!this.canValidate) return;

    const message = decision === 'VALIDEE' 
      ? 'Voulez-vous valider cette mission ?' 
      : 'Voulez-vous rejeter cette mission ?';

    if (confirm(message)) {
      console.log(`Validation de la mission ${missionId}: ${decision}`);
      // TODO: Appeler l'API de validation
      // Recharger la liste après validation
      this.loadMissions();
    }
  }

  getValidationActions(mission: Mission): { canValidate: boolean, canEdit: boolean, canView: boolean } {
    const canValidate = this.canValidate && mission.status === 'EN_ATTENTE';
    const canEdit = this.canCreate && (this.isChefAgence || mission.status === 'BROUILLON');
    const canView = true; // Tout le monde peut voir les détails
    
    return { canValidate, canEdit, canView };
  }

  getPageTitle(): string {
    return this.isChefAgence ? 'Gestion des Missions' : 'Mes Missions';
  }

  getCreateButtonText(): string {
    return 'Créer une Mission';
  }

  // Getters pour les statistiques
  get totalMissions(): number {
    return this.missions.length;
  }

  get missionsEnAttente(): number {
    return this.missions.filter(m => m.status === 'EN_ATTENTE').length;
  }

  get missionsValidees(): number {
    return this.missions.filter(m => m.status === 'VALIDEE').length;
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
