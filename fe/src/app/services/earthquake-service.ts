import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Earthquake } from '../models/earthquake.model';

@Injectable({
  providedIn: 'root',
})
export class EarthquakeService {
  private http = inject(HttpClient)
  private baseUrl = 'api/earthquakes';

  list(options?: { limit?: number; minMag?: number; hours?: number }): Observable<Earthquake[]> {
    let params = new HttpParams();

    if (options?.limit != null) params = params.set('limit', options.limit);
    if (options?.minMag != null) params = params.set('minMag', options.minMag);
    if (options?.hours != null) params = params.set('hours', options.hours);

    return this.http.get<Earthquake[]>(this.baseUrl, { params });
  }

  syncNow(): Observable<{ inserted: number; skipped: number; deleted_old: number }> {
    return this.http.post<{ inserted: number; skipped: number; deleted_old: number }>(
      `${this.baseUrl}/sync`,
      {},
      { withCredentials: true } // perché l’admin è autenticato via cookie
    );
  }

  
  
}
