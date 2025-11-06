import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

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
  access_token: string;
  refresh_token: string;
  user: User;
  expires_in: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  
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
      const u = this.getUserFromStorage();
      if (u) this.currentUserSubject.next(u);
      // Dev auto-login (only if enabled)
      if (!u && environment.devAutoLogin) {
        const devUser = environment.devUser as unknown as User;
        this.storeUser(devUser);
        // store a safe dev token
        this.storeTokens('dev', 'dev');
        this.currentUserSubject.next(devUser);
        // Redirect to dashboard if currently on auth
        try {
          const url = this.router.url || '';
          if (url.startsWith('/auth')) {
            this.router.navigate(['/dashboard']);
          }
        } catch {}
      }
    }
  }

  /**
   * Connexion utilisateur (mode mock pour développement)
   */
  login(identifiant: string, motDePasse: string): Observable<LoginResponse> {
    // Mode mock - simuler une connexion réussie
    return new Observable(observer => {
      // Simuler un délai réseau
      setTimeout(() => {
        // Créer un utilisateur mock basé sur l'identifiant
        const mockUsers: Record<string, User> = {
          'chef.agence.test': {
            id: '1',
            identifiant: 'chef.agence.test',
            nom: 'Chef',
            prenom: 'Agence',
            email: 'chef.agence@example.com',
            role: 'CHEF_AGENCE'
          },
          'agent.test': {
            id: '2',
            identifiant: 'agent.test',
            nom: 'Agent',
            prenom: 'Simple',
            email: 'agent@example.com',
            role: 'AGENT'
          },
          'dg.test': {
            id: '3',
            identifiant: 'dg.test',
            nom: 'Direction',
            prenom: 'Générale',
            email: 'dg@example.com',
            role: 'DG'
          },
          'rh.test': {
            id: '4',
            identifiant: 'rh.test',
            nom: 'Ressources',
            prenom: 'Humaines',
            email: 'rh@example.com',
            role: 'RH'
          },
          'comptable.test': {
            id: '5',
            identifiant: 'comptable.test',
            nom: 'Comptable',
            prenom: 'Principal',
            email: 'comptable@example.com',
            role: 'COMPTABLE'
          },
          'admin.test': {
            id: '6',
            identifiant: 'admin.test',
            nom: 'Administrateur',
            prenom: 'Système',
            email: 'admin@example.com',
            role: 'ADMIN'
          },
          'responsable.copec.test': {
            id: '7',
            identifiant: 'responsable.copec.test',
            nom: 'Directeur',
            prenom: 'Services',
            email: 'responsable.copec@example.com',
            role: 'RESPONSABLE_COPEC'
          }
        };

        const user = mockUsers[identifiant];
        
        if (user && motDePasse.length >= 6) {
          // Connexion réussie
          const response: LoginResponse = {
            access_token: 'mock_token_' + Date.now(),
            refresh_token: 'mock_refresh_' + Date.now(),
            user: user,
            expires_in: 3600
          };
          
          // Stocker les tokens et l'utilisateur
          this.storeTokens(response.access_token, response.refresh_token);
          this.storeUser(response.user);
          this.currentUserSubject.next(response.user);
          
          observer.next(response);
        } else {
          // Connexion échouée
          observer.error({
            status: 401,
            error: { message: 'Identifiant ou mot de passe incorrect' }
          });
        }
        
        observer.complete();
      }, 500); // Délai de 500ms pour simuler le réseau
    });
  }

  /**
   * Déconnexion
   */
  logout(): void {
    // Appeler l'API de déconnexion (optionnel)
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe();

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
  refreshToken(): Observable<{ access_token: string }> {
    const refreshToken = this.getRefreshToken();
    
    return this.http.post<{ access_token: string }>(`${this.apiUrl}/refresh`, {
      refresh_token: refreshToken
    }).pipe(
      tap(response => {
        this.storeTokens(response.access_token, refreshToken!);
      })
    );
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    // Vérifier si le token n'est pas expiré
    return !this.isTokenExpired(token);
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
    const user = this.getCurrentUser();
    return user ? user.role : null;
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
   * Obtenir le token d'accès
   */
  getAccessToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('access_token');
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
  }

  /**
   * Récupérer l'utilisateur du storage
   */
  private getUserFromStorage(): User | null {
    if (!this.isBrowser) return null;
    const userJson = localStorage.getItem('current_user');
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Vérifier si le token est expiré
   */
  private isTokenExpired(token: string): boolean {
    if (!this.isBrowser) return true;
    if (token === 'dev') return false;
    try {
      // Décoder le JWT (simple version sans library)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationDate = new Date(payload.exp * 1000);
      return expirationDate < new Date();
    } catch (error) {
      return true;
    }
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
}