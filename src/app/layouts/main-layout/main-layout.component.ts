import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService, User, UserRole } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  sidebarCollapsed = false;
  userMenuOpen = false;
  notificationsOpen = false;
  
  currentUser: User | null = null;
  pageTitle = 'Tableau de bord';
  
  // Compteurs
  unreadNotifications = 3;
  pendingValidations = 5;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Récupérer l'utilisateur courant
    this.currentUser = this.authService.getCurrentUser();
    
    // S'abonner aux changements d'utilisateur
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Mettre à jour le titre de la page selon la route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updatePageTitle();
      });

    // Charger les compteurs
    this.loadCounters();
    
    // Responsive: collapser automatiquement sur mobile
    if (window.innerWidth < 768) {
      this.sidebarCollapsed = true;
    }
  }

  /**
   * Toggle sidebar
   */
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  /**
   * Toggle user menu
   */
  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
    if (this.userMenuOpen) {
      this.notificationsOpen = false;
    }
  }

  /**
   * Toggle notifications
   */
  toggleNotifications(): void {
    this.notificationsOpen = !this.notificationsOpen;
    if (this.notificationsOpen) {
      this.userMenuOpen = false;
    }
  }

  /**
   * Fermer les menus si on clique ailleurs
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    if (!target.closest('.user-menu') && !target.closest('.notifications')) {
      this.userMenuOpen = false;
      this.notificationsOpen = false;
    }
  }

  /**
   * Responsive: gérer la taille de l'écran
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    if (event.target.innerWidth < 768) {
      this.sidebarCollapsed = true;
    }
  }

  /**
   * Mettre à jour le titre de la page selon la route
   */
  private updatePageTitle(): void {
    const url = this.router.url;
    
    if (url.includes('/dashboard')) {
      this.pageTitle = 'Tableau de bord';
    } else if (url.includes('/missions/create')) {
      this.pageTitle = 'Nouvelle Mission';
    } else if (url.includes('/missions')) {
      this.pageTitle = 'Mes Missions';
    } else if (url.includes('/validations')) {
      this.pageTitle = 'Validations';
    } else if (url.includes('/finance')) {
      this.pageTitle = 'Finance';
    } else if (url.includes('/justificatifs')) {
      this.pageTitle = 'Justificatifs';
    } else if (url.includes('/admin')) {
      this.pageTitle = 'Administration';
    } else if (url.includes('/profil')) {
      this.pageTitle = 'Mon Profil';
    } else {
      this.pageTitle = 'FUCEC Missions';
    }
  }

  /**
   * Charger les compteurs (notifications, validations en attente, etc.)
   */
  private loadCounters(): void {
    // TODO: Appeler l'API pour récupérer les vrais compteurs
    // Pour le moment, valeurs fictives
    this.unreadNotifications = 3;
    this.pendingValidations = 5;
  }

  /**
   * Vérifier si l'utilisateur peut valider
   */
  canValidate(): boolean {
    return this.authService.hasAnyRole([
      'CHEF_AGENCE' as UserRole,
      'RESPONSABLE_COPEC' as UserRole,
      'DG' as UserRole
    ]);
  }

  /**
   * Vérifier si l'utilisateur peut accéder aux finances
   */
  canAccessFinance(): boolean {
    return this.authService.hasAnyRole([
      'COMPTABLE' as UserRole,
      'DIRECTEUR_FINANCES' as UserRole,
      'RH' as UserRole,
      'DG' as UserRole
    ]);
  }

  /**
   * Vérifier si l'utilisateur est admin
   */
  isAdmin(): boolean {
    return this.authService.hasRole('ADMIN' as UserRole);
  }

  /**
   * Obtenir le label du rôle en français
   */
  getRoleLabel(role?: UserRole): string {
    if (!role) return '';
    
    const roleLabels: Record<UserRole, string> = {
      AGENT: 'Agent',
      CHEF_AGENCE: 'Chef d\'Agence',
      RESPONSABLE_COPEC: 'Responsable COPEC',
      DG: 'Directeur Général',
      RH: 'Ressources Humaines',
      COMPTABLE: 'Comptabilité',
      ADMIN: 'Administrateur'
    };
    
    return roleLabels[role] || role;
  }

  /**
   * Déconnexion
   */
  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout();
    }
  }
}