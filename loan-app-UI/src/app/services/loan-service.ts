import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Loan } from '../models/loan';

@Injectable({ providedIn: 'root' })
export class LoanService {
  private readonly apiUrl = 'https://your-api.com/api/loans';

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
}