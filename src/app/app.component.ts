import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [
    `
    main {
      height: 100%;
      width: 100%;
    }
    `
  ]
})
export class AppComponent {
  title = 'GPS Tracker';
}