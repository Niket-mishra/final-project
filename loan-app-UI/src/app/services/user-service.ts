import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { User } from "../models/user";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = 'https://localhost:7262/api/users'; 

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

  /** Update user role (admin use) */
  updateUserRole(userId: number, role: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${userId}/role`, { role });
  }

  /** Soft delete user */
  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }

  /** List all users (admin use) */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}`);
  }

  getRoleEntityId(userId: number): Observable<{ roleEntityId: number }> {
    return this.http.get<{ roleEntityId: number }>(`${this.apiUrl}/role-id/${userId}`);
  }

}