import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MissionService {

  constructor(private http: HttpClient) { }

  list(params?: any): Observable<any> {
    let url = `${environment.apiUrl}/missions/`;

    // Ajouter les paramètres de requête si fournis
    if (params) {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          queryParams.append(key, params[key]);
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return this.http.get(url);
  }

  create(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/missions/`, data);
  }

  update(id: string | number, data: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/missions/${id}/`, data);
  }

  delete(id: string | number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/missions/${id}/`);
  }

  getOne(id: string | number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/missions/${id}/`);
  }

  // Validation des missions
  validateMission(missionId: number, decision: 'VISER' | 'VALIDER' | 'APPROUVER' | 'REJETER' | 'REPORTER', commentaire?: string): Observable<any> {
    const endpoint = `${environment.apiUrl}/missions/${missionId}/validate/${decision}/`;
    const payload = commentaire ? { commentaire } : {};

    return this.http.post(endpoint, payload);
  }

  // Méthodes spécifiques pour chaque niveau
  viserMission(missionId: number, commentaire?: string): Observable<any> {
    return this.validateMission(missionId, 'VISER', commentaire);
  }

  validerMission(missionId: number, commentaire?: string): Observable<any> {
    return this.validateMission(missionId, 'VALIDER', commentaire);
  }

  approuverMission(missionId: number, commentaire?: string): Observable<any> {
    return this.validateMission(missionId, 'APPROUVER', commentaire);
  }

  rejeterMission(missionId: number, commentaire?: string): Observable<any> {
    return this.validateMission(missionId, 'REJETER', commentaire);
  }

  reporterMission(missionId: number, commentaire?: string): Observable<any> {
    return this.validateMission(missionId, 'REPORTER', commentaire);
  }

  // Justificatifs
  listJustificatifs(params?: any): Observable<any> {
    let url = `${environment.apiUrl}/missions/justificatifs/`;

    if (params) {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          queryParams.append(key, params[key]);
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return this.http.get(url);
  }

  createJustificatif(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/missions/justificatifs/`, data);
  }

  updateJustificatif(id: number, data: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/missions/justificatifs/${id}/`, data);
  }

  deleteJustificatif(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/missions/justificatifs/${id}/`);
  }

  validateJustificatif(justificatifId: number, decision: 'valider' | 'rejeter' | 'rembourser', commentaire?: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/missions/justificatifs/${justificatifId}/validate/${decision}/`, {
      commentaire: commentaire || ''
    });
  }

  // Statistiques
  getStats(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/missions/stats/`);
  }
}
