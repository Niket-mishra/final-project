import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-unauthorized',
  imports: [],
  templateUrl: './unauthorized.html',
  styleUrl: './unauthorized.css'
})
export class Unauthorized {
 constructor(private router: Router, private auth: Auth) {}

 

  goHome(): void {
    const defaultRoute = this.auth.getDashboardRoute() || '/';
    this.router.navigate([defaultRoute]);
  }

}
