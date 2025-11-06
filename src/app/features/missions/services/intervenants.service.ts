import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class IntervenantsService {
  private api = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  list(missionId: string | number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/missions/${missionId}/intervenants`);
    
  }

  addBulk(missionId: string | number, items: Array<{ nom: string; prenom: string; role: string }>): Observable<any> {
    return this.http.post(`${this.api}/missions/${missionId}/intervenants/bulk`, { participants: items });
  }

  updateRole(missionId: string | number, userId: string | number, role: string): Observable<any> {
    return this.http.patch(`${this.api}/missions/${missionId}/intervenants/${userId}`, { role });
  }

  remove(missionId: string | number, userId: string | number): Observable<any> {
    return this.http.delete(`${this.api}/missions/${missionId}/intervenants/${userId}`);
  }
}
