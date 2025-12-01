import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { Router } from '@angular/router';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';

// Interfaces
export interface User {
  id: string;
  identifiant: string;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  entite?: {
    id: string;
    nom: string;
    type: string;
  };
  telephone?: string;
  matricule?: string;
  // Ajout des propriétés pour la compatibilité avec Chauffeur
  immatriculation?: string;
  marque?: string;
  modele?: string;
  disponible?: boolean;
}

export type UserRole =
  | 'AGENT'
  | 'CHEF_AGENCE'
  | 'RESPONSABLE_COPEC'
  | 'DG'
  | 'RH'
  | 'COMPTABLE'
  | 'ADMIN'
  | 'DIRECTEUR_FINANCES'
  | 'CHAUFFEUR';

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
  expires_in?: number;
}

// Constantes
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const CURRENT_USER_KEY = 'current_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean;
  private jwtHelper = new JwtHelperService();
  private refreshTimeout: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    console.log('[Auth Service] Service initialisé', { isBrowser: this.isBrowser });
    
    // Ne pas essayer d'accéder au localStorage côté serveur
    if (this.isBrowser) {
      this.initializeFromLocalStorage();
    }
  }

  private initializeFromLocalStorage(): void {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      const user = localStorage.getItem(CURRENT_USER_KEY);
      
      if (token && user) {
        console.log('[Auth Service] Token et utilisateur trouvés au démarrage, restauration de la session');
        const userData = JSON.parse(user);
        this.currentUserSubject.next(userData);
        
        const decodedToken: any = this.jwtHelper.decodeToken(token);
        const expiresIn = decodedToken.exp ? (decodedToken.exp - Math.floor(Date.now() / 1000)) : 3600;
        
        if (expiresIn > 0) {
          this.setupTokenRefresh(expiresIn);
          console.log('[Auth Service] Session restaurée avec succès');
        } else {
          console.warn('[Auth Service] Token expiré, nettoyage nécessaire');
          this.cleanLocalStorage();
        }
      }
    } catch (error) {
      console.error('[Auth Service] Erreur lors de l\'initialisation depuis le localStorage', error);
      this.cleanLocalStorage();
    }
  }

  private cleanLocalStorage(): void {
    if (this.isBrowser) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }

  // Getters pour les tokens
  get accessToken(): string | null {
    console.log('[Auth Service] accessToken getter called');
    console.log('[Auth Service] isBrowser:', this.isBrowser);
    
    if (this.isBrowser) {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      console.log('[Auth Service] token from localStorage:', !!token);
      
      if (token) {
        console.log('[Auth Service] token preview:', token.substring(0, 20) + '...');
      }
      
      return token;
    }
    
    return null;
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Met à jour l'utilisateur actuel
   * @param userData Données de l'utilisateur (peut être un objet User ou des données brutes)
   */
  updateCurrentUser(userData: User | any | null): void {
    if (!userData) {
      this.currentUserSubject.next(null);
      if (this.isBrowser) {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
      return;
    }
    
    // Si c'est déjà un objet User, on le passe directement
    if ('id' in userData && 'identifiant' in userData && 'role' in userData) {
      this.currentUserSubject.next(userData as User);
      if (this.isBrowser) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
      }
      return;
    }
    
    // Sinon, on construit un objet User à partir des données brutes
    const user: User = {
      id: userData.user_id || userData.id || '',
      identifiant: userData.identifiant || userData.username || '',
      nom: userData.nom || userData.last_name || '',
      prenom: userData.prenom || userData.first_name || '',
      email: userData.email || '',
      role: (userData.role || 'USER') as UserRole,
      telephone: userData.telephone || userData.phone_number || '',
      matricule: userData.matricule || userData.employee_id || ''
    };

    if (this.isBrowser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
  }

  // Alias pour currentUserValue pour la compatibilité
  getCurrentUser(): User | null {
    return this.currentUserValue;
  }

  getToken(): string | null {
    return this.accessToken;
  }

  get refreshToken(): string | null {
    return this.isBrowser ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
  }

  // Vérifie si l'utilisateur est authentifié
  get isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  // Vérifie si l'utilisateur a un des rôles spécifiés
  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserValue;
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  }

  // Vérifie si l'utilisateur a un rôle spécifique
  hasRole(role: string): boolean {
    return this.hasAnyRole([role]);
  }

  // Déconnexion de l'utilisateur (alias pour compatibilité)
  logoutUser(): void {
    this.logout();
  }

  // Méthodes de gestion des tokens
  private storeTokens(accessToken: string, refreshToken: string): void {
    console.log('[Auth Service] storeTokens called');
    console.log('[Auth Service] isBrowser:', this.isBrowser);
    console.log('[Auth Service] accessToken length:', accessToken?.length);
    console.log('[Auth Service] refreshToken length:', refreshToken?.length);
    
    if (!this.isBrowser) {
      console.warn('[Auth Service] Not in browser, skipping token storage');
      return;
    }
    
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      console.log('[Auth Service] Tokens stored successfully');
      console.log('[Auth Service] Verification - Token in localStorage:', !!localStorage.getItem(ACCESS_TOKEN_KEY));
      this.updateHttpHeaders(accessToken);
    } catch (error) {
      console.error('Erreur lors du stockage des tokens:', error);
      this.cleanupAfterLogout();
      throw new Error('Impossible de stocker les informations de session');
    }
  }

  private updateHttpHeaders(token: string | null): void {
    // Implémentez la mise à jour des en-têtes HTTP si nécessaire
    // Par exemple, si vous utilisez un service HTTP personnalisé
  }

  private loadCurrentUser(): void {
    console.log('[Auth] Chargement des informations utilisateur');
    
    // Vérifier d'abord si on a un token
    if (!this.accessToken) {
      console.warn('[Auth] Aucun token disponible pour charger l\'utilisateur');
      return;
    }
    
    // Essayer de décoder le token pour les informations de base
    try {
      const token = this.accessToken;
      const decodedToken: any = this.jwtHelper.decodeToken(token);
      
      // Mettre à jour l'utilisateur avec les données du token
      if (decodedToken) {
        const user: User = {
          id: decodedToken.user_id || '',
          identifiant: decodedToken.username || '',
          nom: decodedToken.last_name || '',
          prenom: decodedToken.first_name || '',
          email: decodedToken.email || '',
          role: decodedToken.role || 'USER',
          telephone: decodedToken.phone || '',
          matricule: decodedToken.employee_id || ''
        };
        
        this.currentUserSubject.next(user);
        console.log('[Auth] Utilisateur chargé depuis le token');
        
        // Planifier le rafraîchissement du token
        const expiresIn = decodedToken.exp ? (decodedToken.exp - Math.floor(Date.now() / 1000)) : 3600;
        if (expiresIn > 0) {
          this.setupTokenRefresh(expiresIn);
        }
      }
      
      // En parallèle, essayer de récupérer les informations complètes de l'API
      // TEMPORAIREMENT DESACTIVE - API /users/me/ n'existe pas encore
      /*
      this.http.get<any>(`${this.apiUrl}/users/me/`).subscribe({
        next: (user) => {
          console.log('[Auth] Utilisateur chargé depuis l\'API');
          this.currentUserSubject.next(user);
          const expiresIn = this.jwtHelper.decodeToken(this.accessToken!).exp - Math.floor(Date.now() / 1000);
          if (expiresIn > 0) {
            this.setupTokenRefresh(expiresIn);
          }
        },
        error: (error) => {
          console.error('[Auth] Erreur lors du chargement utilisateur depuis l\'API:', error);
          // Ne pas déconnecter si l'API échoue, on garde les infos du token
        }
      });
      */
      
    } catch (error) {
      console.error('[Auth] Erreur lors du décodage du token:', error);
      // NE PAS appeler cleanupAfterLogout - le token est peut-être corrompu mais pas forcément absent
      console.warn('[Auth] Token invalide, ignorant le chargement utilisateur');
    }
  }

  isLoggedIn(): boolean {
    const token = this.accessToken;
    if (!token) return false;
    
    try {
      return !this.jwtHelper.isTokenExpired(token);
    } catch (e) {
      return false;
    }
  }

  /**
   * Connexion de l'utilisateur
   * @param identifiant Identifiant de l'utilisateur
   * @param password Mot de passe
   * @returns Observable avec la réponse de connexion
   */
  login(identifiant: string, password: string): Observable<LoginResponse> {
    console.log('[Auth Service] Tentative de connexion pour:', identifiant);
    
    const loginUrl = `${this.apiUrl}/users/auth/login/`;
    
    return this.http.post<LoginResponse>(loginUrl, {
      identifiant,
      password
    }).pipe(
      tap(response => {
        console.log('[Auth Service] Réponse de connexion reçue:', { 
          hasAccess: !!response.access, 
          hasRefresh: !!response.refresh,
          user: response.user 
        });
        
        if (response.access && response.refresh) {
          // Stocker les tokens
          this.storeTokens(response.access, response.refresh);
          
          // Mettre à jour l'utilisateur actuel
          if (response.user) {
            this.updateCurrentUser(response.user);
          }
          
          // Configurer le rafraîchissement automatique
          try {
            const decodedToken: any = this.jwtHelper.decodeToken(response.access);
            const expiresIn = decodedToken.exp ? (decodedToken.exp - Math.floor(Date.now() / 1000)) : 3600;
            if (expiresIn > 0) {
              this.setupTokenRefresh(expiresIn);
            }
          } catch (error) {
            console.error('[Auth Service] Erreur lors du décodage du token:', error);
          }
          
          console.log('[Auth Service] Connexion réussie pour:', identifiant);
        } else {
          console.error('[Auth Service] Réponse invalide: tokens manquants');
          throw new Error('Réponse de connexion invalide');
        }
      }),
      catchError(error => {
        console.error('[Auth Service] Erreur de connexion:', error);
        let errorMessage = 'Une erreur est survenue lors de la connexion';
        
        if (error.status === 400) {
          errorMessage = 'Identifiant ou mot de passe incorrect';
        } else if (error.status === 401) {
          errorMessage = 'Identifiant ou mot de passe incorrect';
        } else if (error.status === 0) {
          errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
        } else if (error.error?.detail) {
          errorMessage = error.error.detail;
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        return throwError(() => ({ message: errorMessage, error }));
      })
    );
  }

  logout(): void {
    console.log('[Auth Service] Déconnexion EXPLICITE de l\'utilisateur');
    
    // Forcer la suppression des tokens en premier
    if (this.isBrowser) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
    }
    
    // Envoyer une requête de déconnexion au backend (best effort)
    const refreshToken = this.refreshToken;
    if (refreshToken) {
      this.http.post(`${this.apiUrl}/users/auth/logout/`, {
        refresh_token: refreshToken
      }).subscribe({
        next: () => console.log('[Auth Service] Déconnexion backend réussie'),
        error: (error) => console.warn('[Auth Service] Erreur lors de la déconnexion backend:', error)
      });
    }
    
    // Nettoyer l'état local
    this.currentUserSubject.next(null);
    
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
    
    // Redirection vers la page de connexion
    this.router.navigate(['/login']);
  }

  /**
   * Nettoyage après déconnexion
   * NE DOIT ÊTRE APPELÉ QUE PAR logout() explicite
   */
  private cleanupAfterLogout(): void {
    console.log('[Auth] cleanupAfterLogout appelé');
    console.trace('[Auth] Stack trace pour cleanupAfterLogout');
    
    // VÉRIFICATION DE SÉCURITÉ RENFORCÉE
    if (this.isBrowser) {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      
      // Si on a des tokens valides, NE JAMAIS les supprimer
      if (token || refreshToken) {
        console.error('[Auth] ⚠️ SÉCURITÉ : cleanupAfterLogout appelé avec des tokens existants !');
        console.error('[Auth] Access Token:', !!token);
        console.error('[Auth] Refresh Token:', !!refreshToken);
        console.error('[Auth] Cette opération est ANNULÉE pour protéger la session utilisateur.');
        return; // STOP - ne pas continuer
      }
    }
    
    // Nettoyer SEULEMENT si vraiment pas de tokens
    console.log('[Auth] Nettoyage de la session (pas de tokens trouvés)');
    this.currentUserSubject.next(null);
    
    if (this.isBrowser) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
    }
    
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
    
    // Redirection seulement si nécessaire
    if (this.router.url !== '/login' && this.router.url !== '/auth/login') {
      this.router.navigate(['/login']);
    }
  }

  /**
   * Rafraîchir le token d'accès
   * @returns Observable avec le nouveau token d'accès
   */
  refreshAccessToken(): Observable<{ access: string }> {
    const refreshToken = this.refreshToken;
    
    if (!refreshToken) {
      console.warn('[Auth] Aucun refresh token disponible pour le rafraîchissement');
      // NE PAS appeler cleanupAfterLogout ici - laisser l'intercepteur gérer
      return throwError(() => new Error('Aucun refresh token disponible'));
    }

    // Vérifier si le refresh token est expiré
    if (this.jwtHelper.isTokenExpired(refreshToken)) {
      console.warn('[Auth] Le refresh token a expiré');
      // NE PAS appeler cleanupAfterLogout ici - laisser l'intercepteur gérer
      return throwError(() => new Error('La session a expiré, veuillez vous reconnecter'));
    }

    const refreshUrl = `${environment.apiUrl}/auth/token/refresh/`;
    console.log('[Auth] Tentative de rafraîchissement du token...');

    return this.http.post<{ access: string }>(refreshUrl, {
      refresh: refreshToken
    }).pipe(
      tap({
        next: (response) => {
          if (response?.access) {
            console.log('[Auth] Token rafraîchi avec succès');
            this.storeTokens(response.access, refreshToken);
            
            // Mettre à jour le timer d'expiration du token
            const tokenData = this.jwtHelper.decodeToken(response.access);
            const expiresIn = tokenData.exp - Math.floor(Date.now() / 1000);
            if (expiresIn > 0) {
              this.setupTokenRefresh(expiresIn);
            }
          }
        },
        error: (error) => {
          console.error('[Auth] Erreur lors du rafraîchissement du token:', error);
          // NE PAS appeler cleanupAfterLogout ici - laisser l'intercepteur ou le composant gérer
        }
      })
    );
  }

  /**
   * Récupérer l'utilisateur du storage
   */
  private getUserFromStorage(): User | null {
    if (!this.isBrowser) return null;
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Vérifie si le token est expiré
   */
  private isTokenExpired(token: string): boolean {
    if (!this.isBrowser) return true;

    try {
      return this.jwtHelper.isTokenExpired(token);
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      return true;
    }
  }

  /**
   * Obtenir le token d'accès depuis le stockage
   */
  private getAccessTokenFromStorage(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  /**
   * Récupérer le refresh token du stockage
   */
  private getRefreshTokenFromStorage(): string | null {
    return this.refreshToken;
  }


  /**
   * Stocker l'utilisateur dans le stockage
   */
  private storeUser(user: User): void {
    if (!this.isBrowser) return;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }

  /**
   * Vérifier l'état de l'authentification
   */
  checkAuthState(): void {
    if (!this.isBrowser) return;

    console.log('--- Etat de l\'authentification ---');
    console.log('Token d\'acces:', this.accessToken ? 'Present' : 'Absent');
    console.log('Utilisateur connecte:', this.getCurrentUser());
    console.log('Est connecte?:', this.isLoggedIn());
    console.log('URL actuelle:', this.router.url);
    console.log('----------------------------------');
  }

  /**
   * Changer le mot de passe
   */
  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, {
      old_password: oldPassword,
      new_password: newPassword
    });
  }

  /**
   * Demander la réinitialisation du mot de passe
   */
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  /**
   * Réinitialiser le mot de passe
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, {
      token,
      new_password: newPassword
    });
  }

  /**
   * Configure le rafraîchissement automatique du token JWT avant son expiration
   * @param expiresIn Durée de vie restante du token en secondes
   * @private
   */
  private setupTokenRefresh(expiresIn: number): void {
    if (!this.isBrowser) return;
    
    // Annuler tout timer existant pour éviter les doublons
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
    
    // Définir le moment du rafraîchissement (5 minutes avant expiration, avec un minimum de 30 secondes)
    const refreshTime = Math.max(expiresIn - 300, 30) * 1000; // Convertir en millisecondes
    
    console.log(`[Auth] Configuration du rafraîchissement automatique dans ${refreshTime / 1000} secondes`);
    
    // Planifier le rafraîchissement
    this.refreshTimeout = setTimeout(() => {
      console.log('[Auth] Tentative de rafraîchissement automatique du token...');
      this.refreshAccessToken().subscribe({
        next: () => {
          console.log('[Auth] Token rafraîchi avec succès');
        },
        error: (error) => {
          console.error('[Auth] Échec du rafraîchissement automatique:', error);
          // En cas d'erreur, déconnecter l'utilisateur
          this.logout();
        }
      });
    }, refreshTime);
  }
}
