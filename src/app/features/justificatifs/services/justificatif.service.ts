import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JustificatifService {
  private readonly baseUrl = '/api/justificatifs';

  constructor(private http: HttpClient) { }

  list(params?: { statut?: string; q?: string; page?: number; pageSize?: number }): Observable<any> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.statut) httpParams = httpParams.set('statut', params.statut);
      if (params.q) httpParams = httpParams.set('q', params.q);
      if (params.page) httpParams = httpParams.set('page', params.page);
      if (params.pageSize) httpParams = httpParams.set('page_size', params.pageSize);
    }
    
    return this.http.get(this.baseUrl, { params: httpParams });
  }

  getOne(id: string | number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  upload(
    files: File[],
    meta?: Array<{ filename: string; category: string; amount: number }>
  ): Observable<any> {
    const formData = new FormData();
    
    // Ajouter les fichiers
    files.forEach((file, index) => {
      formData.append('files', file);
    });
    
    // Ajouter les métadonnées si fournies
    if (meta && meta.length > 0) {
      formData.append('meta', JSON.stringify(meta));
    }
    
    return this.http.post(`${this.baseUrl}/upload`, formData);
  }

  delete(id: string | number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
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
