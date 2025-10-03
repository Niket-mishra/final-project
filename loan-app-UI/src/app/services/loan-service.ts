import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Loan } from '../models/loan';
import { LoanApplication } from '../models/loan-application';

@Injectable({ providedIn: 'root' })
export class LoanService {
  private readonly apiUrl = 'https://localhost:7262/api/Loan';

  constructor(private http: HttpClient) {}

  getLoanById(id: number): Observable<Loan> {
    return this.http.get<Loan>(`${this.apiUrl}/${id}`);
  }

  getAllLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(this.apiUrl);
  }

  updateLoan(id: number, payload: Partial<Loan>): Observable<Loan> {
    return this.http.put<Loan>(`${this.apiUrl}/${id}`, payload);
  }

  createLoan(payload: Loan): Observable<Loan> {
    return this.http.post<Loan>(this.apiUrl, payload);
  }

  getLoanByApplication(applicationId: number): Observable<Loan> {
  return this.http.get<Loan>(`${this.apiUrl}/application/${applicationId}`);
  }
 
 
}