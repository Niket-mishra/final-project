import { Injectable, NgZone, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class Auth {
  // 🏠 API Base URL
  private readonly apiUrl = 'https://localhost:7262';

  // 🧠 Reactive login state
  private loggedIn = signal(this.isLoggedIn());
  isLoggedInSignal = this.loggedIn;

   

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService,
    private zone: NgZone
  ) {}

  // 🔐 Login
  login(username: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(
      `${this.apiUrl}/login`,
      {
        Username: username,
        PasswordHash: password
      }
    ).pipe(
      tap((res) => {
        const token = res.token;
        console.log('🔐 Token:', token);
        this.storeDecodedToken(token);
        this.updateLoginState();
        console.log('🎯 Redirecting to:', this.getDashboardRoute());
        this.toast('Login successful');

        this.zone.run(() => {
          this.router.navigate([this.getDashboardRoute()]);
        });
      })
    );
  }

  // 🔓 Logout
  logout(): void {
    localStorage.clear();
    this.updateLoginState();
    this.toast('Logged out', 'success');
    this.router.navigate(['/auth/login']);
  }

  // 🧠 Token Storage
  private storeDecodedToken(token: string): void {
    try {
      const decoded: any = jwtDecode(token);
      console.log('🧠 Decoded token:', decoded);

      const role =
        decoded.role ||
        decoded.Role ||
        decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

      const userId =
        decoded.userId ||
        decoded.UserId ||
        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

      const email =
        decoded.email ||
        decoded.UserEmail ||
        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];

      const name =
        decoded.name ||
        decoded.UserName ||
        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
        decoded.sub;

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_role', role ?? '');
      localStorage.setItem('user_email', email ?? '');
      localStorage.setItem('user_id', userId?.toString() ?? '');
      localStorage.setItem('user_name', name ?? 'User');
    } catch (err) {
      console.error('❌ Token decode failed:', err);
    }
  }

  // 🔄 Login State Sync
  updateLoginState(): void {
    this.loggedIn.set(this.isLoggedIn());
  }

  // 🔍 Accessors
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

  getUserName(): string {
    return localStorage.getItem('user_name') ?? 'User';
  }

  getDecodedToken(): any | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  }

  getCurrentUser(): { userId: number; role: string; email: string; name?: string } | null {
    const decoded = this.getDecodedToken();
    if (!decoded) return null;
    return {
      userId: this.getUserId() ?? 0,
      role: this.getUserRole() ?? '',
      email: this.getUserEmail() ?? '',
      name: this.getUserName()
    };
  }

  // ⏳ Expiry Check
  isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
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
        this.logout();
      }
    }, intervalMs);
  }

  // 🎯 Role-Based Routing
  getDashboardRoute(): string {
    const role = this.getUserRole()?.toLowerCase();
    console.log('🎯 Normalized role:', role);

    switch (role) {
      case 'admin': return '/admin/dashboard';
      case 'loanofficer': return '/officer/dashboard';
      case 'customer': return '/customer/dashboard';
      default: return '/auth/login';
    }
  }

  redirectByRole(): void {
    this.zone.run(() => {
      this.router.navigate([this.getDashboardRoute()]);
    });
  }

  // 🎨 Toast Feedback
  toast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastr[type](message, 'Auth');
  }

   register(payload: any): Observable<{ token: string }> {
  return this.http.post<{ token: string }>(`${this.apiUrl}/api/auth/register`, payload).pipe(
    tap({
      next: (res) => {
        const token = res.token;
        console.log('🔐 Token received:', token);

        this.storeDecodedToken(token);
        this.updateLoginState();

        this.toast('Registration successful', 'success');
        console.log('🎯 Redirecting to:', this.getDashboardRoute());

        this.zone.run(() => {
          this.router.navigate([this.getDashboardRoute()]);
        });
      },
      error: (err) => {
        console.error('❌ Registration failed:', err);
        this.toast('Registration failed', 'error');
      }
    })
  );
}


  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/auth/request-password-reset`, { email });
  }
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, {
      token,
      newPassword,
    });
  }

}