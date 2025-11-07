import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { delay } from 'rxjs/operators';

export interface ValidationItem {
  id: string | number;
  missionId: string | number;
  missionTitle: string;
  level: string; // N1, N2, DG
  creatorName: string;
  status: 'EN_ATTENTE' | 'VALIDEE' | 'REJETEE';
  createdAt: string;
  currentValidator: string;
  nextValidator?: string;
  urgent?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ValidationsService {
  private api = `${environment.apiUrl}`;
  constructor(private http: HttpClient) {}

  listMyValidations(params?: { role?: string }): Observable<ValidationItem[]> {
    // Mode mock - retourner des données selon le rôle
    if (typeof window === 'undefined') {
      return of([]).pipe(delay(300));
    }
    
    const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
    const userRole = currentUser.role;

    let mockData: ValidationItem[] = [];

    // Données mockées selon le workflow FUCEC
    if (userRole === 'CHEF_AGENCE') {
      // N+1 voit les missions des agents à valider
      mockData = [
        {
          id: 1,
          missionId: 101,
          missionTitle: 'Mission formation React',
          level: 'N1',
          creatorName: 'Agent Simple',
          status: 'EN_ATTENTE',
          createdAt: '2025-01-15',
          currentValidator: 'Chef Agence',
          nextValidator: 'Directeur des Services'
        },
        {
          id: 2,
          missionId: 102,
          missionTitle: 'Mission audit qualité',
          level: 'N1',
          creatorName: 'Agent Simple',
          status: 'EN_ATTENTE',
          createdAt: '2025-01-14',
          currentValidator: 'Chef Agence',
          nextValidator: 'Directeur des Services',
          urgent: true
        }
      ];
    } else if (userRole === 'RESPONSABLE_COPEC') {
      // DS voit les missions validées par N+1 (N2) ET peut aussi voir les N1 comme le Chef d'Agence
      mockData = [
        // Validations N1 (mêmes que Chef d'Agence)
        {
          id: 1,
          missionId: 101,
          missionTitle: 'Mission formation React',
          level: 'N1',
          creatorName: 'Agent Simple',
          status: 'EN_ATTENTE',
          createdAt: '2025-01-15',
          currentValidator: 'Chef Agence',
          nextValidator: 'Directeur des Services'
        },
        {
          id: 2,
          missionId: 102,
          missionTitle: 'Mission audit qualité',
          level: 'N1',
          creatorName: 'Agent Simple',
          status: 'EN_ATTENTE',
          createdAt: '2025-01-14',
          currentValidator: 'Chef Agence',
          nextValidator: 'Directeur des Services'
        },
        // Validations N2 (missions validées par N+1)
        {
          id: 3,
          missionId: 103,
          missionTitle: 'Mission formation Angular',
          level: 'N2',
          creatorName: 'Agent Simple',
          status: 'EN_ATTENTE',
          createdAt: '2025-01-15',
          currentValidator: 'Directeur des Services',
          nextValidator: 'Directeur Général'
        }
      ];
    } else if (userRole === 'DG') {
      // DG voit les missions validées par DS
      mockData = [
        {
          id: 4,
          missionId: 101,
          missionTitle: 'Mission formation React',
          level: 'DG',
          creatorName: 'Agent Simple',
          status: 'EN_ATTENTE',
          createdAt: '2025-01-15',
          currentValidator: 'Directeur Général',
          nextValidator: 'Ordre de mission'
        }
      ];
    }

    return of(mockData).pipe(delay(300));
  }

  getOne(id: string | number): Observable<any> {
    // Mode mock - retourner des détails de validation
    const mockDetails = {
      id: id,
      missionId: 101,
      missionTitle: 'Mission formation React',
      description: 'Formation en développement React pour l\'équipe technique',
      creator: {
        name: 'Agent Simple',
        role: 'AGENT',
        department: 'Informatique'
      },
      currentLevel: 'N1',
      workflow: [
        { level: 'N1', validator: 'Chef Agence', status: 'EN_ATTENTE', date: null },
        { level: 'N2', validator: 'Directeur des Services', status: 'PENDING', date: null },
        { level: 'DG', validator: 'Directeur Général', status: 'PENDING', date: null },
        { level: 'APPROVED', validator: 'Système', status: 'PENDING', date: null }
      ],
      documents: [
        { name: 'Demande de mission.pdf', type: 'PDF', size: '2.1 MB' },
        { name: 'Justificatif formation.pdf', type: 'PDF', size: '1.8 MB' }
      ]
    };

    return of(mockDetails).pipe(delay(200));
  }

  approve(id: string | number): Observable<any> {
    // Mode mock - simuler l'approbation
    const mockResponse = {
      success: true,
      message: 'Validation approuvée avec succès',
      nextStep: 'Mission transmise au niveau suivant'
    };

    return of(mockResponse).pipe(delay(500));
  }

  reject(id: string | number, reason?: string): Observable<any> {
    // Mode mock - simuler le rejet
    const mockResponse = {
      success: true,
      message: 'Validation rejetée',
      reason: reason || 'Motif non spécifié'
    };

    return of(mockResponse).pipe(delay(500));
  }
}
