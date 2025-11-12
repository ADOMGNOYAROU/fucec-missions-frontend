import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, of, map } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

// Interfaces
export interface User {
  id: string;
  identifiant: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  managerId?: string; // ID du supérieur hiérarchique
  entite?: {
    id: string;
    nom: string;
    type: string;
  };
  telephone?: string;
  matricule?: string;
  // Propriétés calculées du backend
  full_name?: string;
  can_validate?: boolean;
  can_create_missions?: boolean;
  // Autres champs du modèle
  date_joined?: string;
  is_active?: boolean;
}

// Enums et types
export enum UserRole {
  AGENT = 'AGENT',
  CHEF_AGENCE = 'CHEF_AGENCE',
  RESPONSABLE_COPEC = 'RESPONSABLE_COPEC',
  DG = 'DG',
  RH = 'RH',
  COMPTABLE = 'COMPTABLE',
  DIRECTEUR_FINANCES = 'DIRECTEUR_FINANCES',
  CHAUFFEUR = 'CHAUFFEUR',
  ADMIN = 'ADMIN'
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export type ValidationLevel = 
  | 'N_PLUS_1'    // Chef direct
  | 'N_PLUS_2'    // Chef du N+1  
  | 'DGA_DG';     // Direction Générale

export type ValidationDecision = 
  | 'VISER'       // Pour N+1
  | 'VALIDER'     // Pour N+2 et DGA/DG
  | 'APPROUVER'   // Pour DGA/DG final
  | 'REJETER'     // Rejet définitif
  | 'REPORTER';   // Reporter à plus tard

export interface Validation {
  id: string;
  mission: Mission;
  niveau: ValidationLevel;
  statut: 'EN_ATTENTE' | 'VALIDEE' | 'REJETEE' | 'REPORTEE';
  commentaire?: string;
  date_creation: string;
  date_validation?: string;
  valideur?: User;
  ordre: number;
}

export interface Mission {
  id: string;
  reference: string;
  titre: string;
  description?: string;
  type: string;
  statut: string;
  date_debut: string;
  date_fin: string;
  lieu_mission: string;
  budget_prevu: number;
  createur: User;
  intervenants: User[];
  validations: Validation[];
  date_creation: string;
  // Nouveaux champs pour le workflow
  ordre_mission_genere?: boolean;
  ordre_mission_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/users`;
  
  // BehaviorSubject pour suivre l'état de connexion
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    if (this.isBrowser) {
      console.log('🚀 AuthService: Constructor appelé - Initialisation du service d\'authentification');
      
      // Nettoyer les anciennes données de développement
      this.cleanOldDevData();
      
      // Toujours faire l'auto-connexion dev en développement si activée
      if (environment.devAutoLogin) {
        console.log('🚀 AuthService: Auto-connexion dev activée - Démarrage immédiat');
        // Faire l'auto-connexion immédiatement sans attendre
        this.devAutoLogin();
        console.log('✅ AuthService: Auto-connexion dev terminée dans constructor');
      } else {
        // Auto-connexion API automatique pour agent simple
        console.log('🚀 AuthService: Auto-connexion API activée');
        this.forceAutoLogin();
      }
    } else {
      console.log('🔧 AuthService: Mode SSR - pas d\'auto-connexion');
    }
  }

  /**
   * Nettoyer les anciennes données de développement
   */
  private cleanOldDevData(): void {
    if (!this.isBrowser) return;
    
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    // Si les tokens sont des tokens de développement ('dev'), les supprimer
    if (accessToken === 'dev' || refreshToken === 'dev') {
      console.log('🧹 AuthService: Nettoyage des anciens tokens de développement');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('current_user');
      this.currentUserSubject.next(null);
    }
  }

  /**
   * Auto-connexion API forcée (toujours exécutée)
   */
  private forceAutoLogin(): void {
    console.log('🔐 AuthService: Démarrage auto-connexion API forcée');

    if (!environment.autoLoginEnabled) {
      console.log('⚠️ AuthService: Auto-connexion API désactivée dans environment');
      return;
    }

    const credentials = environment.autoLoginCredentials;
    if (!credentials) {
      console.warn('⚠️ AuthService: Credentials d\'auto-connexion non configurés');
      return;
    }

    console.log(`🔐 AuthService: Tentative de connexion avec ${credentials.identifiant}`);

    // Faire la connexion API immédiatement
    this.login(credentials.identifiant, credentials.password).subscribe({
      next: (response) => {
        console.log('✅ AuthService: Auto-connexion API réussie');
        console.log('👤 AuthService: Utilisateur connecté:', response.user?.first_name, response.user?.last_name);
        console.log('🎭 AuthService: Rôle:', response.user?.role);
        console.log('🔑 AuthService: Tokens reçus - Access:', !!response.access, 'Refresh:', !!response.refresh);
      },
      error: (error) => {
        console.error('❌ AuthService: ÉCHEC AUTO-CONNEXION API:', error);
        console.error('❌ AuthService: Détails erreur:', error.message || error);
        console.error('❌ AuthService: Status:', error.status || 'Inconnu');
        console.error('❌ AuthService: URL:', error.url || 'Inconnue');

        // Afficher le body de l'erreur si disponible
        if (error.error) {
          console.error('❌ AuthService: Erreur body:', error.error);
        }

        // Essayer avec des credentials codés en dur pour debug
        console.log('🔧 AuthService: Tentative avec credentials codés en dur...');
        this.login('agent', 'test123').subscribe({
          next: (fallbackResponse) => {
            console.log('✅ AuthService: Connexion de fallback réussie');
          },
          error: (fallbackError) => {
            console.error('❌ AuthService: Échec même avec fallback:', fallbackError.message);
          }
        });
      }
    });
  }

  /**
   * Auto-connexion dev (simulation)
   */
  private devAutoLogin(): void {
    console.log('🔐 AuthService: Démarrage devAutoLogin');
    const devUserConfig = environment.devUser;
    if (!devUserConfig) {
      console.warn('⚠️ AuthService: devUser non configuré dans environment');
      return;
    }

    // Convertir la string role en UserRole enum
    const userRole = this.stringToUserRole(devUserConfig.role);
    if (!userRole) {
      console.error('❌ AuthService: Rôle invalide dans devUser:', devUserConfig.role);
      return;
    }

    // Créer l'objet User avec le bon type
    const devUser: User = {
      ...devUserConfig,
      role: userRole
    };

    console.log('🔐 AuthService: Auto-connexion dev pour:', devUser.first_name, devUser.last_name, devUser.role);

    // Stocker dans localStorage
    if (this.isBrowser) {
      localStorage.setItem('current_user', JSON.stringify(devUser));
      localStorage.setItem('access_token', 'dev');
      localStorage.setItem('refresh_token', 'dev');
    }

    // Mettre à jour le BehaviorSubject
    this.currentUserSubject.next(devUser);

    console.log('✅ AuthService: Auto-connexion dev réussie');
  }

  /**
   * Convertit une string en UserRole enum
   */
  private stringToUserRole(roleString: string): UserRole | null {
    const roleMap: { [key: string]: UserRole } = {
      'AGENT': UserRole.AGENT,
      'CHEF_AGENCE': UserRole.CHEF_AGENCE,
      'RESPONSABLE_COPEC': UserRole.RESPONSABLE_COPEC,
      'DG': UserRole.DG,
      'RH': UserRole.RH,
      'COMPTABLE': UserRole.COMPTABLE,
      'DIRECTEUR_FINANCES': UserRole.DIRECTEUR_FINANCES,
      'CHAUFFEUR': UserRole.CHAUFFEUR,
      'ADMIN': UserRole.ADMIN
    };

    return roleMap[roleString] || null;
  }

  /**
   * Auto-connexion automatique avec un agent simple
   */
  private autoLoginAgent(): Observable<boolean> {
    const credentials = environment.autoLoginCredentials;
    if (!credentials) {
      console.warn('⚠️ Auto-login activé mais pas de credentials configurés');
      return of(false);
    }

    console.log(`🔐 Tentative d'auto-connexion avec ${credentials.identifiant}`);

    return this.login(credentials.identifiant, credentials.password).pipe(
      map(() => true), // Connexion réussie
      catchError((error) => {
        console.error('❌ Auto-connexion échouée:', error.message);
        // Ne pas propager l'erreur, retourner simplement false
        return of(false);
      })
    );
  }

  /**
   * Connexion utilisateur via API backend
   */
  login(identifiant: string, motDePasse: string): Observable<LoginResponse> {
    const loginUrl = `${this.apiUrl}/auth/login/`;

    return this.http.post<LoginResponse>(loginUrl, {
      identifiant,
      password: motDePasse
    }).pipe(
      tap(response => {
        console.log('💾 AuthService: Login réussi, stockage des tokens...');

        if (this.isBrowser && response.access && response.refresh) {
          // Stocker les tokens dans localStorage
          localStorage.setItem('access_token', response.access);
          localStorage.setItem('refresh_token', response.refresh);
          localStorage.setItem('current_user', JSON.stringify(response.user));

          // Mettre à jour le BehaviorSubject
          this.currentUserSubject.next(response.user);

          // 💾 DEBUG: Confirmation du stockage
          console.log('💾 AuthService: Tokens stockés - Access:', response.access ? 'OUI' : 'NON', 'Refresh:', response.refresh ? 'OUI' : 'NON');
          console.log('👤 AuthService: Utilisateur connecté:', response.user.first_name, response.user.last_name);
        } else {
          console.error('❌ AuthService: Réponse de login invalide - tokens manquants');
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ AuthService: Erreur de connexion:', error);
        throw error;
      })
    );
  }

  /**
   * Déconnexion
   */
  logout(): void {
    // Appeler l'API de déconnexion avec le refresh token
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      this.http.post(`${this.apiUrl}/auth/logout/`, {
        refresh_token: refreshToken
      }).subscribe({
        next: () => console.log('✅ AuthService: Déconnexion côté serveur réussie'),
        error: (error) => console.warn('⚠️ AuthService: Erreur déconnexion côté serveur:', error)
      });
    }

    // Nettoyer le localStorage
    if (this.isBrowser) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('current_user');
    }

    // Réinitialiser le BehaviorSubject
    this.currentUserSubject.next(null);

    // Rediriger vers login
    this.router.navigate(['/auth/login']);
  }

  /**
   * Rafraîchir le token
   */
  refreshToken(): Observable<{ access: string }> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');
  
    return this.http.post<{ access: string }>(
      `${environment.apiUrl}/auth/token/refresh/`, 
      { refresh: refreshToken }
    ).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access);
      })
    );
  }

  /**
   * Vérifier si l'utilisateur est connecté (version améliorée)
   */
  isLoggedIn(): boolean {
    if (!this.isBrowser) {
      console.log('isLoggedIn: Pas en mode navigateur');
      return false;
    }

    // Vérifier d'abord la présence d'un utilisateur dans le BehaviorSubject
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      console.log('isLoggedIn: Aucun utilisateur dans BehaviorSubject');
      return false;
    }

    const token = localStorage.getItem('access_token');
    console.log('isLoggedIn - Token d\'accès présent:', !!token);

    if (!token) {
      console.log('isLoggedIn: Aucun token d\'accès trouvé');
      return false;
    }

    // Vérifier si le token est expiré avec une marge de sécurité
    const isExpired = this.isTokenExpired(token);
    console.log('isLoggedIn - Token expiré:', isExpired);

    if (isExpired) {
      console.log('isLoggedIn: Token expiré, nettoyage...');
      this.logout();
      return false;
    }

    console.log('isLoggedIn: Utilisateur connecté et token valide');
    return true;
  }

  /**
   * Obtenir l'utilisateur courant
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtenir le rôle de l'utilisateur
   */
  getUserRole(): UserRole | null {
    return this.currentUserSubject.value?.role || null;
  }

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  hasRole(role: UserRole): boolean {
    return this.getUserRole() === role;
  }

  /**
   * Vérifier si l'utilisateur a l'un des rôles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const userRole = this.getUserRole();
    return userRole ? roles.includes(userRole) : false;
  }

  /**
   * Obtenir les subordonnés directs d'un utilisateur
   */
  getSubordinates(userId?: string): Observable<User[]> {
    const targetUserId = userId || this.getCurrentUser()?.id;
    if (!targetUserId) return of([]);

    return this.http.get<User[]>(`${environment.apiUrl}/users/subordinates`);
  }

  /**
   * Obtenir le token d'accès
   */
  getAccessToken(): string | null {
    if (!this.isBrowser) return null;

    const token = localStorage.getItem('access_token');
    // 🔓 DEBUG: Token récupéré du localStorage
    console.log('🔓 AuthService: getAccessToken() - Token du localStorage:', token ? 'OUI' : 'NON');

    return token;
  }

  /**
   * Obtenir le refresh token
   */
  getRefreshToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('refresh_token');
  }

  /**
   * Stocker les tokens
   */
  private storeTokens(accessToken: string, refreshToken: string): void {
    if (!this.isBrowser) return;
    
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  /**
   * Stocker l'utilisateur
   */
  private storeUser(user: User): void {
    if (!this.isBrowser) return;
    
    localStorage.setItem('current_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Récupérer l'utilisateur du stockage
   */
  private getUserFromStorage(): User | null {
    if (!this.isBrowser) return null;
    
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Vérifier si le token est expiré
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp;
      return (Math.floor((new Date).getTime() / 1000)) >= expiry;
    } catch (e) {
      return true;
    }
  }

  /**
   * Obtenir le profil de l'utilisateur
   */
  getUserProfile(): Observable<any> {
    const role = this.getUserRole();
    if (!role) {
      return this.http.get(`${this.apiUrl}/users/me/`);
    }
    
    const endpointMap: Record<string, string> = {
      'AGENT': 'agents/me',
      'CHEF_AGENCE': 'chefs-agence/me',
      'RESPONSABLE_COPEC': 'responsables-copec/me',
      'DG': 'dg/me',
      'RH': 'rh/me',
      'COMPTABLE': 'comptables/me',
      'DIRECTEUR_FINANCES': 'directeurs-finances/me',
      'CHAUFFEUR': 'chauffeurs/me',
      'ADMIN': 'admins/me'
    };
  
    const endpoint = endpointMap[role] || 'users/me/';
    return this.http.get(`${this.apiUrl}/users/${endpoint}`);
  }
}