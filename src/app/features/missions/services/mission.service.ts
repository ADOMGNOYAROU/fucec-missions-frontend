import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MissionService {

  private apiUrl = `${environment.apiUrl}/missions`;

  constructor(private http: HttpClient) { }

  getOne(id: string | number): Observable<any> {
    // Mode mock - retourner une mission fictive
    const mockMission = {
      id: id,
      title: `Mission ${id}`,
      description: 'Mission de formation et développement',
      status: 'EN_COURS',
      createdAt: '2025-01-15',
      creator: {
        id: 1,
        nom: 'Agent',
        prenom: 'Simple'
      },
      intervenants: [
        {
          id: 1,
          nom: 'Agent',
          prenom: 'Simple',
          role: 'AGENT'
        }
      ],
      justificatifs: [
        {
          id: 1,
          filename: 'Justificatif.pdf',
          category: 'Transport',
          amount: 150000
        }
      ]
    };

    return of(mockMission).pipe(delay(300));
  }

  list(params?: any): Observable<any> {
    // Mode mock - retourner une liste de missions fictives
    const mockMissions = {
      data: [
        {
          id: 1,
          title: 'Mission de formation',
          description: 'Formation sur Angular avancé',
          status: 'EN_ATTENTE',
          date: '2025-11-10',
          location: 'Lomé',
          amount: 250000,
          creator: {
            id: 1,
            nom: 'Agent',
            prenom: 'Test'
          }
        },
        {
          id: 2,
          title: 'Audit interne',
          description: 'Audit des procédures RH',
          status: 'VALIDEE',
          date: '2025-11-05',
          location: 'Kara',
          amount: 180000,
          creator: {
            id: 1,
            nom: 'Agent',
            prenom: 'Test'
          }
        },
        {
          id: 3,
          title: 'Réunion de coordination',
          description: 'Réunion avec les partenaires',
          status: 'EN_COURS',
          date: '2025-11-15',
          location: 'Sokodé',
          amount: 320000,
          creator: {
            id: 1,
            nom: 'Agent',
            prenom: 'Test'
          }
        }
      ],
      pagination: {
        total: 3,
        page: 1,
        limit: 10,
        totalPages: 1
      },
      total: 3
    };

    return of(mockMissions).pipe(delay(300));
  }

  create(data: any): Observable<any> {
    // Mode mock - simuler la création
    const mockResponse = {
      success: true,
      message: 'Mission créée avec succès',
      id: Date.now()
    };

    return of(mockResponse).pipe(delay(500));
  }

  update(id: string | number, data: any): Observable<any> {
    // Mode mock - simuler la mise à jour
    const mockResponse = {
      success: true,
      message: 'Mission mise à jour avec succès'
    };

    return of(mockResponse).pipe(delay(300));
  }

  delete(id: string | number): Observable<any> {
    // Mode mock - simuler la suppression
    const mockResponse = {
      success: true,
      message: 'Mission supprimée avec succès'
    };

    return of(mockResponse).pipe(delay(300));
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
