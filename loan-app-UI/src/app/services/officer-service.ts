import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoanOfficer } from '../models/loan-officer';
import { LoanApplication } from '../models/loan-application';
import { LoanDocument } from '../models/loan-document';
import { CustomerQuery } from '../models/customer-query';
import { Repayment } from '../models/repayment';
import { EmailNotification } from '../models/email-notification';
import { PerformanceMetrics } from '../models/PerformanceMetrics';
import { AuditLogEntry } from '../models/AuditLog';

@Injectable({ providedIn: 'root' })
export class OfficerService {
  private readonly apiUrl = 'https://localhost:7262/api/officers';

  constructor(private http: HttpClient) {}

  // 🔍 Get officer by ID
  getOfficerById(id: number): Observable<LoanOfficer> {
    return this.http.get<LoanOfficer>(`${this.apiUrl}/${id}`);
  }

  // 📋 Get all officers
  getAllOfficers(): Observable<LoanOfficer[]> {
    return this.http.get<LoanOfficer[]>(this.apiUrl);
  }

  // 🔄 Update workload count
  updateWorkload(id: number, count: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/workload`, { count });
  }

  // ✅ Assign loan application
  assignLoanApplication(officerId: number, applicationId: number): Observable<LoanApplication> {
    return this.http.post<LoanApplication>(`${this.apiUrl}/${officerId}/assign-application`, { applicationId });
  }

  // 📤 Verify document
  verifyDocument(officerId: number, documentId: number): Observable<LoanDocument> {
    return this.http.patch<LoanDocument>(`${this.apiUrl}/${officerId}/verify-document`, { documentId });
  }

  // 📨 Respond to query
  respondToQuery(officerId: number, queryId: number, response: string): Observable<CustomerQuery> {
    return this.http.post<CustomerQuery>(`${this.apiUrl}/${officerId}/respond-query`, { queryId, response });
  }

  // 📊 Get assigned applications
  getAssignedApplications(officerId: number): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(`${this.apiUrl}/${officerId}/applications`);
  }

  // 📁 Get verified documents
  getVerifiedDocuments(officerId: number): Observable<LoanDocument[]> {
    return this.http.get<LoanDocument[]>(`${this.apiUrl}/${officerId}/documents`);
  }

  // ❓ Get handled queries
  getHandledQueries(officerId: number): Observable<CustomerQuery[]> {
    return this.http.get<CustomerQuery[]>(`${this.apiUrl}/${officerId}/queries`);
  }

  // 📈 Update performance rating
  updatePerformance(officerId: number, rating: number): Observable<LoanOfficer> {
    return this.http.patch<LoanOfficer>(`${this.apiUrl}/${officerId}/performance`, { rating });
  }

  // 🚫 Deactivate officer
  deactivateOfficer(officerId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${officerId}/deactivate`, {});
  }

  // ✅ Reactivate officer
  reactivateOfficer(officerId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${officerId}/reactivate`, {});
  }

  // 🧾 Audit log
  getAuditLog(officerId: number): Observable<AuditLogEntry[]> {
    return this.http.get<AuditLogEntry[]>(`${this.apiUrl}/${officerId}/audit-log`);
  }

  // 🖥️ Dashboard data
  getDashboardData(officerId: number): Observable<{
    applications: LoanApplication[];
    documents: LoanDocument[];
    queries: CustomerQuery[];
  }> {
    return this.http.get<{ applications: LoanApplication[]; documents: LoanDocument[]; queries: CustomerQuery[] }>(
      `${this.apiUrl}/${officerId}/dashboard`
    );
  }

  // ➕ Create officer
  createOfficer(payload: Partial<LoanOfficer>): Observable<LoanOfficer> {
    return this.http.post<LoanOfficer>(`${this.apiUrl}`, payload);
  }

  // ✏️ Update officer
  updateOfficer(id: number, payload: Partial<LoanOfficer>): Observable<LoanOfficer> {
    return this.http.put<LoanOfficer>(`${this.apiUrl}/${id}`, payload);
  }

  // 💰 Repayments
  getRepaymentsByOfficer(officerId: number): Observable<Repayment[]> {
    return this.http.get<Repayment[]>(`${this.apiUrl}/${officerId}/repayments`);
  }

  // 📧 Email notifications
  getEmailNotifications(officerId: number): Observable<EmailNotification[]> {
    return this.http.get<EmailNotification[]>(`${this.apiUrl}/${officerId}/email-notifications`);
  }

  // 📄 Documents for assigned applications
  getDocumentsForAssignedApplications(officerId: number): Observable<LoanDocument[]> {
    return this.http.get<LoanDocument[]>(`${this.apiUrl}/${officerId}/assigned-documents`);
  }

  // 📑 Document status & remarks
  updateDocumentStatus(documentId: number, payload: Partial<LoanDocument>): Observable<LoanDocument> {
    return this.http.patch<LoanDocument>(`${this.apiUrl}/documents/${documentId}/status`, payload);
  }

  updateDocumentRemarks(documentId: number, remarks: string): Observable<LoanDocument> {
    return this.http.patch<LoanDocument>(`${this.apiUrl}/documents/${documentId}/remarks`, {
      verificationRemarks: remarks,
    });
  }

  // 📊 Officer performance
  updateOfficerPerformance(officerId: number, rating: number): Observable<LoanOfficer> {
  const url = `${this.apiUrl}/officers/${officerId}/performance`;
  return this.http.patch<LoanOfficer>(url, { rating });
}
}
