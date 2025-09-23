import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = 'https://your-api-url.com/api/users'; // Replace with actual endpoint

  constructor(private http: HttpClient) {}

  /** Get current logged-in user profile */
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  /** Get user by ID (admin use) */
  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`);
  }

  /** Update user profile */
  updateUser(userId: number, payload: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}`, payload);
  }

  /** Soft delete user */
  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }

  /** List all users (admin use) */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}`);
  }
}