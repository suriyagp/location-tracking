import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usernameKey = 'gps_tracker_username';
  private usernameSubject = new BehaviorSubject<string | null>(null);
  
  username$: Observable<string | null> = this.usernameSubject.asObservable();
  
  constructor(private apiService: ApiService) {
    this.loadUsername();
  }
  
  private loadUsername(): void {
    const savedUsername = localStorage.getItem(this.usernameKey);
    if (savedUsername) {
      this.usernameSubject.next(savedUsername);
    }
  }
  
  saveUsername(username: string): void {
    localStorage.setItem(this.usernameKey, username);
    this.usernameSubject.next(username);
  }
  
  getUsername(): string | null {
    return this.usernameSubject.getValue();
  }
  
  clearUsername(): void {
    localStorage.removeItem(this.usernameKey);
    this.usernameSubject.next(null);
  }
  
  checkIfUsernameExists(username: string): Observable<{ exists: boolean }> {
    return this.apiService.checkUsername(username);
  }
}