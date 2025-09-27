import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-customer-navbar',
  imports: [RouterLink],
  templateUrl: './customer-navbar.html',
  styleUrl: './customer-navbar.css'
})
export class CustomerNavbar {

  constructor(public authService: Auth) {}

  logout(): void {
    this.authService.logout();
  }

}
