import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Auth } from './services/auth';
import { CustomerNavbar } from "./components/customer-navbar/customer-navbar";
import { OfficerNavbar } from "./components/officer-navbar/officer-navbar";
import { AdminNavbar } from "./components/admin-navbar/admin-navbar";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CustomerNavbar, OfficerNavbar, AdminNavbar],
  templateUrl: './app.html',
  styleUrls: ['./app.css'] 
})
export class App {
  protected readonly title = signal('loan-app-UI');

  constructor(public authService: Auth, private router: Router) {
    this.router.events.subscribe(event => {
      console.log('🧭 Navigation event:', event);
    });
  }

  logout(): void {
    this.authService.logout();
  }
}