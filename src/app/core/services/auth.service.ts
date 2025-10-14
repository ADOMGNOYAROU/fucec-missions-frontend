import { Injectable } from '@angular/core';
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
  | 'ADMIN';

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
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Connexion utilisateur
   */
  login(identifiant: string, motDePasse: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      identifiant,
      mot_de_passe: motDePasse
    }).pipe(
      tap(response => {
        // Stocker les tokens et l'utilisateur
        this.storeTokens(response.access_token, response.refresh_token);
        this.storeUser(response.user);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  /**
   * Déconnexion
   */
  logout(): void {
    // Appeler l'API de déconnexion (optionnel)
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe();

    // Nettoyer le localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
    
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
    return localStorage.getItem('access_token');
  }

  /**
   * Obtenir le refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Stocker les tokens
   */
  private storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  /**
   * Stocker l'utilisateur
   */
  private storeUser(user: User): void {
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  /**
   * Récupérer l'utilisateur du storage
   */
  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem('current_user');
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Vérifier si le token est expiré
   */
  private isTokenExpired(token: string): boolean {
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