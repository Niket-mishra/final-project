import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer } from '../models/customer';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly apiUrl = 'https://localhost:7262/api/Customers';

  constructor(private http: HttpClient) {}

  getCustomerById(id: number): Observable<Customer> {
    console.log('Fetching customer with ID:', id);
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
  getCurrentCustomer(): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/me`);
  }
}