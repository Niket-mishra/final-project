import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
  sub: string;
  role: string;
  userId: number;
  email: string;
  name?: string;
}

@Injectable({ providedIn: 'root' })
export class TokenService {
  getToken(): string | null {
    return localStorage.getItem('auth_token');
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

  isTokenExpired(): boolean {
    const decoded = this.getDecodedToken();
    if (!decoded) return true;
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  }

  getUserName(): string {
    return this.getDecodedToken()?.name ?? 'User';
  }

  getUserRole(): string {
    return this.getDecodedToken()?.role ?? '';
  }

  getUserId(): number {
    return this.getDecodedToken()?.userId ?? 0;
  }

  clear(): void {
    localStorage.clear();
  }
}