import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Repayment } from '../models/repayment';

@Injectable({ providedIn: 'root' })
export class RepaymentService {
  private readonly apiUrl = 'https://your-api.com/api/repayments';

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
}