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
    // Mode mock - retourner une liste de missions fictives selon la hiérarchie
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
            id: 2,
            nom: 'Agent',
            prenom: 'Simple'
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
            id: 2,
            nom: 'Agent',
            prenom: 'Simple'
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
            nom: 'Chef',
            prenom: 'Agence'
          }
        },
        {
          id: 4,
          title: 'Mission commerciale',
          description: 'Développement commercial',
          status: 'BROUILLON',
          date: '2025-11-20',
          location: 'Dapaong',
          amount: 150000,
          creator: {
            id: 8,
            nom: 'Agent',
            prenom: 'Deuxième'
          }
        },
        {
          id: 5,
          title: 'Formation équipe',
          description: 'Formation en management',
          status: 'EN_ATTENTE',
          date: '2025-11-12',
          location: 'Lomé',
          amount: 400000,
          creator: {
            id: 9,
            nom: 'Chef',
            prenom: 'Service'
          }
        }
      ],
      pagination: {
        total: 5,
        page: 1,
        limit: 10,
        totalPages: 1
      },
      total: 5
    };

    // Simuler un délai réseau
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
}
