import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-officer-navbar',
  imports: [RouterLink],
  templateUrl: './officer-navbar.html',
  styleUrl: './officer-navbar.css'
})
export class OfficerNavbar {
  constructor(public authService: Auth) {}

  logout(): void {
    this.authService.logout();
  }

}
