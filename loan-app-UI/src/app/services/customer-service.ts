import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer } from '../models/customer';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly apiUrl = 'https://your-api-url.com/api/customers';

  constructor(private http: HttpClient) {}

  getCustomerById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`);
  }

  getAllCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.apiUrl);
  }

  updateCustomer(id: number, payload: Partial<Customer>): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/${id}`, payload);
  }

  verifyCustomer(id: number): Observable<Customer> {
    return this.http.patch<Customer>(`${this.apiUrl}/${id}/verify`, {});
  }

  rejectCustomer(id: number, reason: string): Observable<Customer> {
    return this.http.patch<Customer>(`${this.apiUrl}/${id}/reject`, { reason });
  }

  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}