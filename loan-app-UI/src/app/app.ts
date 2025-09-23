import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Auth } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('loan-app-UI');
  constructor(public authService: Auth) {}

  logout(): void {
    this.authService.logout();
  }

  toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}
}
