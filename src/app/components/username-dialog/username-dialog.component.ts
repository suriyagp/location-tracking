import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-username-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop fade-in">
      <div class="modal slide-up">
        <h2>Modal namer</h2>
        <p>username:</p>
        
        <form (ngSubmit)="submitUsername()">
          <input 
            type="text" 
            [(ngModel)]="username" 
            name="username" 
            placeholder="Username" 
            required 
            [disabled]="isLoading"
            autocapitalize="off"
            autocomplete="off">
          
          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          
          <div *ngIf="isLoading" class="spinner"></div>
          
          <button 
            type="submit" 
            class="btn-primary" 
            [disabled]="!username || isLoading">
            Continue
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
    .error-message {
      color: var(--warning);
      margin-bottom: var(--space-3);
      font-size: 0.875rem;
    }
    
    form {
      display: flex;
      flex-direction: column;
    }
    
    button {
      margin-top: var(--space-2);
    }
    `
  ]
})
export class UsernameDialogComponent {
  @Output() usernameSubmitted = new EventEmitter<string>();
  
  username: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  
  constructor(private userService: UserService) {}
  
  submitUsername(): void {
    if (!this.username || this.username.trim() === '') {
      this.errorMessage = 'Username cannot be empty';
      return;
    }
    
    this.errorMessage = '';
    this.isLoading = true;
    
    // Store username and emit event
    this.userService.saveUsername(this.username);
    this.usernameSubmitted.emit(this.username);
    this.isLoading = false;
  }
}