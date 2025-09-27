import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private http: HttpClient) {}

  createOrder(amount: number): Observable<any> {
    // Replace with your backend endpoint
    return this.http.post('/api/payments/create-order', { amount });
  }

  verifyPayment(paymentDetails: any): Observable<any> {
    // Replace with your backend endpoint
    return this.http.post('/api/payments/verify', paymentDetails);
  }

  getPaymentHistory(userId: number): Observable<any[]> {
    // Replace with your backend endpoint
    return this.http.get<any[]>(`/api/payments/history/${userId}`);
  }
}