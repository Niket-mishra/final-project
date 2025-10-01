import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmailNotification } from '../models/email-notification';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly apiUrl = 'https://localhost:7262/api/notifications';

  constructor(private http: HttpClient) {}

  sendNotification(payload: EmailNotification): Observable<void> {
    return this.http.post<void>(this.apiUrl, payload);
  }

  getNotificationsByUser(userId: number): Observable<EmailNotification[]> {
    return this.http.get<EmailNotification[]>(`${this.apiUrl}/user/${userId}`);
  }
  getAllNotifications(): Observable<EmailNotification[]> {
  return this.http.get<EmailNotification[]>(`${this.apiUrl}`);
  }
  sendNotificationByUser(id: number): Observable<void> {
  return this.http.post<void>(`${this.apiUrl}/${id}/send`, {});
  }
}