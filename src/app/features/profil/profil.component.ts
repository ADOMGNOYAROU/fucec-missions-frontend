import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService, User, UserRole } from '../../core/services/auth.service';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss']
})
export class ProfilComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('ProfilComponent - Utilisateur connecté:', this.currentUser);
    console.log('ProfilComponent - Rôle:', this.currentUser?.role);
    console.log('ProfilComponent - isAgent():', this.isAgent());
    console.log('ProfilComponent - canCreateMissions():', this.canCreateMissions());
  }

  navigateToMissions(): void {
    console.log('Navigation vers /missions');
    this.router.navigate(['/missions']).then(success => {
      console.log('Navigation réussie:', success);
    }).catch(error => {
      console.error('Erreur de navigation:', error);
    });
  }

  navigateToDashboard(): void {
    console.log('Navigation vers /dashboard');
    this.router.navigate(['/dashboard']).then(success => {
      console.log('Navigation réussie:', success);
    }).catch(error => {
      console.error('Erreur de navigation:', error);
    });
  }

  navigateToValidations(): void {
    console.log('Navigation vers /validations');
    this.router.navigate(['/validations']).then(success => {
      console.log('Navigation réussie:', success);
    }).catch(error => {
      console.error('Erreur de navigation:', error);
    });
  }

  navigateToCreateMission(): void {
    if (this.authService.hasRole('CHEF_AGENCE')) {
      console.log('Navigation vers /missions/create-order (Chef de Service)');
      this.router.navigate(['/missions/create-order']).then(success => {
        console.log('Navigation réussie:', success);
      }).catch(error => {
        console.error('Erreur de navigation:', error);
      });
    } else {
      console.log('Navigation vers /missions/create');
      this.router.navigate(['/missions/create']).then(success => {
        console.log('Navigation réussie:', success);
      }).catch(error => {
        console.error('Erreur de navigation:', error);
      });
    }
  }

  navigateToJustificatifs(): void {
    console.log('Navigation vers /justificatifs');
    this.router.navigate(['/justificatifs']).then(success => {
      console.log('Navigation réussie:', success);
    }).catch(error => {
      console.error('Erreur de navigation:', error);
    });
  }

  getRoleLabel(role?: UserRole | string): string {
    const labels: Record<string, string> = {
      ADMIN: 'Administrateur',
      VALIDATEUR: 'Validateur',
      FINANCE: 'Finance',
      DIRECTEUR_FINANCES: 'Finance',
      CHAUFFEUR: 'Chauffeur',
      AGENT: 'Agent',
      RH: 'Ressources Humaines',
      COMPTABLE: 'Comptable',
      DG: 'Directeur Général',
      CHEF_AGENCE: "Chef d'agence",
      RESPONSABLE_COPEC: 'Responsable COPEC',
    };
    const key = String(role ?? '');
    return labels[key] ?? 'Utilisateur';
  }

  canCreateMissions(): boolean {
    const result = this.currentUser?.role !== 'CHAUFFEUR';
    console.log('canCreateMissions() appelé pour rôle:', this.currentUser?.role, 'résultat:', result);
    return result;
  }

  canValidateMissions(): boolean {
    if (!this.currentUser?.role) return false;
    return ['CHEF_AGENCE', 'RESPONSABLE_COPEC', 'DG', 'RH'].includes(this.currentUser.role);
  }

  canAccessJustificatifs(): boolean {
    if (!this.currentUser?.role) return false;
    // Tous les utilisateurs connectés peuvent accéder aux justificatifs
    return true;
  }

  canAccessFinance(): boolean {
    if (!this.currentUser?.role) return false;
    return ['RH', 'COMPTABLE', 'DG', 'DIRECTEUR_FINANCES'].includes(this.currentUser.role);
  }

  isAgent(): boolean {
    return this.currentUser?.role === 'AGENT';
  }

  isChefAgence(): boolean {
    return this.currentUser?.role === 'CHEF_AGENCE';
  }
}
