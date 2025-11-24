import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

// Interfaces
export interface User {
  id: number;
  identifiant: string;
  first_name: string;
  last_name: string;
  prenom?: string;
  nom?: string;
  email: string;
  role: UserRole;
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
  access: string;
  refresh: string;
  user: User;
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
      const u = this.getUserFromStorage();
      if (u) this.currentUserSubject.next(u);
      // Dev auto-login (only if enabled)
      if (!u && environment.devAutoLogin) {
        const devUser = this.normalizeUser(environment.devUser as unknown as User);
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
   * Connexion utilisateur réelle via l'API Django
   */
  login(identifiant: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login/`, {
      identifiant,
      password,
    }).pipe(
      tap((response) => {
        this.storeTokens(response.access, response.refresh);
        const normalizedUser = this.normalizeUser(response.user);
        this.storeUser(normalizedUser);
        this.currentUserSubject.next(normalizedUser);
      })
    );
  }

  /**
   * Déconnexion
   */
  logout(): void {
    const refresh = this.getRefreshToken();

    if (refresh) {
      this.http
        .post(`${this.apiUrl}/auth/logout/`, { refresh_token: refresh })
        .subscribe({ error: () => {/* on ignore les erreurs de logout */} });
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
  refreshToken(): Observable<{ access: string }> | null {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    return this.http
      .post<{ access: string }>(`${this.apiUrl}/auth/refresh/`, {
        refresh: refreshToken,
      })
      .pipe(
        tap((response) => {
          this.storeTokens(response.access, refreshToken);
        })
      );
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isLoggedIn(): boolean {
    if (!this.isBrowser) return false;
    const token = this.getAccessToken();
    const user = this.getCurrentUser();
    return !!(token && user && !this.isTokenExpired(token));
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
  hasAnyRole(roles: (UserRole | string)[]): boolean {
    const userRole = this.getUserRole();
    if (!userRole) return false;
    
    // Convertir tous les rôles en chaînes pour la comparaison
    const normalizedUserRole = userRole.toString().toUpperCase();
    const normalizedRoles = roles.map(role => role.toString().toUpperCase());
    
    return normalizedRoles.includes(normalizedUserRole);
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
    return userJson ? this.normalizeUser(JSON.parse(userJson) as User) : null;
  }

  /**
   * Harmonise les champs nom/prénom issus du backend
   */
  private normalizeUser(user: User): User {
    return {
      ...user,
      prenom: user.prenom ?? user.first_name,
      nom: user.nom ?? user.last_name,
    };
  }

  /**
   * Vérifier si le token est expiré
   */
  private isTokenExpired(token: string): boolean {
    if (!this.isBrowser) return true;
    if (token === 'dev') return false;
    try {
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
    return this.http.post(`${this.apiUrl}/profile/change-password/`, {
      old_password: oldPassword,
      new_password: newPassword,
    });
  }

  /**
   * Demander la réinitialisation du mot de passe
   */
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/forgot-password/`, { email });
  }
}