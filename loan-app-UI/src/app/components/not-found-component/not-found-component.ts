import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-not-found-component',
  imports: [],
  templateUrl: './not-found-component.html',
  styleUrl: './not-found-component.css'
})
export class NotFoundComponent {
  constructor(private router: Router, private auth: Auth) {}

  goHome(): void {
    const dashboardRoute = this.auth.getDashboardRoute();
    if (dashboardRoute) {
      this.router.navigate([dashboardRoute]);
      return;
    }
    else {
    this.router.navigate(['auth/login']); // or role-aware redirect
    }
  }

}
