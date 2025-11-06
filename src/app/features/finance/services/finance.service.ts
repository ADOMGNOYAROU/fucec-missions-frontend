import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private baseUrl = `${environment.apiUrl}/${environment.apiVersion}`;

  constructor(private http: HttpClient) { }

  // Tickets
  getTickets(): Observable<any> {
    return this.http.get(`${this.baseUrl}/finance/tickets`);
  }

  validateTicket(id: number | string): Observable<any> {
    return this.http.post(`${this.baseUrl}/finance/tickets/${id}/validate`, {});
    }

  rejectTicket(id: number | string, motif?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/finance/tickets/${id}/reject`, { motif });
  }

  requestJustificatifs(ticketId: number | string): Observable<any> {
    return this.http.post(`${this.baseUrl}/finance/tickets/${ticketId}/request-justificatifs`, {});
  }

  // Avances
  getAvances(): Observable<any> {
    return this.http.get(`${this.baseUrl}/finance/avances`);
  }
}
