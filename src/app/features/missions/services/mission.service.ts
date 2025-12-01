import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../../app/core/services/auth.service';

export interface Mission {
  id?: number;
  // Ajoutez ici les autres propriétés d'une mission
}

export interface Vehicule {
  id: string;
  immatriculation: string;
  marque: string;
  modele: string;
  disponible: boolean;
}

export interface Chauffeur {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class MissionService {
  private apiUrl = `${environment.apiUrl}/missions/`; // Correspond à /api/missions/


  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Récupère la liste des véhicules disponibles
   */
  getAllVehicles(): Observable<Vehicule[]> {
    return this.http.get<Vehicule[]>(`${environment.apiUrl}/vehicules/`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupère la liste des chauffeurs disponibles
   */
  getAllDrivers(): Observable<Chauffeur[]> {
    return this.http.get<Chauffeur[]>(`${environment.apiUrl}/chauffeurs/`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crée les en-têtes HTTP avec le token d'authentification
   */
  private getAuthHeaders() {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Gère les erreurs HTTP
   */
  private handleError(error: HttpErrorResponse) {
    if (error.status === 401) {
      // Déconnexion si non authentifié
      this.authService.logout();
    }
    return throwError(() => error);
  }

  /**
   * Récupère une mission par son ID
   * @param id L'identifiant de la mission (nombre ou chaîne)
   */
  getOne(id: string | number): Observable<Mission> {
    // Convertir en nombre si c'est une chaîne numérique
    const missionId = typeof id === 'string' ? parseInt(id, 10) : id;
    return this.http.get<Mission>(`${this.apiUrl}${missionId}/`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Liste les missions avec des filtres optionnels
   */
  list(params: any = {}): Observable<{count: number, results: Mission[]}> {
    let httpParams = new HttpParams();
    
    // Ajouter les paramètres de requête s'ils sont fournis
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.append(key, params[key].toString());
        }
      });
    }
    
    return this.http.get<{count: number, results: Mission[]}>(this.apiUrl, { 
      params: httpParams,
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Crée une nouvelle mission
   */
  create(missionData: Partial<Mission>): Observable<Mission> {
    return this.http.post<Mission>(this.apiUrl, missionData, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Met à jour une mission existante
   * @param id L'identifiant de la mission (nombre ou chaîne)
   * @param data Les données à mettre à jour
   */
  update(id: string | number, data: Partial<Mission>): Observable<Mission> {
    const missionId = typeof id === 'string' ? parseInt(id, 10) : id;
    return this.http.patch<Mission>(`${this.apiUrl}${missionId}/`, data, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Supprime une mission
   * @param id L'identifiant de la mission (nombre ou chaîne)
   */
  delete(id: string | number): Observable<void> {
    const missionId = typeof id === 'string' ? parseInt(id, 10) : id;
    return this.http.delete<void>(`${this.apiUrl}${missionId}/`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Soumet une mission pour validation
   * @param id L'identifiant de la mission (nombre ou chaîne)
   */
  submit(id: string | number): Observable<Mission> {
    const missionId = typeof id === 'string' ? parseInt(id, 10) : id;
    return this.http.post<Mission>(
      `${this.apiUrl}${missionId}/submit/`,
      {},
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Déclare le retour d'une mission
   * @param id L'identifiant de la mission (nombre ou chaîne)
   */
  declareReturn(id: string | number): Observable<Mission> {
    const missionId = typeof id === 'string' ? parseInt(id, 10) : id;
    return this.http.post<Mission>(
      `${this.apiUrl}${missionId}/declare-return/`,
      {},
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Soumet les justificatifs d'une mission
   * @param id L'identifiant de la mission (nombre ou chaîne)
   * @param justificatifs La liste des justificatifs à soumettre
   */
  submitJustificatifs(id: string | number, justificatifs: any[]): Observable<Mission> {
    const missionId = typeof id === 'string' ? parseInt(id, 10) : id;
    return this.http.post<Mission>(
      `${this.apiUrl}${missionId}/submit-justificatifs/`,
      { justificatifs },
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }
}
