import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';

export interface AuthResponse {
  userId: number;
  email: string;
  role: 'Admin' | 'LoanOfficer' | 'Customer';
  token: string;
}

interface JwtPayload {
  exp: number;
  sub: string;
  role: string;
  userId: number;
  email: string;
  name?: string;
}

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly apiUrl = 'https://your-api-url.com/api/auth';

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {}

  // 🔐 Login
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res) => this.storeToken(res))
    );
  }

  // 🔄 Refresh
  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, {}).pipe(
      tap((res) => {
        this.storeToken(res);
        this.toast('Session refreshed');
      })
    );
  }

  // 🔓 Logout
  logout(): void {
    localStorage.clear();
    this.toast('Logged out', 'success');
    this.router.navigate(['/login']);
  }

  // 🧠 Token Storage
  private storeToken(res: AuthResponse): void {
    localStorage.setItem('auth_token', res.token);
    localStorage.setItem('user_role', res.role);
    localStorage.setItem('user_email', res.email);
    localStorage.setItem('user_id', res.userId.toString());
  }

  // 🔍 Token Access
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getUserRole(): string | null {
    return localStorage.getItem('user_role');
  }

  getUserEmail(): string | null {
    return localStorage.getItem('user_email');
  }

  getUserId(): number | null {
    const id = localStorage.getItem('user_id');
    return id ? parseInt(id, 10) : null;
  }

  getDecodedToken(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return jwtDecode<JwtPayload>(token);
    } catch {
      return null;
    }
  }

  getUserName(): string {
    return this.getDecodedToken()?.name ?? 'User';
  }

  // ⏳ Expiry Check
  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp < now;
    } catch {
      return true;
    }
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  // 🔄 Auto Refresh
  autoRefresh(intervalMs: number = 5 * 60 * 1000): void {
    setInterval(() => {
      const token = this.getToken();
      if (token && this.isTokenExpired(token)) {
        this.refreshToken().subscribe({
          error: () => this.logout()
        });
      }
    }, intervalMs);
  }

  // 🎯 Role-Based Routing
  redirectByRole(): void {
    const role = this.getUserRole();
    switch (role) {
      case 'Admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'LoanOfficer':
        this.router.navigate(['/officer/dashboard']);
        break;
      case 'Customer':
        this.router.navigate(['/customer/home']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }

  // 🎨 Toast Feedback
  toast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastr[type](message, 'Auth');
  }

  getCurrentUser(): { userId: number; role: string; email: string; name?: string } | null {
  const token = this.getDecodedToken();
  if (!token) return null;
  return {
    userId: token.userId,
    role: token.role,
    email: token.email,
    name: token.name
  };
}
}