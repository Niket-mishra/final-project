import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Auth } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('loan-app-UI');
  constructor(public authService: Auth,private router: Router) {
     this.router.events.subscribe(event => {
    console.log('🧭 Navigation event:', event);
  });
  }

  logout(): void {
    this.authService.logout();
  }
 
}
