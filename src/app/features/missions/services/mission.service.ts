import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

interface MissionResponse {
  id: number;
  titre?: string;
  title?: string;
  statut?: string;
  status?: string;
  date_debut?: string;
  dateDebut?: string;
  lieu_mission?: string;
  lieuMission?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class MissionService {

  private apiUrl = `${environment.apiUrl}/missions/`;

  constructor(private http: HttpClient) { }

  getOne(id: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}${id}/`);
  }

  /**
   * Soumettre une mission pour validation
   * @param missionId ID de la mission à soumettre
   * @param comment Commentaire optionnel
   */
  /**
   * Soumettre une mission pour validation
   * @param missionId ID de la mission à soumettre
   * @param comment Commentaire optionnel
   */
  submitMission(missionId: string | number, comment: string = ''): Observable<any> {
    const url = `${this.apiUrl}${missionId}/submit/`;
    return this.http.post(url, { commentaire: comment }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erreur lors de la soumission de la mission:', error);
        let errorMessage = 'Erreur lors de la soumission de la mission';
        
        if (error.status === 403) {
          errorMessage = 'Vous n\'êtes pas autorisé à soumettre cette mission';
        } else if (error.status === 404) {
          errorMessage = 'Mission introuvable';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        throw new Error(errorMessage);
      })
    );
  }

  /**
   * Rejeter une mission
   * @param missionId ID de la mission à rejeter
   * @param reason Raison du rejet
   */
  /**
   * Rejeter une mission
   * @param missionId ID de la mission à rejeter
   * @param reason Raison du rejet
   */
  rejectMission(missionId: string | number, reason: string): Observable<any> {
    const url = `${this.apiUrl}${missionId}/reject/`;
    return this.http.post(url, { raison: reason }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erreur lors du rejet de la mission:', error);
        let errorMessage = 'Erreur lors du rejet de la mission';
        
        if (error.status === 403) {
          errorMessage = 'Vous n\'êtes pas autorisé à rejeter cette mission';
        } else if (error.status === 404) {
          errorMessage = 'Mission introuvable';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        throw new Error(errorMessage);
      })
    );
  }

  list(params?: any): Observable<Array<{id: number, title: string, status: string, date: string, location: string}>> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page);
      if (params.limit) httpParams = httpParams.set('limit', params.limit);
      if (params.q) httpParams = httpParams.set('q', params.q);
      if (params.status) httpParams = httpParams.set('status', params.status);
    }
    
    return this.http.get<MissionResponse[] | {results: MissionResponse[]} | {data: MissionResponse[]}>(this.apiUrl, { params: httpParams }).pipe(
      map((response: any) => {
        // Formater la réponse pour correspondre à ce que le composant attend
        const mapMission = (mission: MissionResponse) => ({
          id: mission.id,
          title: mission.titre || mission.title || 'Sans titre',
          status: mission.statut || mission.status || 'INCONNU',
          date: mission.date_debut || mission.dateDebut || new Date().toISOString(),
          location: mission.lieu_mission || mission.lieuMission || 'Non spécifié'
        });

        if (Array.isArray(response)) {
          return response.map(mapMission);
        } else if (response && Array.isArray(response.results)) {
          return response.results.map(mapMission);
        } else if (response && Array.isArray(response.data)) {
          return response.data.map(mapMission);
        }
        return [];
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Erreur lors de la récupération des missions:', error);
        return of([]);
      })
    );
  }

  create(data: any): Observable<any> {
    // Transformer les données pour correspondre à l'API backend
    const payload = {
      titre: data.titre || data.title,
      description: data.description,
      type: data.type || 'FORMATION',
      date_debut: data.dateDebut || data.date_debut,
      date_fin: data.dateFin || data.date_fin,
      lieu_mission: data.lieuMission || data.lieu_mission,
      budget_prevu: data.budgetEstime || data.budget_estime,
      intervenants: data.participants || [],
      objet_mission: data.objetMission || data.object_mission || data.description
    };

    return this.http.post(this.apiUrl, payload);
  }

  update(id: string | number, data: any): Observable<any> {
    // Transformer les données pour correspondre à l'API backend
    const payload = {
      titre: data.titre || data.title,
      description: data.description,
      type: data.type || 'FORMATION',
      date_debut: data.dateDebut || data.date_debut,
      date_fin: data.dateFin || data.date_fin,
      lieu_mission: data.lieuMission || data.lieu_mission,
      budget_prevu: data.budgetEstime || data.budget_estime,
      intervenants: data.participants || [],
      objet_mission: data.objetMission || data.object_mission || data.description
    };

    return this.http.put(`${this.apiUrl}${id}/`, payload);
  }

  delete(id: string | number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }

  // Nouvelles méthodes pour les actions spécifiques
  submit(id: string | number): Observable<any> {
    return this.http.post(`${this.apiUrl}${id}/submit/`, {});
  }

  validate(id: string | number, decision: string, commentaire?: string): Observable<any> {
    const payload = commentaire ? { commentaire } : {};
    return this.http.post(`${this.apiUrl}${id}/validate/${decision}/`, payload);
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}stats/`);
  }
}
