import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoanDocument } from '../models/loan-document';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly apiUrl = 'https://localhost:7262/api/documents';

  constructor(private http: HttpClient) {}

  getDocumentsByApplication(appId: number): Observable<LoanDocument[]> {
    return this.http.get<LoanDocument[]>(`${this.apiUrl}/application/${appId}`);
  }

  verifyDocument(id: number, status: string, remarks: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/verify`, { status, remarks });
  }
  uploadDocument(payload: Partial<LoanDocument>): Observable<LoanDocument> {
  return this.http.post<LoanDocument>(this.apiUrl, payload);
  }
  getDocumentsByCustomer(customerId: number): Observable<LoanDocument[]> {
  return this.http.get<LoanDocument[]>(`${this.apiUrl}/customer/${customerId}`);
  }
  getAllDocuments(): Observable<LoanDocument[]> {
  return this.http.get<LoanDocument[]>(`${this.apiUrl}`);
  }
  getPendingDocuments(): Observable<LoanDocument[]> {
    return this.http.get<LoanDocument[]>(`${this.apiUrl}/pending`);
  }

  rejectDocument(id: number, status: string = 'Rejected', remarks: string = 'Document rejected'): Observable<void> {
  return this.http.patch<void>(`${this.apiUrl}/${id}/reject`, { status, remarks });
  }

}