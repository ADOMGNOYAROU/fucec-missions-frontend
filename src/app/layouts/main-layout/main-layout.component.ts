import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService, User, UserRole } from '../../core/services/auth.service';
import { ToastContainerComponent } from '../../core/components/toast-container/toast-container.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastContainerComponent],
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

  /**
   * Forcer le rechargement de l'utilisateur dev (pour le développement)
   * NE DOIT ÊTRE UTILISÉ QUE SI devAutoLogin EST ACTIVÉ
   */
  private forceDevReload(): void {
    // SEULEMENT si devAutoLogin est activé ET qu'on est dans le navigateur
    if (!environment.devAutoLogin || typeof window === 'undefined') {
      return; // Ne rien faire si pas en mode dev auto-login
    }
    
    // Vérifier si on a déjà un utilisateur réel connecté (avec un vrai token JWT)
    const existingToken = localStorage.getItem('access_token');
    if (existingToken && existingToken !== 'dev' && existingToken.startsWith('eyJ')) {
      console.log('[MainLayout] Utilisateur réel détecté, skip dev reload');
      return; // Ne pas écraser une vraie session utilisateur
    }
    
    // Seulement si pas d'utilisateur, charger l'utilisateur dev
    if (!this.authService.getCurrentUser()) {
      console.log('[MainLayout] Mode dev auto-login activé, chargement utilisateur dev');
      const devUser = environment.devUser as unknown as User;
      localStorage.setItem('current_user', JSON.stringify(devUser));
      localStorage.setItem('access_token', 'dev');
      localStorage.setItem('refresh_token', 'dev');
      this.authService.updateCurrentUser(devUser);
    }
  }

  ngOnInit(): void {
    // Forcer le rechargement de l'utilisateur dev (SEULEMENT si devAutoLogin est activé)
    this.forceDevReload();
    
    // Récupérer l'utilisateur courant
    this.currentUser = this.authService.getCurrentUser();
    
    // Mettre à jour l'utilisateur via l'observable
    if (this.currentUser) {
      this.authService.updateCurrentUser(this.currentUser);
    }
    
    console.log('=== DEBUG MAIN LAYOUT ===');
    console.log('Utilisateur actuel:', this.currentUser);
    console.log('Rôle actuel:', this.currentUser?.role);
    console.log('canValidate() called, result:', this.canValidate());
    console.log('canAccessFinance() called, result:', this.canAccessFinance());
    console.log('canAccessJustificatifs() called, result:', this.canAccessJustificatifs());
    console.log('isAdmin() called, result:', this.isAdmin());
    console.log('allStaffGuard should allow access for CHEF_AGENCE');
    console.log('Sidebar collapsed:', this.sidebarCollapsed);
    console.log('User menu open:', this.userMenuOpen);
    console.log('Notifications open:', this.notificationsOpen);
    console.log('========================');
    
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
   * Ferme la sidebar en mobile après un clic de navigation
   */
  onNavClick(): void {
    try {
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        this.sidebarCollapsed = true;
      }
    } catch {}
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
    } else if (url.includes('/chef-service/missions/create')) {
      this.pageTitle = 'Nouvelle Mission (Chef Service)';
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
    const result = this.authService.hasAnyRole([
      'CHEF_AGENCE' as UserRole,
      'RESPONSABLE_COPEC' as UserRole,
      'DG' as UserRole
    ]);
    console.log('canValidate() called, result:', result);
    return result;
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
   * Vérifier si l'utilisateur peut accéder aux justificatifs
   */
  canAccessJustificatifs(): boolean {
    return this.authService.hasAnyRole([
      'AGENT' as UserRole,
      'CHEF_AGENCE' as UserRole,
      'RESPONSABLE_COPEC' as UserRole,
      'DG' as UserRole,
      'RH' as UserRole,
      'COMPTABLE' as UserRole,
      'ADMIN' as UserRole
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
      COMPTABLE: 'Comptable',
      ADMIN: 'Administrateur',
      DIRECTEUR_FINANCES: 'Directeur des Finances',
      CHAUFFEUR: 'Chauffeur'
    };
    
    return roleLabels[role] || role;
  }

  /**
   * Gestionnaire d'erreur pour le logo
   */
  onLogoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    console.warn('Erreur de chargement du logo:', img.src);
    // Fallback: afficher les initiales FUCEC
    img.style.display = 'none';
    const fallback = document.createElement('div');
    fallback.textContent = 'FU';
    fallback.style.cssText = `
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 0.75rem;
    `;
    img.parentElement?.appendChild(fallback);
  }

  /**
   * Déconnexion de l'utilisateur
   */
  logout(): void {
    this.authService.logoutUser();
    this.router.navigate(['/login']);
  }
}