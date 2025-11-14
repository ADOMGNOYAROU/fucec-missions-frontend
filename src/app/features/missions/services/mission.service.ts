import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MissionService {

  private apiUrl = `${environment.apiUrl}/missions`;

  constructor(private http: HttpClient) { }

  getOne(id: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  list(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page);
      if (params.limit) httpParams = httpParams.set('limit', params.limit);
      if (params.q) httpParams = httpParams.set('q', params.q);
      if (params.status) httpParams = httpParams.set('status', params.status);
    }
    
    return this.http.get(this.apiUrl, { params: httpParams });
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

    return this.http.put(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string | number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Nouvelles méthodes pour les actions spécifiques
  submit(id: string | number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/submit/`, {});
  }

  validate(id: string | number, decision: string, commentaire?: string): Observable<any> {
    const payload = commentaire ? { commentaire } : {};
    return this.http.post(`${this.apiUrl}/${id}/validate/${decision}/`, payload);
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/`);
  }
}
