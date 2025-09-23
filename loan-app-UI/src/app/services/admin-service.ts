import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoanAdmin } from '../models/loan-admin';
import { LoanOfficer } from '../models/loan-officer';
import { LoanScheme } from '../models/loan-scheme';
import { Report } from '../models/report';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly apiUrl = 'https://your-api.com/api/admins';

  constructor(private http: HttpClient) {}

  // 🔍 Get admin by ID
  getAdminById(id: number): Observable<LoanAdmin> {
    return this.http.get<LoanAdmin>(`${this.apiUrl}/${id}`);
  }

  // 📋 Get all admins
  getAllAdmins(): Observable<LoanAdmin[]> {
    return this.http.get<LoanAdmin[]>(this.apiUrl);
  }

  // 🧑‍💼 Assign officer to admin
  assignOfficer(adminId: number, officerId: number): Observable<LoanOfficer> {
    return this.http.post<LoanOfficer>(`${this.apiUrl}/${adminId}/assign-officer`, { officerId });
  }

  // 🗂️ Create new loan scheme
  createLoanScheme(adminId: number, scheme: Partial<LoanScheme>): Observable<LoanScheme> {
    return this.http.post<LoanScheme>(`${this.apiUrl}/${adminId}/loan-schemes`, scheme);
  }

  // ✏️ Update loan scheme
  updateLoanScheme(adminId: number, schemeId: number, scheme: Partial<LoanScheme>): Observable<LoanScheme> {
    return this.http.put<LoanScheme>(`${this.apiUrl}/${adminId}/loan-schemes/${schemeId}`, scheme);
  }

  // ❌ Delete loan scheme
  deleteLoanScheme(adminId: number, schemeId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${adminId}/loan-schemes/${schemeId}`);
  }

  // 📊 Generate report
  generateReport(adminId: number, type: string, range?: { start: string; end: string }): Observable<Report> {
    return this.http.post<Report>(`${this.apiUrl}/${adminId}/reports`, { type, ...range });
  }

  // 📁 Get all reports
  getReports(adminId: number): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.apiUrl}/${adminId}/reports`);
  }

  // 🔄 Update admin profile
  updateAdmin(adminId: number, payload: Partial<LoanAdmin>): Observable<LoanAdmin> {
    return this.http.put<LoanAdmin>(`${this.apiUrl}/${adminId}`, payload);
  }

  // 🚫 Deactivate admin
  deactivateAdmin(adminId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${adminId}/deactivate`, {});
  }

  // ✅ Reactivate admin
  reactivateAdmin(adminId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${adminId}/reactivate`, {});
  }

  // 🧾 Audit log for admin actions
  getAuditLog(adminId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${adminId}/audit-log`);
  }
}