import { Component, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-admin-navbar',
  imports: [RouterLink],
  standalone: true,
  templateUrl: './admin-navbar.html',
  styleUrl: './admin-navbar.css'
})
export class AdminNavbar {
  constructor(public authService: Auth) {}

  logout(): void {
    this.authService.logout();
  }

  

}
