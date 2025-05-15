import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface GeolocationState {
  isTracking: boolean;
  position: GeolocationPosition | null;
  error: GeolocationPositionError | string | null;
  permissionStatus: PermissionState | null;
}

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  private watchId: number | null = null;
  private initialState: GeolocationState = {
    isTracking: false,
    position: null,
    error: null,
    permissionStatus: null
  };
  
  private geolocationState = new BehaviorSubject<GeolocationState>(this.initialState);
  
  constructor() {
    this.checkPermission();
  }
  
  get state$(): Observable<GeolocationState> {
    return this.geolocationState.asObservable();
  }
  
  get currentState(): GeolocationState {
    return this.geolocationState.getValue();
  }
  
  async checkPermission(): Promise<void> {
    if (!('geolocation' in navigator)) {
      this.updateState({
        error: 'Geolocation is not supported by this browser.',
        permissionStatus: 'denied'
      });
      return;
    }
    
    try {
      const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      this.updateState({ permissionStatus: status.state });
      
      status.addEventListener('change', () => {
        this.updateState({ permissionStatus: status.state });
      });
    } catch (error) {
      console.warn('Could not query permission status:', error);
    }
  }
  
  startTracking(): void {
    if (!('geolocation' in navigator)) {
      this.updateState({
        error: 'Geolocation is not supported by this browser.',
        isTracking: false
      });
      return;
    }
    
    this.updateState({ isTracking: true, error: null });
    
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.updateState({ position, error: null });
      },
      (error) => {
        this.updateState({ error, position: null });
      },
      { 
        enableHighAccuracy: true, 
        maximumAge: 10000, 
        timeout: 10000 
      }
    );
  }
  
  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    
    this.updateState({ isTracking: false });
  }
  
  getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject('Geolocation is not supported by this browser.');
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.updateState({ position, error: null });
          resolve(position);
        },
        (error) => {
          this.updateState({ error, position: null });
          reject(error);
        },
        { 
          enableHighAccuracy: true, 
          maximumAge: 0, 
          timeout: 10000 
        }
      );
    });
  }
  
  private updateState(newState: Partial<GeolocationState>): void {
    this.geolocationState.next({
      ...this.geolocationState.getValue(),
      ...newState
    });
  }
}