import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoanScheme } from '../models/loan-scheme';

@Injectable({ providedIn: 'root' })
export class LoanSchemeService {
  private readonly apiUrl = 'https://localhost:7262/api/schemes';

  constructor(private http: HttpClient) {}

  getLoanSchemes(): Observable<LoanScheme[]> {
    return this.http.get<LoanScheme[]>(this.apiUrl);
  }

  getLoanSchemeById(id: number): Observable<LoanScheme> {
    return this.http.get<LoanScheme>(`${this.apiUrl}/${id}`);
  }

  createLoanScheme(payload: LoanScheme): Observable<LoanScheme> {
    return this.http.post<LoanScheme>(this.apiUrl, payload);
  }

  updateLoanScheme(payload: LoanScheme): Observable<LoanScheme> {
    return this.http.put<LoanScheme>(`${this.apiUrl}/${payload.schemeId}`, payload);
  }

  deleteLoanScheme(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // 🔄 Batch update for admin edits
  bulkUpdateSchemes(schemes: LoanScheme[]): Observable<LoanScheme[]> {
    return this.http.put<LoanScheme[]>(`${this.apiUrl}/bulk-update`, schemes);
  }

  // 🎯 Role-based dashboard filtering
  getSchemesCreatedBy(adminId: number): Observable<LoanScheme[]> {
    return this.http.get<LoanScheme[]>(`${this.apiUrl}/created-by/${adminId}`);
  }

  // 🧩 Personalized recommendations
  getRecommendedSchemesForCustomer(customerId: number): Observable<LoanScheme[]> {
    return this.http.get<LoanScheme[]>(`${this.apiUrl}/recommendations/${customerId}`);
  }

  // 📊 Analytics
  getSchemeStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }

  // 🔍 Search
  searchSchemes(query: string): Observable<LoanScheme[]> {
    return this.http.get<LoanScheme[]>(`${this.apiUrl}/search?q=${encodeURIComponent(query)}`);
  }
}