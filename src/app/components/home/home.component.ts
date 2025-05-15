import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { UsernameDialogComponent } from '../username-dialog/username-dialog.component';
import { LocationDisplayComponent } from '../location-display/location-display.component';
import { LocationHistoryComponent } from '../location-history/location-history.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    UsernameDialogComponent, 
    LocationDisplayComponent,
    LocationHistoryComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  username: string | null = null;
  
  constructor(private userService: UserService) {}
  
  ngOnInit(): void {
    this.userService.username$.subscribe(name => {
      this.username = name;
    });
  }
  
  onUsernameSubmitted(username: string): void {
    this.username = username;
  }
  
  logout(): void {
    this.userService.clearUsername();
    this.username = null;
  }
}