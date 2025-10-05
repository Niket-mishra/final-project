import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Repayment } from '../models/repayment';

@Injectable({ providedIn: 'root' })
export class RepaymentService {
  
  private readonly apiUrl = 'https://localhost:7262/api/Repayment';

  constructor(private http: HttpClient) {}

  getRepaymentById(id: number): Observable<Repayment> {
    return this.http.get<Repayment>(`${this.apiUrl}/${id}`);
  }

  getRepaymentsByLoan(loanId: number): Observable<Repayment[]> {
    return this.http.get<Repayment[]>(`${this.apiUrl}/loan/${loanId}`);
  }

  createRepayment(payload: Repayment): Observable<Repayment> {
    return this.http.post<Repayment>(this.apiUrl, payload);
  }
  getRepaymentsByCustomer(customerId: number): Observable<Repayment[]> {
  return this.http.get<Repayment[]>(`${this.apiUrl}/customer/${customerId}`);
  }
  getAllRepayments(): Observable<Repayment[]> {
  return this.http.get<Repayment[]>(`${this.apiUrl}`);
  }
  updateRepayment(repaymentId: number, updatedRepayment: Partial<Repayment>): Observable<Repayment> {
  const url = `${this.apiUrl}/repayments/${repaymentId}`;
  return this.http.put<Repayment>(url, updatedRepayment);
}
}