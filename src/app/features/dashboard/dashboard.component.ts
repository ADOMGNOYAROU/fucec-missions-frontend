import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService, User, UserRole } from '../../core/services/auth.service';
import { MissionService } from '../missions/services/mission.service';

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
      first_name: string;
      last_name: string;
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

  constructor(
    public authService: AuthService,
    private router: Router,
    private missionService: MissionService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  /**
   * Charger les données du dashboard
   */
  loadDashboardData(): void {
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
    this.missionService.getStats().subscribe({
      next: (response: any) => {
        this.stats = {
          totalMissions: response.total_missions || 0,
          enCours: response.en_cours || 0,
          enAttenteValidation: response.en_attente_validation || 0,
          budgetUtilise: response.budget_utilise || 0,
          justificatifsEnAttente: response.justificatifs_en_attente || 0
        };
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        // Garder les valeurs par défaut (0)
      }
    });
  }

  /**
   * Charger les missions récentes
   */
  private loadRecentMissions(): void {
    // Paramètres pour récupérer les missions récentes (limitées à 5)
    const params = {
      limit: 5,
      ordering: '-date_creation'  // Les plus récentes en premier
    };

    this.missionService.list(params).subscribe({
      next: (response: any) => {
        // Transformer les données API en format dashboard
        this.recentMissions = (response.results || response || []).map((mission: any) => ({
          id: mission.id,
          titre: mission.titre,
          dateDebut: new Date(mission.date_debut),
          lieuMission: mission.lieu_mission,
          statut: mission.statut
        }));
      },
      error: (error) => {
        console.error('Erreur lors du chargement des missions récentes:', error);
        this.recentMissions = [];
      }
    });
  }

  /**
   * Charger les validations en attente
   */
  private loadPendingValidations(): void {
    // Pour le moment, garder les données fictives car l'API de validations n'est pas encore implémentée
    // TODO: Remplacer par un vrai appel API quand l'endpoint sera disponible
    this.pendingValidations = [
      {
        id: '1',
        mission: {
          id: '1',
          titre: 'Formation développeurs',
          createur: {
            first_name: 'Jean',
            last_name: 'DUPONT'
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
            first_name: 'Marie',
            last_name: 'KOUASSI'
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

  /**
   * Test de navigation vers les missions
   */
  testNavigation(): void {
    console.log('Dashboard: Test navigation vers /missions');
    this.router.navigate(['/missions']).then(success => {
      console.log('Dashboard: Navigation réussie:', success);
    }).catch(error => {
      console.error('Dashboard: Erreur de navigation:', error);
    });
  }

  public isChefAgence(): boolean {
    return this.authService.hasRole(UserRole.CHEF_AGENCE);
  }

  public navigateToCreateMission(): void {
    if (this.isChefAgence()) {
      this.router.navigate(['/missions/create-order']);
    } else {
      this.router.navigate(['/missions/create']);
    }
  }
}