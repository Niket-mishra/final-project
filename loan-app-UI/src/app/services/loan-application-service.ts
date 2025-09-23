import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoanApplication, ApplicationStatus } from '../models/loan-application';
import { ApplicationSummary } from '../models/application-summary';

@Injectable({ providedIn: 'root' })
export class LoanApplicationService {
 
  private readonly apiUrl = 'https://your-api-url.com/api/loan-applications';

  constructor(private http: HttpClient) {}

  getApplicationsByCustomer(customerId: number): Observable<LoanApplication[]> {
  return this.http.get<LoanApplication[]>(`${this.apiUrl}/customer/${customerId}`);
  }

  // 🔍 Get all applications
  getAll(): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(this.apiUrl);
  }

  // 🔍 Get application by ID
  getById(id: number): Observable<LoanApplication> {
    return this.http.get<LoanApplication>(`${this.apiUrl}/${id}`);
  }

  // 📝 Submit new application
  submitApplication(payload: Partial<LoanApplication>): Observable<LoanApplication> {
    return this.http.post<LoanApplication>(this.apiUrl, payload);
  }

  // 🔄 Update application status
  updateStatus(id: number, status: ApplicationStatus, remarks?: string): Observable<LoanApplication> {
    return this.http.patch<LoanApplication>(`${this.apiUrl}/${id}/status`, { status, remarks });
  }

  // 👤 Assign loan officer
  assignOfficer(id: number, officerId: number): Observable<LoanApplication> {
    return this.http.patch<LoanApplication>(`${this.apiUrl}/${id}/assign`, { officerId });
  }

  // 🗑️ Delete application
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ✏️ Update full application (used in edit modal)
  updateApplication(id: number, payload: Partial<LoanApplication>): Observable<LoanApplication> {
    return this.http.put<LoanApplication>(`${this.apiUrl}/${id}`, payload);
  }

  // 📊 Get applications by status (for filtering dashboards)
  getByStatus(status: ApplicationStatus): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(`${this.apiUrl}/status/${status}`);
  }

  // 📅 Get applications by date range (for analytics)
  getByDateRange(start: string, end: string): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(`${this.apiUrl}?startDate=${start}&endDate=${end}`);
  }

  // 🔍 Search applications by customer name or ID
  search(query: string): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(`${this.apiUrl}/search?q=${query}`);
  }

  // 📜 Get audit log for an application
  getAuditLog(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/audit-log`);
  }

  getRecentApplications(customerId: number): Observable<LoanApplication[]> {
  return this.http.get<LoanApplication[]>(`${this.apiUrl}/customer/${customerId}/recent`);
  }

  getApplicationsWithStatus(customerId: number, status: ApplicationStatus): Observable<LoanApplication[]> {
  return this.http.get<LoanApplication[]>(`${this.apiUrl}/customer/${customerId}/status/${status}`);
  }

  getApplicationSummary(customerId: number): Observable<ApplicationSummary> {
  return this.http.get<ApplicationSummary>(`${this.apiUrl}/customer/${customerId}/summary`);
  }

}