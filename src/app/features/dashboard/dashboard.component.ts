import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';

// Interfaces temporaires (en attendant les vrais services)
interface DashboardStats {
  totalMissions: number;
  enCours: number;
  enAttenteValidation: number;
  budgetUtilise: number;
  justificatifsEnAttente: number;
}

interface Mission {
  id: string;
  titre: string;
  dateDebut: Date;
  lieuMission: string;
  statut: string;
}

interface Validation {
  id: string;
  mission: {
    id: string;
    titre: string;
    createur: {
      prenom: string;
      nom: string;
    };
  };
  niveau: string;
  enRetard: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  
  stats: DashboardStats = {
    totalMissions: 0,
    enCours: 0,
    enAttenteValidation: 0,
    budgetUtilise: 0,
    justificatifsEnAttente: 0
  };

  recentMissions: Mission[] = [];
  pendingValidations: Validation[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  /**
   * Charger les données du dashboard
   */
  loadDashboardData(): void {
    // TODO: Remplacer par de vrais appels API
    this.loadStats();
    this.loadRecentMissions();
    
    if (this.canValidate()) {
      this.loadPendingValidations();
    }
  }

  /**
   * Charger les statistiques
   */
  private loadStats(): void {
    // Données fictives pour le moment
    this.stats = {
      totalMissions: 24,
      enCours: 5,
      enAttenteValidation: 3,
      budgetUtilise: 4750000,
      justificatifsEnAttente: 2
    };
  }

  /**
   * Charger les missions récentes
   */
  private loadRecentMissions(): void {
    // Données fictives
    this.recentMissions = [
      {
        id: '1',
        titre: 'Mission de formation à Kpalimé',
        dateDebut: new Date('2025-10-15'),
        lieuMission: 'Kpalimé',
        statut: 'IN_PROGRESS'
      },
      {
        id: '2',
        titre: 'Audit agence Atakpamé',
        dateDebut: new Date('2025-10-20'),
        lieuMission: 'Atakpamé',
        statut: 'EN_ATTENTE'
      },
      {
        id: '3',
        titre: 'Visite COPEC Plateaux',
        dateDebut: new Date('2025-10-25'),
        lieuMission: 'Plateaux',
        statut: 'VALIDEE'
      }
    ];
  }

  /**
   * Charger les validations en attente
   */
  private loadPendingValidations(): void {
    // Données fictives
    this.pendingValidations = [
      {
        id: '1',
        mission: {
          id: '1',
          titre: 'Formation développeurs',
          createur: {
            prenom: 'Jean',
            nom: 'DUPONT'
          }
        },
        niveau: 'N1',
        enRetard: false
      },
      {
        id: '2',
        mission: {
          id: '2',
          titre: 'Contrôle agence Sokodé',
          createur: {
            prenom: 'Marie',
            nom: 'KOUASSI'
          }
        },
        niveau: 'N2',
        enRetard: true
      }
    ];
  }

  /**
   * Vérifier si l'utilisateur peut valider
   */
  canValidate(): boolean {
    return this.authService.hasAnyRole([
      'CHEF_AGENCE' as any,
      'RESPONSABLE_COPEC' as any,
      'DG' as any
    ]);
  }

  /**
   * Obtenir le label du statut
   */
  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'BROUILLON': 'Brouillon',
      'EN_ATTENTE': 'En attente',
      'VALIDEE': 'Validée',
      'IN_PROGRESS': 'En cours',
      'CLOTUREE': 'Clôturée',
      'REJETEE': 'Rejetée',
      'ARCHIVEE': 'Archivée'
    };
    return labels[statut] || statut;
  }

  /**
   * Obtenir le label du niveau de validation
   */
  getNiveauLabel(niveau: string): string {
    const labels: Record<string, string> = {
      'N1': 'Chef d\'Agence',
      'N2': 'Responsable COPEC',
      'DG': 'Directeur Général',
      'caisse': 'caisse genérale'
    };
    return labels[niveau] || niveau;
  }

  /**
   * Valider une mission
   */
  validateMission(event: Event, validationId: string, decision: string): void {
    event.stopPropagation();
    event.preventDefault();

    const message = decision === 'VALIDEE' 
      ? 'Voulez-vous valider cette mission ?' 
      : 'Voulez-vous rejeter cette mission ?';

    if (confirm(message)) {
      // TODO: Appeler l'API pour valider/rejeter
      console.log(`Validation ${validationId}: ${decision}`);
      
      // Recharger les données
      this.loadPendingValidations();
      this.loadStats();
    }
  }
}