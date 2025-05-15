import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserLocation, LocationHistory } from '../models/user-location.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = '/.netlify/functions/api';

  constructor(private http: HttpClient) { }

  saveLocation(locationData: UserLocation): Observable<UserLocation> {
    return this.http.post<UserLocation>(`${this.apiUrl}/locations`, locationData);
  }

  getLocationHistory(username: string): Observable<LocationHistory> {
    return this.http.get<LocationHistory>(`${this.apiUrl}/locations/${username}`);
  }

  checkUsername(username: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/users/check/${username}`);
  }
}