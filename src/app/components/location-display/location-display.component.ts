import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { GeolocationService } from '../../services/geolocation.service';
import { ApiService } from '../../services/api.service';
import { UserLocation } from '../../models/user-location.model';

@Component({
  selector: 'app-location-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="location-container">
      <div class="card location-card">
        <div class="location-header">
          <h2>Your Location</h2>
          <div class="status-indicator" [class.active]="geoState.isTracking">
            {{ geoState.isTracking ? 'Tracking' : 'Not Tracking' }}
          </div>
        </div>
        
        <div *ngIf="!geoState.position && !geoState.error" class="placeholder-content">
          <p>Waiting for location data...</p>
          <div class="spinner"></div>
        </div>
        
        <div *ngIf="geoState.error" class="error-content">
          <p class="error-message">{{ getErrorMessage() }}</p>
          <button class="btn-primary" (click)="requestPermission()">
            Enable Location
          </button>
        </div>
        
        <div *ngIf="geoState.position" class="location-content fade-in">
          <div class="coordinates">
            <div class="coordinate">
              <span class="label">Latitude</span>
              <span class="value">{{ formatCoordinate(geoState.position.coords.latitude) }}</span>
            </div>
            <div class="coordinate">
              <span class="label">Longitude</span>
              <span class="value">{{ formatCoordinate(geoState.position.coords.longitude) }}</span>
            </div>
          </div>
          
          <div class="additional-info">
            <div class="info-item">
              <span class="label">Accuracy</span>
              <span class="value">{{ geoState.position.coords.accuracy.toFixed(2) }} m</span>
            </div>
            <div class="info-item" *ngIf="geoState.position.coords.altitude !== null">
              <span class="label">Altitude</span>
              <span class="value">{{ geoState.position.coords.altitude.toFixed(2) }} m</span>
            </div>
            <div class="info-item" *ngIf="geoState.position.coords.speed !== null">
              <span class="label">Speed</span>
              <span class="value">{{ geoState.position.coords.speed.toFixed(2) }} m/s</span>
            </div>
            <div class="info-item">
              <span class="label">Last Updated</span>
              <span class="value">{{ formatDate(geoState.position.timestamp) }}</span>
            </div>
          </div>
        </div>
        
        <div class="actions">
          <button 
            class="btn-primary" 
            (click)="toggleTracking()"
            [disabled]="geoState.permissionStatus === 'denied'">
            {{ geoState.isTracking ? 'Stop Tracking' : 'Start Tracking' }}
          </button>
          
          <button 
            class="btn-accent" 
            (click)="refreshLocation()"
            [disabled]="geoState.permissionStatus === 'denied'">
            Refresh
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .location-container {
      width: 100%;
    }
    
    .location-card {
      width: 100%;
    }
    
    .location-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-4);
    }
    
    .status-indicator {
      font-size: 0.875rem;
      padding: var(--space-1) var(--space-2);
      border-radius: 12px;
      background-color: var(--neutral-200);
      color: var(--neutral-600);
    }
    
    .status-indicator.active {
      background-color: var(--accent-light);
      color: white;
    }
    
    .placeholder-content, .error-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 150px;
      text-align: center;
      color: var(--neutral-500);
    }
    
    .error-message {
      color: var(--warning);
      margin-bottom: var(--space-3);
    }
    
    .location-content {
      margin-bottom: var(--space-4);
    }
    
    .coordinates {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--space-4);
    }
    
    .coordinate {
      display: flex;
      flex-direction: column;
      width: 48%;
    }
    
    .additional-info {
      background-color: var(--neutral-100);
      border-radius: 8px;
      padding: var(--space-3);
    }
    
    .info-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--space-2);
    }
    
    .info-item:last-child {
      margin-bottom: 0;
    }
    
    .label {
      color: var(--neutral-600);
      font-size: 0.875rem;
    }
    
    .value {
      font-weight: 500;
    }
    
    .actions {
      display: flex;
      justify-content: space-between;
      margin-top: var(--space-4);
    }
    
    .actions button {
      width: 48%;
    }
    `
  ]
})
export class LocationDisplayComponent implements OnInit, OnDestroy {
  @Input() username!: string;
  
  geoState: {
    isTracking: boolean;
    position: GeolocationPosition | null;
    error: GeolocationPositionError | string | null;
    permissionStatus: PermissionState | null;
  } = {
    isTracking: false,
    position: null,
    error: null,
    permissionStatus: null
  };
  
  private subscription = new Subscription();
  private saveInterval: any;
  
  constructor(
    private geoService: GeolocationService,
    private apiService: ApiService
  ) {}
  
  ngOnInit(): void {
    this.subscription.add(
      this.geoService.state$.subscribe(state => {
        this.geoState = state;
        
        if (state.error && typeof state.error !== 'string') {
          // Check if GPS is turned off (code 2 is POSITION_UNAVAILABLE)
          if (state.error.code === 2) {
            alert('GPS is turned off. Please enable location services to use this app.');
          }
        }
        
        // Save location if we have a position
        if (state.position && this.username) {
          this.saveLocation(state.position);
        }
      })
    );
    
    // Initial location request
    this.refreshLocation();
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
    }
    this.geoService.stopTracking();
  }
  
  toggleTracking(): void {
    if (this.geoState.isTracking) {
      this.geoService.stopTracking();
      if (this.saveInterval) {
        clearInterval(this.saveInterval);
        this.saveInterval = null;
      }
    } else {
      this.geoService.startTracking();
      
      // Setup interval to save location every 30 seconds
      this.saveInterval = setInterval(() => {
        if (this.geoState.position) {
          this.saveLocation(this.geoState.position);
        }
      }, 10000); // 10 seconds
    }
  }
  
  refreshLocation(): void {
    this.geoService.getCurrentPosition()
      .catch(error => {
        console.error('Error getting current position:', error);
      });
  }
  
  requestPermission(): void {
    this.refreshLocation();
  }
  
  saveLocation(position: GeolocationPosition): void {
    const locationData: UserLocation = {
      username: this.username,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: new Date(position.timestamp),
      accuracy: position.coords.accuracy
    };
    
    this.apiService.saveLocation(locationData).subscribe({
      next: (response) => {
        console.log('Location saved:', response);
      },
      error: (error) => {
        console.error('Error saving location:', error);
      }
    });
  }
  
  formatCoordinate(coord: number): string {
    return coord.toFixed(6);
  }
  
  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString();
  }
  
  getErrorMessage(): string {
    if (!this.geoState.error) return '';
    
    if (typeof this.geoState.error === 'string') {
      return this.geoState.error;
    }
    
    switch (this.geoState.error.code) {
      case 1: // PERMISSION_DENIED
        return 'Location permission denied. Please enable location access.';
      case 2: // POSITION_UNAVAILABLE
        return 'Location information is unavailable. Please check if GPS is enabled.';
      case 3: // TIMEOUT
        return 'Location request timed out. Please try again.';
      default:
        return 'Unknown error occurred while getting location.';
    }
  }
}
