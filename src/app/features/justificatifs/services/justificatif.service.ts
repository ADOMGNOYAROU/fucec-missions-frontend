import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class JustificatifService {
  private readonly baseUrl = '/api/justificatifs';

  constructor(private http: HttpClient) { }

  list(params?: { statut?: string; q?: string; page?: number; pageSize?: number }): Observable<any> {
    // Mode mock - retourner des données fictives
    const mockData = {
      data: [
        {
          id: 1,
          filename: 'Justificatif_mission_Lome.pdf',
          category: 'Transport',
          amount: 150000,
          status: 'APPROVED',
          createdAt: '2025-01-15',
          mission: {
            id: 1,
            title: 'Mission formation Lomé'
          }
        },
        {
          id: 2,
          filename: 'Note_de_frais_hotel.pdf',
          category: 'Hébergement',
          amount: 75000,
          status: 'PENDING',
          createdAt: '2025-01-14',
          mission: {
            id: 2,
            title: 'Audit agence Atakpamé'
          }
        },
        {
          id: 3,
          filename: 'Facture_restauration.pdf',
          category: 'Restauration',
          amount: 25000,
          status: 'APPROVED',
          createdAt: '2025-01-13',
          mission: {
            id: 1,
            title: 'Mission formation Lomé'
          }
        }
      ],
      total: 3,
      page: 1,
      pageSize: 10
    };

    return of(mockData).pipe(delay(500));
  }

  getOne(id: string | number): Observable<any> {
    // Mode mock - retourner un justificatif fictif
    const mockJustificatif = {
      id: id,
      filename: 'Justificatif_mission_Lome.pdf',
      category: 'Transport',
      amount: 150000,
      status: 'APPROVED',
      createdAt: '2025-01-15',
      mission: {
        id: 1,
        title: 'Mission formation Lomé'
      },
      fileUrl: '/api/justificatifs/1/download'
    };

    return of(mockJustificatif).pipe(delay(300));
  }

  upload(
    files: File[],
    meta?: Array<{ filename: string; category: string; amount: number }>
  ): Observable<any> {
    // Mode mock - simuler l'upload
    const mockResponse = {
      success: true,
      message: 'Justificatifs uploadés avec succès',
      uploaded: files.length
    };

    return of(mockResponse).pipe(delay(1000));
  }

  delete(id: string | number): Observable<any> {
    // Mode mock - simuler la suppression
    const mockResponse = {
      success: true,
      message: 'Justificatif supprimé avec succès'
    };

    return of(mockResponse).pipe(delay(300));
  }

  download(id: string | number): Observable<Blob> {
    // Utiliser l'API réelle pour le téléchargement
    return this.http.get(`${this.baseUrl}/${id}/download`, {
      responseType: 'blob'
    });
  }

  submitToComptable(justificatifs: any[]): Observable<any> {
    // API pour soumettre les justificatifs au comptable
    const payload = { justificatifs: justificatifs.map(j => j.id) };
    return this.http.post(`${this.baseUrl}/submit-to-comptable`, payload);
  }
}
