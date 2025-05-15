import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { LocationHistory } from '../../models/user-location.model';

@Component({
  selector: 'app-location-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="history-container">
      <div class="card history-card">
        <h2>Location History</h2>
        
        <div *ngIf="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading history...</p>
        </div>
        
        <div *ngIf="!isLoading && !history?.locations?.length" class="empty-state">
          <p>No location history found</p>
        </div>
        
        <div *ngIf="!isLoading && history?.locations?.length" class="history-list">
          <div class="history-item"  *ngFor="let location of history?.locations">
            <div class="history-coords">
              <span>{{ formatCoordinate(location.latitude) }}, {{ formatCoordinate(location.longitude) }}</span>
            </div>
            <div class="history-time">
              {{ formatDateTime(location.timestamp) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .history-card {
      margin-top: var(--space-4);
    }
    
    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100px;
      color: var(--neutral-500);
    }
    
    .history-list {
      max-height: 300px;
      overflow-y: auto;
      border-radius: 8px;
      border: 1px solid var(--neutral-200);
    }
    
    .history-item {
      padding: var(--space-3);
      border-bottom: 1px solid var(--neutral-200);
      display: flex;
      flex-direction: column;
    }
    
    .history-item:last-child {
      border-bottom: none;
    }
    
    .history-coords {
      font-weight: 500;
    }
    
    .history-time {
      font-size: 0.875rem;
      color: var(--neutral-500);
    }
    `
  ]
})
export class LocationHistoryComponent implements OnInit {
  @Input() username!: string;
  
  history: LocationHistory | null = null;
  isLoading: boolean = true;
  
  constructor(private apiService: ApiService) {}
  
  ngOnInit(): void {
    this.loadHistory();
  }
  
  loadHistory(): void {
    this.isLoading = true;
    
    this.apiService.getLocationHistory(this.username).subscribe({
      next: (data) => {
        this.history = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading location history:', error);
        this.isLoading = false;
      }
    });
  }
  
  formatCoordinate(coord: number): string {
    return coord.toFixed(6);
  }
  
  formatDateTime(timestamp: string | Date): string {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleString();
  }
}
