import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CustomerQuery } from '../models/customer-query';

@Injectable({ providedIn: 'root' })
export class QueryService {
  private readonly apiUrl = 'https://localhost:7262/api/queries';

  constructor(private http: HttpClient) {}

  getQueriesByCustomer(customerId: number): Observable<CustomerQuery[]> {
  return this.http.get<CustomerQuery[]>(`${this.apiUrl}/customer/${customerId}`);
}
  respondToQuery(queryId: number, response: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${queryId}/respond`, { response });
  }
}